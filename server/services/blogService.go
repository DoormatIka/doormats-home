package services;

import (
	"server/models"
	"server/repository"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	"github.com/gomarkdown/markdown"
)

type BlogService struct {
	repo *repository.BlogRepository
}

func NewBlogService(repo *repository.BlogRepository) *BlogService {
	return &BlogService{repo: repo}
}

func (s *BlogService) GetBlog(id string) (*models.BlogRecord, error) {
	// validation code here.
	extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.HardLineBreak
	pser := parser.NewWithExtensions(extensions)

	htmlFlags := html.CommonFlags | html.NoopenerLinks | html.NoreferrerLinks
	opts := html.RendererOptions{Flags: htmlFlags}
	renderer := html.NewRenderer(opts)

	post, err := s.repo.Get(id)
	if err != nil {
		return nil, err
	}
	md := markdown.ToHTML([]byte(post.Text), pser, renderer)
	
	return &models.BlogRecord{
		Id: post.Id,
		Title: post.Title,
		Link: post.Link,
		Text: string(md),
		Description: post.Description,
	}, nil
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
