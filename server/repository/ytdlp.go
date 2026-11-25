package repository

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"

	"server/models"
)

type YtdlpRepository struct {}

func NewYtdlpRepository() YtdlpRepository {
	return YtdlpRepository {}
}

func (r *YtdlpRepository) GetPlaylistData(playlist string) (*models.YtdlpPlaylistModel, error) {
    args := []string{
        "--flat-playlist",
        "-J",
		"--playlist-items", "1-100",
		"--sleep-requests", "0.75",
		"--sleep-interval", "10",
		"--max-sleep-interval", "20",
        playlist,
    }
    cmd := exec.Command("yt-dlp", args...)

    var stdout bytes.Buffer
    cmd.Stdout = &stdout

    var stderrBuf bytes.Buffer
    cmd.Stderr = io.MultiWriter(os.Stdout, &stderrBuf)

    if err := cmd.Run(); err != nil {
        return nil, fmt.Errorf("yt-dlp failed: %w\nstderr: %s", err, stderrBuf.String())
    }

    var trackedPlaylist models.YtdlpPlaylistModel
    if err := json.Unmarshal(stdout.Bytes(), &trackedPlaylist); err != nil {
        return nil, err
    }
    return &trackedPlaylist, nil
}

