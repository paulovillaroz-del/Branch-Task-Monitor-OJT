package models

// Task represents the task table in the database
type Task struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	// Gamit ang string dito para madaling i-parse mula sa JSON
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	// Siguraduhing Email ang laman nito kung VARCHAR ang DB column mo
	AssignedTo           string `json:"assigned_to"`
	IsRequestingApproval bool   `json:"is_requesting_approval"`
}
