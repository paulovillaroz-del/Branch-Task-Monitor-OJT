package main

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"net/smtp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var db *sql.DB

// --- 1. EMAIL & OTP FUNCTIONS ---

func sendResetEmail(targetEmail string, code string) error {
	from := "Adminnnn01@gmail.com"
	password := "zekfwukwqmmhjxjv"
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	targetEmail = strings.ToLower(strings.TrimSpace(targetEmail))

	// Improved Header formatting for better Gmail compatibility
	headerSubject := "Subject: Task Monitor Reset Code\n"
	headerMime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"

	body := fmt.Sprintf(`
        <html>
            <body style="font-family: sans-serif; text-align: center; padding: 20px;">
                <h2 style="color: #333;">Security Verification</h2>
                <p>Use the code below to reset your password. It expires in 15 minutes.</p>
                <h1 style="background: #f4f4f4; padding: 20px; display: inline-block; letter-spacing: 5px; color: #059669; border-radius: 10px;">%s</h1>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
            </body>
        </html>`, code)

	message := []byte(headerSubject + headerMime + body)
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// Sending the mail
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{targetEmail}, message)
}

func generateOTP() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

// --- NEW: NOTIFICATION HELPER ---
func addNotification(userEmail string, message string) {
	_, err := db.Exec(`INSERT INTO notifications (user_email, message, is_read) VALUES ($1, $2, false)`,
		strings.ToLower(strings.TrimSpace(userEmail)), message)
	if err != nil {
		log.Printf("❌ Notification DB Error: %v", err)
	}
}

func main() {
	connStr := "postgres://postgres:ojt12345@localhost:5433/branch_task_db?sslmode=disable"

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Cannot open DB:", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal("Cannot connect to DB:", err)
	}

	log.Println("✅ Connected to PostgreSQL!")

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "application/json")
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
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

	r.POST("/login", func(c *gin.Context) {
		var input struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "Invalid input"})
			return
		}
		var role, fullName, dbPass string
		cleanEmail := strings.ToLower(strings.TrimSpace(input.Email))
		err := db.QueryRow("SELECT password, role, full_name FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))", cleanEmail).Scan(&dbPass, &role, &fullName)
		if err != nil || input.Password != dbPass {
			c.JSON(401, gin.H{"error": "Authentication failed"})
			return
		}
		c.JSON(200, gin.H{"role": role, "full_name": fullName, "email": cleanEmail})
	})

	r.POST("/forgot-password", func(c *gin.Context) {
		var input struct {
			Email string `json:"email" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "Email is required"})
			return
		}

		cleanEmail := strings.ToLower(strings.TrimSpace(input.Email))

		var exists bool
		db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(TRIM(email)) = $1)", cleanEmail).Scan(&exists)
		if !exists {
			c.JSON(404, gin.H{"error": "User with this email does not exist"})
			return
		}

		code := generateOTP()
		_, err := db.Exec(`UPDATE users SET reset_code = $1, reset_expiry = NOW() + INTERVAL '15 minutes' WHERE LOWER(TRIM(email)) = $2`, code, cleanEmail)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to generate security code"})
			return
		}

		// Background Routine with Error Handling
		go func(email, code string) {
			err := sendResetEmail(email, code)
			if err != nil {
				log.Printf("❌ SMTP ERROR for %s: %v", email, err)
			} else {
				log.Printf("📧 Reset code %s sent successfully to %s", code, email)
			}
		}(cleanEmail, code)

		c.JSON(200, gin.H{"message": "Code sent to email!"})
	})

	r.POST("/reset-password", func(c *gin.Context) {
		var input struct {
			Email       string `json:"email" binding:"required"`
			Code        string `json:"code" binding:"required"`
			NewPassword string `json:"new_password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "All fields are required"})
			return
		}

		cleanEmail := strings.ToLower(strings.TrimSpace(input.Email))
		cleanCode := strings.TrimSpace(input.Code)

		var dbCode sql.NullString
		var expiry time.Time

		err := db.QueryRow("SELECT reset_code, reset_expiry FROM users WHERE LOWER(TRIM(email)) = $1", cleanEmail).Scan(&dbCode, &expiry)

		if err != nil || !dbCode.Valid || dbCode.String != cleanCode {
			c.JSON(401, gin.H{"error": "Invalid verification code"})
			return
		}

		if time.Now().After(expiry) {
			c.JSON(401, gin.H{"error": "Code has expired. Please request a new one."})
			return
		}

		_, err = db.Exec("UPDATE users SET password = $1, reset_code = NULL, reset_expiry = NULL WHERE LOWER(TRIM(email)) = $2", input.NewPassword, cleanEmail)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to update password"})
			return
		}

		c.JSON(200, gin.H{"message": "Password updated successfully!"})
	})

	r.GET("/tasks", func(c *gin.Context) {
		search := c.Query("search")
		assignedTo := strings.ToLower(strings.TrimSpace(c.Query("assigned_to")))
		tasks := make([]gin.H, 0)

		query := `SELECT id, title, description, status, 
                  COALESCE(start_date::text, ''), COALESCE(end_date::text, ''), 
                  COALESCE(assigned_to, ''), is_requesting_approval 
                  FROM tasks WHERE title != ''`

		args := []interface{}{}
		placeholderNum := 1

		if search != "" {
			query += fmt.Sprintf(" AND title ILIKE $%d", placeholderNum)
			args = append(args, "%"+search+"%")
			placeholderNum++
		}

		if assignedTo != "" {
			query += fmt.Sprintf(" AND LOWER(TRIM(assigned_to)) = LOWER(TRIM($%d))", placeholderNum)
			args = append(args, assignedTo)
			placeholderNum++
		}

		query += " ORDER BY id ASC"

		rows, err := db.Query(query, args...)
		if err != nil {
			log.Printf("❌ Task Fetch Error: %v", err)
			c.JSON(500, gin.H{"error": "DB Error", "data": tasks})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var id int
			var t, d, s, sd, ed, assigned string
			var isReq bool
			rows.Scan(&id, &t, &d, &s, &sd, &ed, &assigned, &isReq)
			tasks = append(tasks, gin.H{
				"id":                     id,
				"title":                  t,
				"description":            d,
				"status":                 s,
				"start_date":             sd,
				"end_date":               ed,
				"assigned_to":            assigned,
				"is_requesting_approval": isReq,
			})
		}
		c.JSON(200, tasks)
	})

	r.POST("/tasks", func(c *gin.Context) {
		var input struct {
			Title       string `json:"title"`
			Description string `json:"description"`
			Status      string `json:"status"`
			StartDate   string `json:"start_date"`
			EndDate     string `json:"end_date"`
			AssignedTo  string `json:"assigned_to"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			log.Printf("❌ JSON BIND ERROR: %v", err)
			c.JSON(400, gin.H{"error": "Invalid JSON input"})
			return
		}

		cleanAssignedTo := strings.ToLower(strings.TrimSpace(input.AssignedTo))

		_, err := db.Exec(`INSERT INTO tasks (title, description, status, start_date, end_date, assigned_to, is_requesting_approval) 
                           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			input.Title, input.Description, input.Status, input.StartDate, input.EndDate, cleanAssignedTo, false)

		if err != nil {
			log.Printf("❌ DATABASE INSERT ERROR: %v", err)
			c.JSON(500, gin.H{"error": "Database insert failed: " + err.Error()})
			return
		}

		c.JSON(201, gin.H{"message": "Task created successfully"})
	})

	r.PUT("/tasks/:id", func(c *gin.Context) {
		id := c.Param("id")
		var input struct {
			Title       string `json:"title"`
			Description string `json:"description"`
			Status      string `json:"status"`
			StartDate   string `json:"start_date"`
			EndDate     string `json:"end_date"`
			AssignedTo  string `json:"assigned_to"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "Invalid input data"})
			return
		}

		tx, err := db.Begin()
		if err != nil {
			c.JSON(500, gin.H{"error": "Transaction initiation failed"})
			return
		}

		cleanEmail := strings.ToLower(strings.TrimSpace(input.AssignedTo))

		if input.Status == "in-progress" {
			_, err = tx.Exec(`UPDATE tasks SET status = 'pending' 
                              WHERE LOWER(TRIM(assigned_to)) = LOWER(TRIM($1)) 
                              AND id != $2 
                              AND status = 'in-progress'`, cleanEmail, id)
			if err != nil {
				tx.Rollback()
				c.JSON(500, gin.H{"error": "Failed to balance workload"})
				return
			}
		}

		query := `UPDATE tasks SET 
                  title = $1, 
                  description = $2, 
                  status = $3, 
                  start_date = $4, 
                  end_date = $5, 
                  assigned_to = $6 
                  WHERE id = $7`

		_, err = tx.Exec(query,
			input.Title,
			input.Description,
			input.Status,
			input.StartDate,
			input.EndDate,
			cleanEmail,
			id)

		if err != nil {
			tx.Rollback()
			log.Printf("❌ Update Error: %v", err)
			c.JSON(500, gin.H{"error": "Database update failed"})
			return
		}

		tx.Commit()
		c.JSON(200, gin.H{"message": "Task updated and workload balanced"})
	})

	r.PUT("/tasks/:id/status", func(c *gin.Context) {
		id := c.Param("id")
		var input struct {
			Status               string `json:"status"`
			IsRequestingApproval bool   `json:"is_requesting_approval"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "Invalid input"})
			return
		}

		tx, err := db.Begin()
		if err != nil {
			c.JSON(500, gin.H{"error": "Transaction failed"})
			return
		}

		if input.Status == "in-progress" {
			var assignedTo string
			err = tx.QueryRow("SELECT assigned_to FROM tasks WHERE id = $1", id).Scan(&assignedTo)
			if err == nil && assignedTo != "" {
				_, err = tx.Exec(`UPDATE tasks SET status = 'pending' 
                                  WHERE LOWER(TRIM(assigned_to)) = LOWER(TRIM($1)) 
                                  AND id != $2 
                                  AND status = 'in-progress'`, assignedTo, id)
				if err != nil {
					tx.Rollback()
					c.JSON(500, gin.H{"error": "Failed to pause other work"})
					return
				}
			}
		}

		_, err = tx.Exec(`UPDATE tasks SET status = $1, is_requesting_approval = $2 WHERE id = $3`, input.Status, input.IsRequestingApproval, id)
		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "Failed to update status"})
			return
		}

		tx.Commit()
		c.JSON(200, gin.H{"message": "Status updated successfully", "status": input.Status})
	})

	r.PATCH("/tasks/:id/request-approval", func(c *gin.Context) {
		id := c.Param("id")
		var title, assignedTo string
		db.QueryRow("SELECT title, assigned_to FROM tasks WHERE id = $1", id).Scan(&title, &assignedTo)

		_, err := db.Exec(`UPDATE tasks SET is_requesting_approval = true WHERE id = $1`, id)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to send request"})
			return
		}

		addNotification("adminnnn01@gmail.com", fmt.Sprintf("Approval Request: %s has finished '%s'", assignedTo, title))

		c.JSON(200, gin.H{"message": "Request sent"})
	})

	r.PUT("/tasks/:id/approve", func(c *gin.Context) {
		id := c.Param("id")
		var input struct {
			Action string `json:"action"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "Invalid input"})
			return
		}

		var title, assignedTo string
		db.QueryRow("SELECT title, assigned_to FROM tasks WHERE id = $1", id).Scan(&title, &assignedTo)

		targetStatus := "completed"
		notifMsg := fmt.Sprintf("Task Approved: Admin has marked '%s' as completed.", title)

		if input.Action == "reject" {
			targetStatus = "in-progress"
			notifMsg = fmt.Sprintf("Action Required: Admin rejected approval for '%s'. Please review.", title)
		}

		_, err := db.Exec(`UPDATE tasks SET status = $1, is_requesting_approval = false WHERE id = $2`, targetStatus, id)
		if err != nil {
			log.Printf("❌ Decision Error: %v", err)
			c.JSON(500, gin.H{"error": "Decision failed"})
			return
		}

		addNotification(assignedTo, notifMsg)

		c.JSON(200, gin.H{"message": "Decision updated", "status": targetStatus, "action": input.Action})
	})

	r.POST("/tasks/priority-override", func(c *gin.Context) {
		var input struct {
			TaskID     int    `json:"task_id"`
			AssignedTo string `json:"assigned_to"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "Invalid input"})
			return
		}

		tx, err := db.Begin()
		if err != nil {
			c.JSON(500, gin.H{"error": "Transaction initiation failed"})
			return
		}

		_, err = tx.Exec(`UPDATE tasks SET status = 'pending' 
                          WHERE LOWER(TRIM(assigned_to)) = LOWER(TRIM($1)) 
                          AND status = 'in-progress'`, input.AssignedTo)
		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "Failed to pause current work"})
			return
		}

		_, err = tx.Exec(`UPDATE tasks SET status = 'in-progress' WHERE id = $1`, input.TaskID)
		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "Failed to promote important task"})
			return
		}

		tx.Commit()
		c.JSON(200, gin.H{"message": "Workload prioritized successfully"})
	})

	r.GET("/reminders", func(c *gin.Context) {
		reminders := make([]gin.H, 0)
		query := `SELECT id, title, COALESCE(end_date::text, '') FROM tasks WHERE status != 'completed' AND end_date != '' AND title != '' ORDER BY end_date ASC LIMIT 5`
		rows, _ := db.Query(query)
		defer rows.Close()
		for rows.Next() {
			var id int
			var title, endDate string
			rows.Scan(&id, &title, &endDate)
			reminders = append(reminders, gin.H{"id": id, "title": title, "end_date": endDate})
		}
		c.JSON(200, reminders)
	})

	r.GET("/tasks/:id/comments", func(c *gin.Context) {
		taskID := c.Param("id")
		userEmail := strings.ToLower(strings.TrimSpace(c.Query("email")))
		userRole := c.Query("role")

		var assignedTo string
		err := db.QueryRow("SELECT assigned_to FROM tasks WHERE id = $1", taskID).Scan(&assignedTo)
		if err != nil {
			c.JSON(404, gin.H{"error": "Task not found"})
			return
		}

		if userRole != "admin" && strings.ToLower(strings.TrimSpace(assignedTo)) != userEmail {
			c.JSON(403, gin.H{"error": "Communication is private between Admin and Assignee"})
			return
		}

		comments := make([]gin.H, 0)
		rows, err := db.Query(`SELECT id, sender_email, message, created_at 
                               FROM task_comments WHERE task_id = $1 
                               ORDER BY created_at ASC`, taskID)
		if err != nil {
			c.JSON(200, comments)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var id int
			var sender, msg, created string
			rows.Scan(&id, &sender, &msg, &created)
			comments = append(comments, gin.H{
				"id":           id,
				"sender_email": sender,
				"message":      msg,
				"created_at":   created,
			})
		}
		c.JSON(200, comments)
	})

	r.GET("/users", func(c *gin.Context) {
		users := make([]gin.H, 0)
		query := `SELECT u.email, u.full_name, u.role, 
                  (SELECT COUNT(*) FROM tasks t WHERE LOWER(TRIM(t.assigned_to)) = LOWER(TRIM(u.email)) AND t.status = 'in-progress') as active_count,
                  (SELECT title FROM tasks t WHERE LOWER(TRIM(t.assigned_to)) = LOWER(TRIM(u.email)) AND t.status = 'in-progress' LIMIT 1) as active_title,
                  (SELECT start_date FROM tasks t WHERE LOWER(TRIM(t.assigned_to)) = LOWER(TRIM(u.email)) AND t.status = 'in-progress' LIMIT 1) as active_start,
                  (SELECT end_date FROM tasks t WHERE LOWER(TRIM(t.assigned_to)) = LOWER(TRIM(u.email)) AND t.status = 'in-progress' LIMIT 1) as active_end
                  FROM users u WHERE u.role = 'user'`

		rows, err := db.Query(query)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch monitor data"})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var email, fullName, role string
			var activeCount int
			var title, start, end sql.NullString

			rows.Scan(&email, &fullName, &role, &activeCount, &title, &start, &end)

			users = append(users, gin.H{
				"email":        email,
				"full_name":    fullName,
				"role":         role,
				"active_tasks": activeCount,
				"current_task": gin.H{
					"title":      title.String,
					"start_date": start.String,
					"end_date":   end.String,
				},
			})
		}
		c.JSON(200, users)
	})

	r.DELETE("/tasks/:id", func(c *gin.Context) {
		db.Exec("DELETE FROM tasks WHERE id = $1", c.Param("id"))
		c.JSON(200, gin.H{"message": "Deleted"})
	})

	r.GET("/analytics/stats", func(c *gin.Context) {
		var pending, inProgress, completed, overdue int

		db.QueryRow("SELECT COUNT(*) FROM tasks WHERE status = 'pending'").Scan(&pending)
		db.QueryRow("SELECT COUNT(*) FROM tasks WHERE status = 'in-progress'").Scan(&inProgress)
		db.QueryRow("SELECT COUNT(*) FROM tasks WHERE status = 'completed'").Scan(&completed)

		db.QueryRow(`SELECT COUNT(*) FROM tasks 
                     WHERE status != 'completed' 
                     AND end_date != '' 
                     AND end_date::date < CURRENT_DATE`).Scan(&overdue)

		c.JSON(200, gin.H{
			"pending":     pending,
			"in_progress": inProgress,
			"completed":   completed,
			"overdue":     overdue,
			"total":       pending + inProgress + completed,
		})
	})

	r.GET("/notifications", func(c *gin.Context) {
		email := strings.ToLower(strings.TrimSpace(c.Query("email")))
		notifications := make([]gin.H, 0)

		rows, err := db.Query(`SELECT id, message, is_read, created_at 
                               FROM notifications WHERE LOWER(user_email) = $1 
                               ORDER BY created_at DESC LIMIT 15`, email)
		if err != nil {
			log.Printf("❌ Fetch Notifs Error: %v", err)
			c.JSON(500, gin.H{"error": "Failed to fetch notifications"})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var id int
			var msg, created string
			var read bool
			rows.Scan(&id, &msg, &read, &created)
			notifications = append(notifications, gin.H{
				"id":         id,
				"message":    msg,
				"is_read":    read,
				"created_at": created,
			})
		}
		c.JSON(200, notifications)
	})

	log.Println("🚀 Final Priority Sync active. Backend live on http://localhost:8080")
	r.Run(":8080")
}
