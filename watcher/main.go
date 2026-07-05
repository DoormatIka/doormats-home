package watcher

// extract to temp folders!
var link = "github.com/DoormatIka/doormats-home"
var og_web = "/web"
var og_server = "/server"
var og_watcher = "/watcher"

var latest_commit = ""

func main() {

}

func grabLatestGitCommit()  {
	// grab this from the .gitattributes file
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

func checkGithub() bool {
	// returns true if the remote commit changed from local commit.
	// you can get the remote commit info using https://docs.github.com/en/rest/commits/commits
	return false
}
