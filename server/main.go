
package main

import (
	"github.com/gin-gonic/gin"
	"server/handlers"
	"server/repository"
	"server/services"
)

func main() {
	router := gin.Default()
	router.SetTrustedProxies([]string{"127.0.0.1", "::1"})

	repo := &repository.PingRepository{}
	service := &services.PingService{Repo: repo}
	handler := &handlers.PingHandler{Service: service}

	router.GET("/ping/", handler.GetGarbageData)

	router.Run(":8980")
}
