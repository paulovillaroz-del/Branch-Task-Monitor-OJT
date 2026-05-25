package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"branch-task-api/db"

	"github.com/gin-gonic/gin"
)

// --- HELPERS ---

func addNotification(userEmail string, message string) {
	// 1. Database logic
	_, err := db.DB.Exec(`INSERT INTO notifications (user_email, message, is_read) VALUES ($1, $2, false)`,
		strings.ToLower(strings.TrimSpace(userEmail)), message)
	if err != nil {
		log.Printf("❌ Notification DB Error: %v", err)
		return
	}

	// 2. Real-time WebSocket logic gamit ang exported variables
	email := strings.ToLower(strings.TrimSpace(userEmail))

	Mutex.Lock()                        // Gamit ang exported Mutex
	if conn, ok := Clients[email]; ok { // Gamit ang exported Clients
		conn.WriteJSON(gin.H{
			"type":    "NEW_NOTIFICATION",
			"message": message,
		})
	}
	Mutex.Unlock()
}

// ⚠️ ALISIN ANG DUMMY LogSystemAction DITO DAHIL UMIIYAL NA ITO SA audit.go!

// --- ROUTES SETUP ---
func SetupTaskRoutes(r *gin.Engine) {
	// 1. Basic Task Routes
	r.GET("/tasks", GetTasks)
	r.POST("/tasks", CreateTask)
	r.PUT("/tasks/:id", UpdateTask)
	r.DELETE("/tasks/:id", DeleteTask)

	// 2. Status & Approval Routes
	r.PUT("/tasks/:id/status", UpdateTaskStatus)
	r.PATCH("/tasks/:id/request-approval", RequestApproval)
	r.PUT("/tasks/:id/approve", ApproveTaskDecision)
	r.PUT("/tasks/:id/switch-priority", SwitchTaskPriority)

	// 3. Analytics & Notifications
	r.GET("/analytics/stats", GetAnalytics)
	r.GET("/reminders", GetReminders)
	r.GET("/notifications", GetUserNotifications)

	// 4. Notification Read Route (SIGURADUHING NAKA-INDENT SA LOOB)
	r.PUT("/notifications/:id/read", func(c *gin.Context) {
		id := c.Param("id")
		log.Printf("DEBUG: Updating notification %s to read", id)

		_, err := db.DB.Exec("UPDATE notifications SET is_read = true WHERE id = $1", id)
		if err != nil {
			log.Printf("❌ DB Update Error: %v", err)
			c.JSON(500, gin.H{"error": "Failed to update notification"})
			return
		}
		c.Status(200)
	})
}

// --- HANDLER FUNCTIONS ---

func GetTasks(c *gin.Context) {
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

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		log.Printf("❌ GET Error: %v", err)
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
			"id": id, "title": t, "description": d, "status": s,
			"start_date": sd, "end_date": ed, "assigned_to": assigned,
			"is_requesting_approval": isReq,
		})
	}
	c.JSON(200, tasks)
}
func CreateTask(c *gin.Context) {
	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input format"})
		return
	}

	title := fmt.Sprintf("%v", input["title"])
	description := fmt.Sprintf("%v", input["description"])
	startDate := fmt.Sprintf("%v", input["start_date"])
	endDate := fmt.Sprintf("%v", input["end_date"])
	assignedTo := strings.ToLower(strings.TrimSpace(fmt.Sprintf("%v", input["assigned_to"])))

	var count int
	db.DB.QueryRow(`SELECT COUNT(*) FROM tasks WHERE LOWER(TRIM(assigned_to)) = $1 AND status = 'In-Progress'`, assignedTo).Scan(&count)

	newStatus := "In-Progress"
	if count > 0 {
		newStatus = "pending"
	}

	query := `INSERT INTO tasks (title, description, status, assigned_to, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := db.DB.Exec(query, title, description, newStatus, assignedTo, startDate, endDate)
	if err != nil {
		log.Printf("DB Error: %v", err)
		c.JSON(500, gin.H{"error": "Database insert failed"})
		return
	}

	// TAMA: Notification should be outside the error handler
	notifMsg := fmt.Sprintf("You have been assigned a new task: '%s'. Status: %s", title, newStatus)
	addNotification(assignedTo, notifMsg)

	c.JSON(201, gin.H{"message": "Task created successfully", "status": newStatus})
}
func UpdateTask(c *gin.Context) {
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
		c.JSON(400, gin.H{"error": "Invalid fields structure format layout"})
		return
	}

	tx, err := db.DB.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": "Transaction initiation failed"})
		return
	}
	defer tx.Rollback()

	cleanEmail := strings.ToLower(strings.TrimSpace(input.AssignedTo))

	if input.Status == "in-progress" {
		tx.Exec(`UPDATE tasks SET status = 'pending' WHERE LOWER(TRIM(assigned_to)) = $1 AND id != $2 AND status = 'in-progress'`, cleanEmail, id)
	}

	query := `UPDATE tasks SET title = $1, description = $2, status = $3, 
              start_date = NULLIF($4, '')::DATE, end_date = NULLIF($5, '')::DATE, 
              assigned_to = $6 WHERE id = $7`

	_, err = tx.Exec(query, input.Title, input.Description, input.Status, input.StartDate, input.EndDate, cleanEmail, id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Update query execution failed"})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(500, gin.H{"error": "Commit action failed"})
		return
	}

	LogSystemAction("Task Updated", "System Admin", fmt.Sprintf("Modified details for task: '%s' (ID: %s)", input.Title, id))

	c.JSON(200, gin.H{"message": "Task synchronized and updated successfully"})
}

func UpdateTaskStatus(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status               string `json:"status"`
		IsRequestingApproval bool   `json:"is_requesting_approval"`
	}
	c.ShouldBindJSON(&input)

	_, err := db.DB.Exec(`
        UPDATE tasks 
        SET status = $1, is_requesting_approval = $2 
        WHERE id = $3`,
		input.Status, input.IsRequestingApproval, id,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "Database sync failed"})
		return
	}

	c.JSON(200, gin.H{"message": "Status updated successfully"})
}

func DeleteTask(c *gin.Context) {
	id := c.Param("id")

	var title string
	db.DB.QueryRow("SELECT title FROM tasks WHERE id = $1", id).Scan(&title)

	_, err := db.DB.Exec("DELETE FROM tasks WHERE id = $1", id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Delete failed"})
		return
	}

	LogSystemAction("Task Deleted", "System Admin", fmt.Sprintf("Deleted task: '%s'", title))

	c.JSON(200, gin.H{"message": "Deleted"})
}

// ⚡ MASTER FIXED STABLE VERSION: Gumagamit ng tamang native NOT ILIKE syntax parameter blocks
func SwitchTaskPriority(c *gin.Context) {
	taskID := c.Param("id")
	staffEmail := strings.ToLower(strings.TrimSpace(c.Query("email")))

	if taskID == "" || staffEmail == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Missing parameters"})
		return
	}

	// 1. Pause other tasks
	_, err := db.DB.Exec(`UPDATE tasks SET status = 'pending' WHERE assigned_to ILIKE $1 AND NOT status ILIKE 'completed' AND id != $2`, staffEmail, taskID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to pause workload"})
		return
	}

	// 2. Activate target task
	_, err = db.DB.Exec(`UPDATE tasks SET status = 'In-Progress' WHERE id = $1`, taskID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to activate"})
		return
	}

	// 3. Notify and Log (TAMA: Combined logic)
	var taskTitle string
	db.DB.QueryRow("SELECT title FROM tasks WHERE id = $1", taskID).Scan(&taskTitle)
	addNotification(staffEmail, fmt.Sprintf("Priority alert: Your task '%s' is now set to In-Progress.", taskTitle))

	LogSystemAction("Priority Switched", "System Admin", fmt.Sprintf("Reassigned focus to: '%s'", taskTitle))

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Priority updated"})
}
func RequestApproval(c *gin.Context) {
	id := c.Param("id")
	var title, assignedTo string
	db.DB.QueryRow("SELECT title, assigned_to FROM tasks WHERE id = $1", id).Scan(&title, &assignedTo)
	db.DB.Exec(`UPDATE tasks SET is_requesting_approval = true WHERE id = $1`, id)

	addNotification("adminnnn01@gmail.com", fmt.Sprintf("Approval Request: %s has finished '%s'", assignedTo, title))

	LogSystemAction("Approval Requested", "Staff Member", fmt.Sprintf("Requested approval for task: '%s'", title))

	c.JSON(200, gin.H{"message": "Request sent"})
}

func ApproveTaskDecision(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Action string `json:"action"`
	}
	c.ShouldBindJSON(&input)

	var title, assignedTo string
	db.DB.QueryRow("SELECT title, assigned_to FROM tasks WHERE id = $1", id).Scan(&title, &assignedTo)

	targetStatus, notifMsg := "completed", fmt.Sprintf("Task Approved: '%s'", title)
	actionWord := "Approved"

	if input.Action == "reject" {
		targetStatus, notifMsg = "rejected", fmt.Sprintf("Action Required: Admin rejected '%s'.", title)
		actionWord = "Rejected"
	}

	db.DB.Exec(`UPDATE tasks SET status = $1, is_requesting_approval = false WHERE id = $2`, targetStatus, id)
	addNotification(assignedTo, notifMsg)

	LogSystemAction(fmt.Sprintf("Task %s", actionWord), "System Admin", fmt.Sprintf("%s task: '%s'", actionWord, title))

	c.JSON(200, gin.H{"message": "Decision updated"})
}

func GetAnalytics(c *gin.Context) {
	var pending, inProgress, completed, overdue int
	db.DB.QueryRow("SELECT COUNT(*) FROM tasks WHERE status = 'pending'").Scan(&pending)
	db.DB.QueryRow("SELECT COUNT(*) FROM tasks WHERE status = 'in-progress'").Scan(&inProgress)
	db.DB.QueryRow("SELECT COUNT(*) FROM tasks WHERE status = 'completed'").Scan(&completed)
	db.DB.QueryRow(`SELECT COUNT(*) FROM tasks WHERE status != 'completed' AND end_date IS NOT NULL AND end_date < CURRENT_DATE`).Scan(&overdue)

	c.JSON(200, gin.H{"pending": pending, "in_progress": inProgress, "completed": completed, "overdue": overdue, "total": pending + inProgress + completed})
}

func GetReminders(c *gin.Context) {
	reminders := make([]gin.H, 0)
	rows, _ := db.DB.Query(`SELECT id, title, COALESCE(end_date::text, '') FROM tasks WHERE status != 'completed' AND end_date IS NOT NULL AND title != '' ORDER BY end_date ASC LIMIT 5`)
	defer rows.Close()
	for rows.Next() {
		var id int
		var title, endDate string
		rows.Scan(&id, &title, &endDate)
		reminders = append(reminders, gin.H{"id": id, "title": title, "end_date": endDate})
	}
	c.JSON(200, reminders)
}

func GetUserNotifications(c *gin.Context) {
	email := strings.ToLower(strings.TrimSpace(c.Query("email")))
	notifications := make([]gin.H, 0)
	rows, _ := db.DB.Query(`SELECT id, message, is_read, created_at FROM notifications WHERE LOWER(user_email) = $1 ORDER BY created_at DESC LIMIT 15`, email)
	defer rows.Close()
	for rows.Next() {
		var id int
		var msg, created string
		var read bool
		rows.Scan(&id, &msg, &read, &created)
		notifications = append(notifications, gin.H{"id": id, "message": msg, "is_read": read, "created_at": created})
	}
	c.JSON(200, notifications)
}
