package main

import (
	"archive/zip"
	"encoding/json"
	"syscall"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// extract to temp folders!
// var link = "github.com/DoormatIka/doormats-home"
var og_web = "/web"
var to_web = "/home/mualice/Downloads/web/"
var web_exclusion = []string{""}
var og_server = "/server"
var to_server = "/home/mualice/Downloads/server"

var owner = "DoormatIka"
var repo = "doormats-home"
var commit_file = "latest-commit";
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

func main() {
	setLocalCommit()
	tickerUpdate()
}

func tickerUpdate() {
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()
	fmt.Println("Starting checker.")

	for range ticker.C {
		fmt.Printf("Checking %s at %s.\n", repo, time.Now().Format(time.DateTime))
		commit, gitErr := grabLatestGitCommit()
		if gitErr != nil {
			log.Printf("[WARN] Cannot access latest git commit!")
			continue
		}

		if commit.SHA != latest_commit {
			fmt.Printf("Changes detected! \"%s\"\n", commit.Commit.Message)

			latest_commit = commit.SHA
			writeErr := os.WriteFile(commit_file, []byte(commit.SHA), 0644)

			gitToAssignedFolders(owner, repo, latest_commit)

			if writeErr != nil {
				log.Fatalf("Failed to write to file: %s", writeErr)
			}
		}

	}

}

func setLocalCommit()  {
	sha_bytes, readErr := os.ReadFile(commit_file)
	if readErr != nil {
		log.Printf("Failed to read file: %s, defaulting to no latest commit.", readErr)
	}
	latest_commit = string(sha_bytes)
}

func gitToAssignedFolders(owner string, repo string, commit string)  {
	// zip section: create zip file
	tmpFile, err := os.CreateTemp("", "github-*.zip")
	if err != nil {
		log.Fatalf("Failed to create temp file: %v", err)
	}
	defer tmpFile.Close()
	defer os.Remove(tmpFile.Name())

	fmt.Printf("Temporary file created at: %s\n", tmpFile.Name())


	// zip section: downloading from github
	gitURL := fmt.Sprintf("https://github.com/%s/%s/archive/%s.zip", owner, repo, commit)
	req, err := http.NewRequest(http.MethodGet, gitURL, nil)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/octet-stream")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36")

	res, getErr := client.Do(req)
	if getErr != nil {
		log.Fatal(getErr)
	}
	defer res.Body.Close()

	_, copyErr := io.Copy(tmpFile, res.Body)
	if copyErr != nil {
		return
	}

	// extracting section: create folder
	tmpFolder, err := os.MkdirTemp("", "github-folder-*")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Temporary folder created at: %s\n", tmpFolder)
	defer os.RemoveAll(tmpFolder)

	// extracting section: zip to folder
	unzip(tmpFile.Name(), tmpFolder)

	internalFolderName := fmt.Sprintf("%s-%s", repo, latest_commit)
	internalFolder, err := url.JoinPath(tmpFolder, internalFolderName)

	if err := moveFolderIntoAssigned(internalFolder + "/web", to_web, []string{""}); err != nil {
		log.Fatalf("move failed: %v", err)
	}
	if err := moveFolderIntoAssigned(internalFolder + "/server", to_server, []string{""}); err != nil {
		log.Fatalf("move failed: %v", err)
	}
}

func clearAssignedPath(assignedPath string) error {
	if err := os.RemoveAll(assignedPath); err != nil {
		return fmt.Errorf("clearing assigned path: %w", err)
	}
	if err := os.MkdirAll(assignedPath, 0o755); err != nil {
		return fmt.Errorf("recreating assigned path: %w", err)
	}
	return nil
}

func moveFolderIntoAssigned(originalPath string, assignedPath string, excludedFiles []string) error {
	if err := clearAssignedPath(assignedPath); err != nil {
		return err
	}

	excluded := make(map[string]bool, len(excludedFiles))
	for _, f := range excludedFiles {
		excluded[f] = true
	}

	entries, err := os.ReadDir(originalPath)
	if err != nil {
		return fmt.Errorf("reading original path: %w", err)
	}

	for _, entry := range entries {
		name := entry.Name()
		if excluded[name] {
			continue
		}

		src := filepath.Join(originalPath, name)
		dst := filepath.Join(assignedPath, name)

		fmt.Printf("Moving %s.\n", name)

		if err := moveEntry(src, dst); err != nil {
			return fmt.Errorf("moving %s: %w", src, err)
		}
	}

	fmt.Println("Folder moved successfully.")
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

func grabLatestGitCommit() (*Commit, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/commits", owner, repo)
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

func unzip(src string, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	if err := os.MkdirAll(dest, 0755); err != nil {
		return err
	}

	for _, f := range r.File {
		// securing against path traversal.
		rcPath := filepath.Clean(f.Name)
		extractPath := filepath.Join(dest, rcPath)
		if !strings.HasPrefix(extractPath, filepath.Clean(dest)+string(os.PathSeparator)) && extractPath != filepath.Clean(dest) {
			return fmt.Errorf("illegal file path in zip: %s", f.Name)
		}

		// handling directories
		if f.FileInfo().IsDir() {
			if err := os.MkdirAll(extractPath, f.Mode()); err != nil {
				return err
			}
			continue
		}

		// files.
		if err := os.MkdirAll(filepath.Dir(extractPath), 0755); err != nil {
			return err
		}

		// open the file inside the zip
		rc, err := f.Open()
		if err != nil {
			return err
		}

		// create the destination file
		out, err := os.OpenFile(extractPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			rc.Close()
			return err
		}

		// copy data from zip to the file
		_, err = io.Copy(out, rc)
		rc.Close()
		out.Close()
		if err != nil {
			return err
		}
	}

	return nil
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
