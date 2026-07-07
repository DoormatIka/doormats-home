package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

var latest_commit = ""

var client = http.Client{
	Timeout: time.Second * 5,
}

type Commit struct {
	SHA    string `json:"sha"`
	Commit struct {
		Message string `json:"message"`
		Author  struct {
			Name string `json:"name"`
			Date string `json:"date"`
		} `json:"author"`
	} `json:"commit"`
}

type Config struct {
	Owner string `json:"owner"`
	Repo string `json:"repo"`
	CommitFile string `json:"commit_file"`
	Web struct {
		From string `json:"from"`
		To string `json:"to"`
		Excluding []string `json:"excluding"`
		Commands [][]string `json:"commands"`
	} `json:"web"`
	Server struct {
		From string `json:"from"`
		To string `json:"to"`
		Excluding []string `json:"excluding"`
		Commands [][]string `json:"commands"`
	} `json:"server"`
}


func main() {
	config := readJSONConfig("config.json")

	setLocalCommit(config)
	tickerUpdate(config)
}

func readJSONConfig(filepath string) Config {
	fileBytes, err := os.ReadFile(filepath)
	if err != nil {
		log.Fatalf("Failed to read file: %s", err)
	}

	var config Config

	err = json.Unmarshal(fileBytes, &config)
	if err != nil {
		log.Fatalf("Failed to unmarshal JSON: %s", err)
	}

	return config
}

func tickerUpdate(config Config) {
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()
	fmt.Println("Starting checker.")

	for range ticker.C {
		fmt.Printf("Checking %s at %s.\n", config.Repo, time.Now().Format(time.DateTime))
		commit, gitErr := grabLatestGitCommit(config)
		if gitErr != nil {
			log.Printf("[WARN] Cannot access latest git commit!")
			continue
		}

		if commit.SHA != latest_commit {
			fmt.Printf("Changes detected! \"%s\"\n", commit.Commit.Message)

			writeErr := os.WriteFile(config.CommitFile, []byte(commit.SHA), 0644)
			setLocalCommit(config)

			if err := gitToAssignedFolders(commit.SHA, config); err != nil {
				log.Fatalf("gitToAssignedFolders failed: %v", err)
			}


			if writeErr != nil {
				log.Fatalf("Failed to write to file: %s", writeErr)
			}
		}

	}

}

func setLocalCommit(config Config)  {
	sha_bytes, readErr := os.ReadFile(config.CommitFile)
	if readErr != nil {
		log.Printf("Failed to read file: %s, defaulting to no latest commit.", readErr)
	}
	latest_commit = string(sha_bytes)
}


func gitToAssignedFolders(commit string, config Config) error {
	tmpFolder, err := os.MkdirTemp("", "github-folder-*")
	if err != nil {
		return fmt.Errorf("creating temp folder: %w", err)
	}
	fmt.Printf("Temporary folder created at: %s\n", tmpFolder)
	defer os.RemoveAll(tmpFolder)

	repoURL := fmt.Sprintf("https://github.com/%s/%s.git", config.Owner, config.Repo)
	cloneGitToFolder(repoURL, commit, tmpFolder)
	moveWebServerFolders(config, tmpFolder)

	return nil
}

func cloneGitToFolder(repo string, commit string, tmpFolder string) error {
	steps := [][]string{
		{"init"},
		{"remote", "add", "origin", repo},
		{"fetch", "--depth", "1", "origin", commit},
		{"checkout", "FETCH_HEAD"},
		{"lfs", "pull"},
	}

	for _, args := range steps {
		cmd := exec.Command("git", args...)
		cmd.Dir = tmpFolder
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		if err := cmd.Run(); err != nil {
			return fmt.Errorf("git %s: %w", strings.Join(args, " "), err)
		}
	}
	return nil
}

func moveWebServerFolders(config Config, tmpFolder string) (error) {
	if err := moveFolderIntoAssigned(filepath.Join(tmpFolder, config.Web.From), config.Web.To, config.Web.Excluding); err != nil {
		return fmt.Errorf("moving web folder: %w", err)
	}
	if err := moveFolderIntoAssigned(filepath.Join(tmpFolder, config.Server.From), config.Server.To, config.Server.Excluding); err != nil {
		return fmt.Errorf("moving server folder: %w", err)
	}
	return nil
}



func clearAssignedPath(assignedPath string) error {
	if err := os.MkdirAll(assignedPath, 0o755); err != nil {
		return fmt.Errorf("ensuring assigned path exists: %w", err)
	}

	entries, err := os.ReadDir(assignedPath)
	if err != nil {
		return fmt.Errorf("reading assigned path: %w", err)
	}

	for _, entry := range entries {
		if err := os.RemoveAll(filepath.Join(assignedPath, entry.Name())); err != nil {
			return fmt.Errorf("clearing %s: %w", entry.Name(), err)
		}
	}

	return nil
}

func moveFolderIntoAssigned(originalPath string, assignedPath string, excludedPaths []string) error {
	if err := clearAssignedPath(assignedPath); err != nil {
		return err
	}

	excluded := make(map[string]bool, len(excludedPaths))
	for _, p := range excludedPaths {
		excluded[filepath.Clean(p)] = true
	}

	if err := moveTree(originalPath, assignedPath, originalPath, excluded); err != nil {
		return err
	}

	fmt.Println("Folder moved successfully (excluding specified files)!")
	return nil
}

// moveTree recursively moves the contents of src into dst, skipping any
// entry whose path relative to root matches something in excluded.
func moveTree(src, dst, root string, excluded map[string]bool) error {
	entries, err := os.ReadDir(src)
	if err != nil {
		return fmt.Errorf("reading %s: %w", src, err)
	}

	if err := os.MkdirAll(dst, 0o755); err != nil {
		return fmt.Errorf("creating %s: %w", dst, err)
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		relPath, err := filepath.Rel(root, srcPath)
		if err != nil {
			return fmt.Errorf("computing relative path for %s: %w", srcPath, err)
		}
		relPath = filepath.Clean(relPath)

		if excluded[relPath] {
			continue // leave this file/folder behind entirely
		}

		if entry.IsDir() {
			if err := moveTree(srcPath, dstPath, root, excluded); err != nil {
				return err
			}
			continue
		}

		if err := moveEntry(srcPath, dstPath); err != nil {
			return fmt.Errorf("moving %s: %w", srcPath, err)
		}
	}

	return nil
}

func moveEntry(src, dst string) error {
	err := os.Rename(src, dst)
	if err == nil {
		return nil
	}
	if !errors.Is(err, syscall.EXDEV) {
		return fmt.Errorf("renaming %s to %s: %w", src, dst, err)
	}

	// fall back to copy then remove for cross-device error.
	info, statErr := os.Lstat(src)
	if statErr != nil {
		return fmt.Errorf("stat %s: %w", src, statErr)
	}

	if info.IsDir() {
		if err := copyDir(src, dst); err != nil {
			return fmt.Errorf("copying dir %s to %s: %w", src, dst, err)
		}
	} else {
		if err := copyFile(src, dst, info.Mode()); err != nil {
			return fmt.Errorf("copying file %s to %s: %w", src, dst, err)
		}
	}

	if err := os.RemoveAll(src); err != nil {
		return fmt.Errorf("removing source %s after copy: %w", src, err)
	}
	return nil
}

func copyFile(src, dst string, mode os.FileMode) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.OpenFile(dst, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, mode)
	if err != nil {
		return err
	}
	defer out.Close()

	if _, err := io.Copy(out, in); err != nil {
		return err
	}
	return out.Sync()
}

func copyDir(src, dst string) error {
	info, err := os.Stat(src)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(dst, info.Mode()); err != nil {
		return err
	}

	entries, err := os.ReadDir(src)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		if entry.IsDir() {
			if err := copyDir(srcPath, dstPath); err != nil {
				return err
			}
		} else {
			entryInfo, err := entry.Info()
			if err != nil {
				return err
			}
			if err := copyFile(srcPath, dstPath, entryInfo.Mode()); err != nil {
				return err
			}
		}
	}
	return nil
}

func grabLatestGitCommit(config Config) (*Commit, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/commits", config.Owner, config.Repo)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		log.Fatal(err)
	}

	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("X-GitHub-Api-Version", "2026-03-10")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36")


	res, getErr := client.Do(req)
	if getErr != nil {
		return nil, getErr
	}
	if res.Body != nil {
		defer res.Body.Close()
	}

	body, readErr := io.ReadAll(res.Body)
	if readErr != nil {
		return nil, readErr
	}

	
	var commits []Commit
	if err := json.Unmarshal(body, &commits); err != nil {
		return nil, err
	}

	return &commits[0], nil
}


func checkGithub() bool {
	err := os.WriteFile("latest-commit", []byte(latest_commit), 0644)
	if err != nil {
		log.Fatal(err)
	}

	
	// returns true if the remote commit changed from local commit.
	// you can get the remote commit info using https://docs.github.com/en/rest/commits/commits
	return false
}
