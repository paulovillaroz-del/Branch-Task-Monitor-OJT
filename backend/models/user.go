package models

type User struct {
	Email    string `json:"email"`
	Password string `json:"password,omitempty"` // Added omitempty so it's hidden in JSON responses
	FullName string `json:"full_name"`
	Role     string `json:"role"`
}
