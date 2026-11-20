package handlers

import (
	"log"
	"strconv"
	"net/http"
	"server/models"
	"server/services"

	"github.com/gin-gonic/gin"
)

type BlogHandler struct {
	blog_service *services.BlogService
}

func NewBlogHandler(service *services.BlogService) *BlogHandler {
	return &BlogHandler{blog_service: service}
}

func (h *BlogHandler) GetBlog(c *gin.Context) {
	id := c.Param("id");
	blog, err := h.blog_service.GetBlog(id);
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, blog)
}

func (h *BlogHandler) AddBlogPost(c *gin.Context) {
	var input models.BlogParams
	if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
	if err := h.blog_service.AddBlog(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
	}
    c.JSON(http.StatusOK, gin.H{})
}

func (h *BlogHandler) GetListBlog(c *gin.Context) {
	page := c.Param("page");
	pagei, err := strconv.ParseUint(page, 10, 32);
	if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid page"})
        return
	}
	blogs, err := h.blog_service.ListBlog(uint(pagei));
	if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
	}
    c.JSON(http.StatusOK, blogs)
}

