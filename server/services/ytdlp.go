package services

import (
    "fmt"
    "server/models"
    "server/repository"
    "sync"
    "time"

    "math/rand"
)

const (
	playlistLink = "https://www.youtube.com/playlist?list=PLLIRzpLTcEblLVQUCa70M_20rLHU6cH-h"
	playlistID   = "PLLIRzpLTcEblLVQUCa70M_20rLHU6cH-h"
)

type YtdlpService struct {
	repo *repository.YtdlpRepository

	playlistMutex sync.RWMutex
	trackedPlaylist map[string]*models.YtdlpPlaylistModel

	sotdMutex sync.RWMutex
	songOfTheDay *models.YtdlpPlaylistEntriesModel

	done chan struct{}
}

func NewYtdlpService(repo *repository.YtdlpRepository) *YtdlpService {
	s := &YtdlpService{
		repo:            repo,
		trackedPlaylist: make(map[string]*models.YtdlpPlaylistModel),
		done:            make(chan struct{}),
	}
	s.refreshPlaylist()
	s.pickSongOfTheDay() // so it isn't nil for the first 24h
	go s.run()
	return s
}

func (s *YtdlpService) Close() { close(s.done) }

func (s *YtdlpService) run() {
	playlistTicker := time.NewTicker(72 * time.Hour)
	sotdTicker := time.NewTicker(24 * time.Hour)
	defer playlistTicker.Stop()
	defer sotdTicker.Stop()

	for {
		select {
		case <-s.done:
			return
		case <-playlistTicker.C:
			s.refreshPlaylist()
		case <-sotdTicker.C:
			s.pickSongOfTheDay()
		}
	}
}

func (s *YtdlpService) refreshPlaylist() {
	data, err := s.repo.GetPlaylistData(playlistLink) // slow call, no lock held
	if err != nil {
		fmt.Println("repo error: ", err)
		return
	}
	s.playlistMutex.Lock()
	s.trackedPlaylist[data.Id] = data
	s.playlistMutex.Unlock()
	fmt.Println("playlist updated")
}

func (s *YtdlpService) pickSongOfTheDay() {
	s.playlistMutex.RLock()
	playlist := s.trackedPlaylist[playlistID]
	s.playlistMutex.RUnlock()

	if playlist == nil || len(playlist.Entries) == 0 {
		return
	}

	entry := playlist.Entries[rand.Intn(len(playlist.Entries))]

	s.sotdMutex.Lock()
	s.songOfTheDay = &entry
	s.sotdMutex.Unlock()
	fmt.Println("song of the day updated")
}

func (s *YtdlpService) GetPlaylistData() map[string]*models.YtdlpPlaylistModel {
	s.playlistMutex.RLock()
	defer s.playlistMutex.RUnlock()

	out := make(map[string]*models.YtdlpPlaylistModel, len(s.trackedPlaylist))
	for k, v := range s.trackedPlaylist {
		out[k] = v
	}
	return out
}

func (s *YtdlpService) GetRandomPlaylistEntry() *models.YtdlpPlaylistEntriesModel {
	s.sotdMutex.RLock()
	defer s.sotdMutex.RUnlock()
	return s.songOfTheDay
}
