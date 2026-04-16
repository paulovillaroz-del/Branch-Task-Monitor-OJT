type Task struct {
	ID                   int    `json:"id"`
	Title                string `json:"title"`
	Description          string `json:"description"`
	Status               string `json:"status"`
	StartDate            string `json:"start_date"`
	EndDate              string `json:"end_date"`
	AssignedTo           string `json:"assigned_to"` // The email of the staff member
	IsRequestingApproval bool   `json:"is_requesting_approval"`
}