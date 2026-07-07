package services

import (
	"server/models"
	"server/repository"
)

type PingService struct {
	Repo *repository.PingRepository
}


func (s *PingService) GetGarbageData() (models.Ping, error) {
	return s.Repo.GenerateGarbageData()
}
