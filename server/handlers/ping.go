package handlers

import (
	"net/http"
	"server/services"

	"github.com/gin-gonic/gin"
)

type PingHandler struct {
	Service *services.PingService
}

func (h *PingHandler) GetGarbageData(c *gin.Context) {
	ping, err := h.Service.GetGarbageData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{ "error": err.Error() })
		return
	}
	c.JSON(http.StatusOK, ping)
}
