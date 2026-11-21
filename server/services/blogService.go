package services;

import (
	"server/models"
	"server/repository"
)

type BlogService struct {
	repo *repository.BlogRepository
}

func NewBlogService(repo *repository.BlogRepository) *BlogService {
	return &BlogService{repo}
}

func (s *BlogService) GetBlog(id string) (*models.BlogRecord, error) {
	// validation code here.
	return s.repo.Get(id)
}

func (s *BlogService) AddBlog(params *models.BlogParams) error {
	return s.repo.Add(params)
}

func (s *BlogService) ListBlog(page uint) ([]models.BlogRecord, error) {
	return s.repo.List(page)
}

func (s *BlogService) UpdateBlog(params *models.BlogRecord) (bool, error) {
	return s.repo.Update(params)
}
