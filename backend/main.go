package main

import (
	"database/sql"
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var db *sql.DB

func main() {
	// CHANGE this password to your real one (the one that works in pgAdmin)
	connStr := "postgres://postgres:ojt12345@localhost:5433/branch_task_db?sslmode=disable"

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Cannot open DB:", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Cannot connect to DB:", err)
	}

	log.Println("✅ Connected to PostgreSQL!")

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// NEW: Add this route for /tasks
	r.GET("/tasks", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, title, description, status FROM tasks ORDER BY id ASC")
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var tasks []map[string]interface{}
		for rows.Next() {
			var id int
			var title, description, status string
			err = rows.Scan(&id, &title, &description, &status)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			tasks = append(tasks, map[string]interface{}{
				"id":          id,
				"title":       title,
				"description": description,
				"status":      status,
			})
		}

		c.JSON(200, tasks)
	})

	// Optional test route
	r.GET("/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Hello from Go + PostgreSQL!"})
	})

	r.Run(":8080")
}
