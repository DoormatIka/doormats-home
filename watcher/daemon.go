package main

import (
	"log"
	"os"
	"os/exec"
	"syscall"
	"sync"
	"context"
	"time"
)


type CommandManager struct {
	mutex       sync.Mutex
	cancels     []context.CancelFunc
	wg          sync.WaitGroup
	parentCtx   context.Context
}

func NewCommandManager(ctx context.Context) *CommandManager {
	return &CommandManager{parentCtx: ctx}
}

func (m *CommandManager) RunCommand(cwd string, name string, arg ...string) {
	ctx, cancel := context.WithCancel(m.parentCtx)

	cmd := exec.CommandContext(ctx, name, arg...)
	cmd.Dir = cwd
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.WaitDelay = 5 * time.Second
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Cancel = func() error {
		return syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL)
	}

	m.mutex.Lock()
	m.cancels = append(m.cancels, cancel)
	m.mutex.Unlock()

	m.wg.Go(func () {
		if err := cmd.Run(); err != nil {
			log.Printf("command finished with error: %v", err)
		}
	})
}

// StopAll cancels every tracked command and blocks until they've
// all actually exited.
func (m *CommandManager) StopAll() {
	m.mutex.Lock()
	cancels := m.cancels
	m.cancels = nil
	m.mutex.Unlock()

	for _, cancel := range cancels {
		cancel()
	}
	m.wg.Wait() // block until all cmd.Run() calls have returned
}
