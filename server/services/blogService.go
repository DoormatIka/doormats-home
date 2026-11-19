package services;

import (
	"server/models"
	"server/repository"
)

type BlogService struct {
	Repo *repository.BlogRepository
}

func (s *BlogService) AddBlog() {
	
}
