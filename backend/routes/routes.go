package routes

import (
	"branch-task-api/db"
	"branch-task-api/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// 🛑 HINDI natin ilalagay ang handlers.SetupAuthRoutes(r) dito para maiwasan ang panic!
	// Hahayaan natin ang main.go mo na magrehistro ng orihinal na /login at /user/change-password.

	// 🔥 THE PASSWORD UPDATE OVERRIDE LAYER FOR SETTINGS PAGE
	// Idinedeklara natin itong tatlong magkakahiwalay na fallback paths gamit ang anonymous handler function.
	// Ginagarantiya nito na kung sakaling 'PUT' method o '/user/update-password' ang tinatangka ng
	// Next.js Settings form mo, awtomatiko itong isasalin at ipapasa ng Go sa tamang process framework!
	passwordSettingsOverride := func(c *gin.Context) {
		c.Request.URL.Path = "/user/change-password"
		c.Request.Method = "POST"
		r.HandleContext(c)
	}

	r.PUT("/user/change-password", passwordSettingsOverride)
	r.POST("/user/update-password", passwordSettingsOverride)
	r.PUT("/user/update-password", passwordSettingsOverride)

	// --- Announcements ---
	r.GET("/announcements", handlers.GetAnnouncements)
	r.POST("/announcements", handlers.CreateAnnouncement)
	r.DELETE("/announcements/:id", handlers.DeleteAnnouncement)

	// --- Audit Logs ---
	r.GET("/audit-logs", handlers.GetAuditLogs)

	// --- Chat & Messaging ---
	r.POST("/messages", handlers.SendMessage)
	r.GET("/messages", handlers.GetMessages)
	r.POST("/upload", handlers.UploadImage)
	r.GET("/ws", handlers.HandleWebSocket)

	// --- Task ManaAgement ---
	r.GET("/tasks", handlers.GetTasks)
	r.POST("/tasks", handlers.CreateTask)
	r.PUT("/tasks/:id", handlers.UpdateTask)
	r.DELETE("/tasks/:id", handlers.DeleteTask)

	// --- Status & Approvals ---
	r.PUT("/tasks/:id/status", handlers.UpdateTaskStatus)
	r.PATCH("/tasks/:id/request-approval", handlers.RequestApproval)
	r.PUT("/tasks/:id/approve", handlers.ApproveTaskDecision)

	// ⚡ THE MONITOR CORE INTERACTION LINK (STABLE FIX)
	r.PUT("/tasks/:id/switch-priority", handlers.SwitchTaskPriority)
	r.PUT("/api/tasks/:id/switch-priority", handlers.SwitchTaskPriority)

	// --- Analytics, Reminders & Notifications ---
	r.GET("/analytics/stats", handlers.GetAnalytics)
	r.GET("/reminders", handlers.GetReminders)
	r.GET("/notifications", handlers.GetUserNotifications)

	r.PUT("/notifications/:id/read", func(c *gin.Context) {
		id := c.Param("id")
		// Siguraduhin na imported ang "branch-task-api/db" sa taas ng file na ito
		_, err := db.DB.Exec("UPDATE notifications SET is_read = true WHERE id = $1", id)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed"})
			return
		}
		c.Status(200)
	})
}
