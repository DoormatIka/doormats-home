package main

import (
	"database/sql"
	"log"
	"net/http"
	"server/handlers"
	"server/repository"
	"server/services"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"

	_ "modernc.org/sqlite"
)

func RateLimiter() gin.HandlerFunc {
	limiter := rate.NewLimiter(1, 4)
	return func(ctx *gin.Context) {
		if limiter.Allow() {
			ctx.Next()
		} else {
			ctx.JSON(http.StatusTooManyRequests, gin.H{
				"message": "Limit exceeded!",
			})
		}
	}
}


func main() {
	gin.SetMode(gin.DebugMode)
	router := gin.Default()
	adminRouter := gin.Default()
	router.SetTrustedProxies([]string{"127.0.0.1", "::1"})
	adminRouter.SetTrustedProxies([]string{"127.0.0.1", "::1"})

	router.Use(RateLimiter())
	adminRouter.Use(RateLimiter())
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://127.0.0.1:8080",
			"http://localhost:8080",
			"https://home.mualice.dpdns.org",
		},
		AllowMethods: []string{"GET", "POST"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge: 4 * time.Hour,
	}))

	db, err := sql.Open("sqlite", "./db/v1.sqlite3")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	ping_repo := &repository.PingRepository{}
	ping_service := &services.PingService{Repo: ping_repo}
	ping_handler := &handlers.PingHandler{Service: ping_service}

	router.GET("/api/ping", ping_handler.GetGarbageData)

	log.Println("Main server is up at :9980, admin server is up at :8980")

	go adminRouter.Run(":8980")
	router.Run(":9980")
}
