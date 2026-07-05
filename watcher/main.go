package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

// extract to temp folders!
// var link = "github.com/DoormatIka/doormats-home"
var og_web = "/web"
var og_server = "/server"
var og_watcher = "/watcher"

var owner = "DoormatIka"
var repo = "doormats-home"
var commit_file = "latest-commit";
var latest_commit = ""

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
	getLocalCommit()
	tickerUpdate()
}

func tickerUpdate() {
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()
	fmt.Println("Starting checker.")

	for range ticker.C {
		fmt.Printf("Checking %s at %s.\n", repo, time.Now().Format(time.DateTime))
		commit := grabLatestGitCommit()

		if commit.SHA != latest_commit {
			fmt.Printf("Changes detected! \"%s\"\n", commit.Commit.Message)
			writeErr := os.WriteFile(commit_file, []byte(commit.SHA), 0644)

			if writeErr != nil {
				log.Fatalf("Failed to write to file: %s", writeErr)
			}
		}

	}

}

func getLocalCommit()  {
	sha_bytes, readErr := os.ReadFile(commit_file)
	if readErr != nil {
		log.Printf("Failed to read file: %s, defaulting to no latest commit.", readErr)
	}
	latest_commit = string(sha_bytes)
}

func grabGithubIntoTempFolder()  {
	// create temp file, zip file.
	// http.Get(URL of github website (include .git maybe?))
	// push this into the zip file
	
	// extract contents into a temp folder.
}

func moveFolderIntoAssigned(assignedPath string)  {
	// move specific folders like "/web" into their target folders.
}

func grabLatestGitCommit() Commit {
	client := http.Client{
		Timeout: time.Second * 5,
	}

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
		log.Fatal(getErr)
	}
	if res.Body != nil {
		defer res.Body.Close()
	}

	body, readErr := io.ReadAll(res.Body)
	if readErr != nil {
		log.Fatal(readErr)
	}

	
	var commits []Commit
	if err := json.Unmarshal(body, &commits); err != nil {
		log.Fatal(err)
	}

	return commits[0]
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
