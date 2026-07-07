package main

import (
	"server/handlers"
	"server/repository"
	"server/services"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.SetTrustedProxies([]string{"127.0.0.1", "::1"})

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://127.0.0.1:8080",
			"http://localhost:8080",
			"https://home.yuyuqk.com",
		},
		AllowMethods: []string{"GET", "POST"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge: 4 * time.Hour,
	}))

	repo := &repository.PingRepository{}
	service := &services.PingService{Repo: repo}
	handler := &handlers.PingHandler{Service: service}

	router.GET("/ping", handler.GetGarbageData)

	router.Run(":8980")
}
