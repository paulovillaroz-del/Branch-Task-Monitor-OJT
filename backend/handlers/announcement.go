package handlers

import (
	"branch-task-api/db"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type Announcement struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Priority  string    `json:"priority"`
	PostedBy  string    `json:"posted_by"`
	CreatedAt time.Time `json:"created_at"`
}

func GetAnnouncements(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, title, content, priority, posted_by, created_at FROM announcements ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch announcements"})
		return
	}
	defer rows.Close()

	var announcements []Announcement
	for rows.Next() {
		var a Announcement
		if err := rows.Scan(&a.ID, &a.Title, &a.Content, &a.Priority, &a.PostedBy, &a.CreatedAt); err != nil {
			continue
		}
		announcements = append(announcements, a)
	}

	if announcements == nil {
		announcements = []Announcement{}
	}
	c.JSON(http.StatusOK, announcements)
}

func CreateAnnouncement(c *gin.Context) {
	var input struct {
		Title    string `json:"title"`
		Content  string `json:"content"`
		Priority string `json:"priority"`
		PostedBy string `json:"posted_by"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
		return
	}

	query := `INSERT INTO announcements (title, content, priority, posted_by) VALUES ($1, $2, $3, $4)`
	_, err := db.DB.Exec(query, input.Title, input.Content, input.Priority, input.PostedBy)
	if err != nil {
		log.Printf("❌ DB Insert Error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to post announcement"})
		return
	}

	// Connected na sa Audit Trail natin!
	LogSystemAction("Posted Announcement", input.PostedBy, fmt.Sprintf("Broadcasted a '%s' memo: %s", input.Priority, input.Title))

	c.JSON(http.StatusCreated, gin.H{"message": "Announcement posted successfully"})
}

func DeleteAnnouncement(c *gin.Context) {
	id := c.Param("id")

	// 1. Kunin muna ang title ng memo bago burahin para sa Audit Log description
	var title string
	err := db.DB.QueryRow("SELECT title FROM announcements WHERE id = $1", id).Scan(&title)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Announcement not found"})
		return
	}

	// 2. Patakbuhin ang DELETE query
	_, err = db.DB.Exec("DELETE FROM announcements WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete announcement"})
		return
	}

	// 3. I-trigger ang pag-save sa Audit Trail na ginawa natin dati!
	LogSystemAction("Deleted Announcement", "System Admin", fmt.Sprintf("Removed announcement memo: '%s'", title))

	c.JSON(http.StatusOK, gin.H{"message": "Announcement deleted successfully"})
}
