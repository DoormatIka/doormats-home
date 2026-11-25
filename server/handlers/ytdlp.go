package handlers

import (
	"net/http"
	"server/services"

	"github.com/gin-gonic/gin"
)

type YtdlpHandler struct {
	Service *services.YtdlpService
}

func NewYtdlpHandler(service *services.YtdlpService) YtdlpHandler {
	return YtdlpHandler{
		Service: service,
	}
}

func (h *YtdlpHandler) GetPlaylistData(c *gin.Context) {
	playlist := h.Service.GetPlaylistData()
	c.JSON(http.StatusOK, playlist)
}

func (h *YtdlpHandler) GetRandomPlaylistData(c *gin.Context) {
	entry := h.Service.GetRandomPlaylistEntry()
	c.JSON(http.StatusOK, entry)
}
