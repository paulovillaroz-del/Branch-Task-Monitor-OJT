package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"net/smtp"
	"strings"
	"time"

	// PALITAN KUNG KAILANGAN: Kung nag-error ito, palitan ang "backend" ng pangalan sa go.mod mo
	"branch-task-api/db"

	"github.com/gin-gonic/gin"
)

// --- HELPERS PARA SA EMAIL ---
func sendResetEmail(targetEmail string, code string) error {
	from := "Adminnnn01@gmail.com"
	password := "zekfwukwqmmhjxjv"
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	targetEmail = strings.ToLower(strings.TrimSpace(targetEmail))

	headerSubject := "Subject: Task Monitor Reset Code\n"
	headerMime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"

	body := fmt.Sprintf(`
		<html>
			<body style="font-family: sans-serif; text-align: center; padding: 20px;">
				<h2 style="color: #333;">Security Verification</h2>
				<p>Use the code below to reset your password. It expires in 15 minutes.</p>
				<h1 style="background: #f4f4f4; padding: 20px; display: inline-block; letter-spacing: 5px; color: #059669; border-radius: 10px;">%s</h1>
			</body>
		</html>`, code)

	message := []byte(headerSubject + headerMime + body)
	auth := smtp.PlainAuth("", from, password, smtpHost)

	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{targetEmail}, message)
}

func generateOTP() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

// --- ITO ANG TATAWAGIN SA MAIN.GO ---
func SetupAuthRoutes(r *gin.Engine) {
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
		err := db.DB.QueryRow("SELECT password, role, full_name FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))", cleanEmail).Scan(&dbPass, &role, &fullName)
		if err != nil || input.Password != dbPass {
			c.JSON(401, gin.H{"error": "Authentication failed"})
			return
		}
		c.JSON(200, gin.H{"role": role, "full_name": fullName, "email": cleanEmail})
	})

	r.POST("/register", func(c *gin.Context) {
		var input struct {
			FullName string `json:"full_name" binding:"required"`
			Email    string `json:"email" binding:"required"`
			Password string `json:"password" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "All fields are required"})
			return
		}

		cleanEmail := strings.ToLower(strings.TrimSpace(input.Email))
		var exists bool
		db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(TRIM(email)) = $1)", cleanEmail).Scan(&exists)
		if exists {
			c.JSON(400, gin.H{"error": "Email is already registered"})
			return
		}

		_, err := db.DB.Exec(`INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, 'user')`, input.FullName, cleanEmail, input.Password)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to create account sa database"})
			return
		}
		c.JSON(201, gin.H{"message": "Account created successfully!"})
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
		db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(TRIM(email)) = $1)", cleanEmail).Scan(&exists)
		if !exists {
			c.JSON(404, gin.H{"error": "User with this email does not exist"})
			return
		}

		code := generateOTP()
		_, err := db.DB.Exec(`UPDATE users SET reset_code = $1, reset_expiry = NOW() + INTERVAL '15 minutes' WHERE LOWER(TRIM(email)) = $2`, code, cleanEmail)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to generate security code"})
			return
		}

		go func(email, code string) {
			err := sendResetEmail(email, code)
			if err != nil {
				log.Printf("❌ SMTP ERROR for %s: %v", email, err)
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

		// INAYOS: Ginamit ang sql.NullTime para hindi mag-crash kapag NULL sa database
		var expiry sql.NullTime

		err := db.DB.QueryRow("SELECT reset_code, reset_expiry FROM users WHERE LOWER(TRIM(email)) = $1", cleanEmail).Scan(&dbCode, &expiry)
		if err != nil || !dbCode.Valid || dbCode.String != cleanCode {
			c.JSON(401, gin.H{"error": "Invalid verification code"})
			return
		}

		// INAYOS: Checking validation logic para sa NullTime
		if !expiry.Valid || time.Now().After(expiry.Time) {
			c.JSON(401, gin.H{"error": "Code has expired."})
			return
		}

		_, err = db.DB.Exec("UPDATE users SET password = $1, reset_code = NULL, reset_expiry = NULL WHERE LOWER(TRIM(email)) = $2", input.NewPassword, cleanEmail)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to update password"})
			return
		}
		c.JSON(200, gin.H{"message": "Password updated successfully!"})
	})

	r.GET("/users", func(c *gin.Context) {
		users := make([]gin.H, 0)
		// PALITAN MO ANG QUERY NA ITO SA GET /users
		query := `SELECT u.email, u.full_name, u.role, 
          (SELECT COUNT(*) FROM tasks t WHERE LOWER(TRIM(t.assigned_to)) = LOWER(TRIM(u.email)) AND t.status = 'in-progress') as active_count,
          (SELECT title FROM tasks t WHERE LOWER(TRIM(t.assigned_to)) = LOWER(TRIM(u.email)) AND t.status = 'in-progress' LIMIT 1) as active_title,
          (SELECT start_date FROM tasks t WHERE LOWER(TRIM(t.assigned_to)) = LOWER(TRIM(u.email)) AND t.status = 'in-progress' LIMIT 1) as active_start,
          (SELECT end_date FROM tasks t WHERE LOWER(TRIM(t.assigned_to)) = LOWER(TRIM(u.email)) AND t.status = 'in-progress' LIMIT 1) as active_end
          FROM users u` // <--- INALIS NATIN ANG "WHERE u.role = 'user'" PARA LUMABAS LAHAT KASAMA ANG ADMIN

		rows, err := db.DB.Query(query)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch users"})
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
				"current_task": gin.H{"title": title.String, "start_date": start.String, "end_date": end.String},
			})
		}
		c.JSON(200, users)
	})

	// ========================================================
	// MGA BAGONG ROUTES PARA SA SETTINGS PAGE (Profile & Security)
	// ========================================================

	// 1. UPDATE PROFILE
	r.PUT("/user/profile", func(c *gin.Context) {
		var input struct {
			OldEmail string `json:"old_email" binding:"required"`
			NewEmail string `json:"new_email" binding:"required"`
			FullName string `json:"full_name" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			fmt.Println("❌ BINDING ERROR (Profile):", err.Error())
			c.JSON(400, gin.H{"error": "Binding error: " + err.Error()})
			return
		}

		cleanOld := strings.ToLower(strings.TrimSpace(input.OldEmail))
		cleanNew := strings.ToLower(strings.TrimSpace(input.NewEmail))

		_, err := db.DB.Exec("UPDATE users SET email = $1, full_name = $2 WHERE LOWER(TRIM(email)) = $3", cleanNew, input.FullName, cleanOld)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to update profile. Email might be in use."})
			return
		}

		c.JSON(200, gin.H{
			"email":     cleanNew,
			"full_name": input.FullName,
		})
	})

	// 2. SEND VERIFICATION CODE (Settings > Change Password)
	r.POST("/user/send-code", func(c *gin.Context) {
		var input struct {
			Email string `json:"email" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			fmt.Println("❌ BINDING ERROR (Send Code):", err.Error())
			c.JSON(400, gin.H{"error": "Binding error: " + err.Error()})
			return
		}

		cleanEmail := strings.ToLower(strings.TrimSpace(input.Email))

		var exists bool
		db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(TRIM(email)) = $1)", cleanEmail).Scan(&exists)
		if !exists {
			c.JSON(404, gin.H{"error": "User with this email does not exist"})
			return
		}

		code := generateOTP()

		_, err := db.DB.Exec(`UPDATE users SET reset_code = $1, reset_expiry = NOW() + INTERVAL '15 minutes' WHERE LOWER(TRIM(email)) = $2`, code, cleanEmail)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to generate security code"})
			return
		}

		go func(email, code string) {
			err := sendResetEmail(email, code)
			if err != nil {
				log.Printf("❌ SMTP ERROR for %s: %v", email, err)
			}
		}(cleanEmail, code)

		c.JSON(200, gin.H{"message": "Verification code sent to email!"})
	})

	// 3. VERIFY AND CHANGE PASSWORD
	r.POST("/user/change-password", func(c *gin.Context) {
		var input struct {
			Email       string `json:"email" binding:"required"`
			Code        string `json:"code" binding:"required"`
			NewPassword string `json:"new_password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			fmt.Println("❌ BINDING ERROR (Change Password):", err.Error())
			c.JSON(400, gin.H{"error": "Binding error: " + err.Error()})
			return
		}

		cleanEmail := strings.ToLower(strings.TrimSpace(input.Email))
		cleanCode := strings.TrimSpace(input.Code)

		var dbCode sql.NullString

		// INAYOS: Ginamit rin natin ang sql.NullTime rito para safe!
		var expiry sql.NullTime

		err := db.DB.QueryRow("SELECT reset_code, reset_expiry FROM users WHERE LOWER(TRIM(email)) = $1", cleanEmail).Scan(&dbCode, &expiry)
		if err != nil || !dbCode.Valid || dbCode.String != cleanCode {
			c.JSON(401, gin.H{"error": "Invalid verification code"})
			return
		}

		// INAYOS: Checking validation logic
		if !expiry.Valid || time.Now().After(expiry.Time) {
			c.JSON(401, gin.H{"error": "Code has expired."})
			return
		}

		_, err = db.DB.Exec("UPDATE users SET password = $1, reset_code = NULL, reset_expiry = NULL WHERE LOWER(TRIM(email)) = $2", input.NewPassword, cleanEmail)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to update password"})
			return
		}

		c.JSON(200, gin.H{"message": "Password changed successfully!"})
	})
}
