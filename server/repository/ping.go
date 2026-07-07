package repository

import (
	"server/models"
)

type PingRepository struct {}

func (r *PingRepository) GenerateGarbageData() (models.Ping, error) {
	return models.Ping{ GarbageData: "Pleading." }, nil
}
