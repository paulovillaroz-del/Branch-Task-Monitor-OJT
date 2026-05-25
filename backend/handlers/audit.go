package handlers

import (
	"branch-task-api/db" // Tiyaking tama ang import path mo
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type AuditLog struct {
	ID          int       `json:"id"`
	Action      string    `json:"action"`
	PerformedBy string    `json:"performed_by"`
	Details     string    `json:"details"`
	CreatedAt   time.Time `json:"created_at"`
}

// GET API para kunin ang mga logs
func GetAuditLogs(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, action, performed_by, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 50")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch audit logs"})
		return
	}
	defer rows.Close()

	var logs []AuditLog
	for rows.Next() {
		var log AuditLog
		if err := rows.Scan(&log.ID, &log.Action, &log.PerformedBy, &log.Details, &log.CreatedAt); err != nil {
			continue
		}
		logs = append(logs, log)
	}

	if logs == nil {
		logs = []AuditLog{}
	}
	c.JSON(http.StatusOK, logs)
}

// Global Helper Function para madali mong tawagin kapag may nagbago sa system
func LogSystemAction(action string, performedBy string, details string) {
	_, err := db.DB.Exec("INSERT INTO audit_logs (action, performed_by, details) VALUES ($1, $2, $3)", action, performedBy, details)
	if err != nil {
		log.Printf("❌ Failed to log audit action: %v", err)
	}
}
