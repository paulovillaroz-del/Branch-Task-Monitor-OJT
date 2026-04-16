// GetUsers fetches all users with a specific role
func GetUsers(c *gin.Context) {
	role := c.Query("role")

	// CRITICAL: Initialize as an empty slice so it returns [] instead of null
	// This prevents the "Unexpected non-whitespace character" error in the UI
	users := []models.User{}

	query := "SELECT email, full_name FROM users"
	var rows *sql.Rows
	var err error

	if role != "" {
		query += " WHERE role = $1"
		// Use your DB connection (likely db.DB or similar from your db/db.go)
		rows, err = db.DB.Query(query, role)
	} else {
		rows, err = db.DB.Query(query)
	}

	if err != nil {
		// Send a JSON error, not a plain string
		c.JSON(500, gin.H{"error": "Database query failed"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.Email, &u.FullName); err != nil {
			continue
		}
		users = append(users, u)
	}

	c.JSON(200, users)
}