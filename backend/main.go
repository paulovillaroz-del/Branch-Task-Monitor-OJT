package main

import (
	"log"

	"branch-task-api/db"
	"branch-task-api/handlers"
	"branch-task-api/routes"

	"github.com/gin-gonic/gin"
)

func main() {

	db.Connect()

	r := gin.Default()

	// Static folder para sa mga in-upload na pictures sa chat
	r.Static("/uploads", "./uploads")

	// CORS Setup
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "application/json")
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "Route not found", "tasks": []string{}, "reminders": []string{}})
	})

	// Dito papasok yung totoong Email SMTP at OTP logic mo galing sa handlers.go
	handlers.SetupAuthRoutes(r)

	// 🔥 CENTRALIZED ROUTING GATEWAY: Dito na natin tinawag ang iisang SetupRoutes
	// para sa Tasks, Chat, Announcements, at Priority Swapping!
	routes.SetupRoutes(r)

	log.Println("🚀 Final Priority Sync active. Backend live on http://0.0.0.0:40241")
	r.Run("0.0.0.0:40241")
}
