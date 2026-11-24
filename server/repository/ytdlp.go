package repository

import (
	"server/models"
)

type YtdlpRepository struct {
	Playlist models.YtdlpPlaylistModel
}

func NewYtdlpRepository() YtdlpRepository {
	return YtdlpRepository {}
}

func (r *YtdlpRepository) GetPlaylistData() {
	
}
