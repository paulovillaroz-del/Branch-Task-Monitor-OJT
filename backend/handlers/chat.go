package handlers

import (
	"fmt"
	"net/http"
	"os"
	"sync" // Kailangan ito para sa Mutex
	"time"

	"branch-task-api/db"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket" // Siguraduhin na naka-import ang websocket
)

// EXPORTED VARIABLES (Capitalized para ma-access ng ibang files sa package 'handlers')
var Clients = make(map[string]*websocket.Conn)
var Mutex = &sync.Mutex{}

type Message struct {
	ID            int       `json:"id"`
	SenderEmail   string    `json:"sender_email"`
	ReceiverEmail string    `json:"receiver_email"`
	MessageText   string    `json:"message_text"`
	ImageURL      *string   `json:"image_url"`
	IsRead        bool      `json:"is_read"`
	CreatedAt     time.Time `json:"created_at"`
}

func SetupMessageRoutes(r *gin.Engine) {
	r.POST("/messages", SendMessage)
	r.GET("/messages", GetMessages)
	r.POST("/upload", UploadImage)
	// Idagdag ang WebSocket route kung hindi pa ito nakalagay
	r.GET("/ws/chat", HandleChatWebSocket)
}

// =========================================================
// WEBSOCKET HANDLER (Para sa live notification/chat)
// =========================================================
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func HandleChatWebSocket(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	Mutex.Lock()
	Clients[email] = conn
	Mutex.Unlock()

	defer func() {
		Mutex.Lock()
		delete(Clients, email)
		Mutex.Unlock()
		conn.Close()
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

// =========================================================
// 1. UPLOAD IMAGE HANDLER
// =========================================================
func UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image provided"})
		return
	}

	// Gagawa ng 'uploads' folder kung wala pa
	os.MkdirAll("uploads", os.ModePerm)

	// Unique filename para di mag-overwrite
	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
	filepath := "uploads/" + filename

	// I-save sa laptop/server
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"image_url": "/" + filepath})
}

// =========================================================
// 2. SEND MESSAGE HANDLER
// =========================================================
func SendMessage(c *gin.Context) {
	var msg Message
	if err := c.ShouldBindJSON(&msg); err != nil {
		fmt.Println("Bind Error:", err) // Para makita sa terminal kung bakit 400
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	query := `INSERT INTO messages (sender_email, receiver_email, message_text, image_url) VALUES ($1, $2, $3, $4) RETURNING id, created_at`

	// Tiyaking 'db.DB' ang variable mo, minsan 'db.Conn' ito depende sa pagkakagawa mo
	err := db.DB.QueryRow(query, msg.SenderEmail, msg.ReceiverEmail, msg.MessageText, msg.ImageURL).Scan(&msg.ID, &msg.CreatedAt)
	if err != nil {
		fmt.Println("DB Insert Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	c.JSON(http.StatusCreated, msg)
}

// =========================================================
// 3. GET MESSAGES HANDLER
// =========================================================
func GetMessages(c *gin.Context) {
	user1 := c.Query("user1")
	user2 := c.Query("user2")

	if user1 == "" || user2 == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing params"})
		return
	}

	query := `
		SELECT id, sender_email, receiver_email, message_text, image_url, is_read, created_at 
		FROM messages 
		WHERE (sender_email = $1 AND receiver_email = $2) 
		   OR (sender_email = $2 AND receiver_email = $1)
		ORDER BY created_at ASC`

	rows, err := db.DB.Query(query, user1, user2)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}
	defer rows.Close()

	messages := []Message{}
	for rows.Next() {
		var msg Message
		if err := rows.Scan(&msg.ID, &msg.SenderEmail, &msg.ReceiverEmail, &msg.MessageText, &msg.ImageURL, &msg.IsRead, &msg.CreatedAt); err != nil {
			continue
		}
		messages = append(messages, msg)
	}

	c.JSON(http.StatusOK, messages)
}

// Ilagay ito sa loob ng handlers/chat.go
func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	email := c.Query("email")
	if email != "" {
		Mutex.Lock()
		Clients[email] = conn
		Mutex.Unlock()

		defer func() {
			Mutex.Lock()
			delete(Clients, email)
			Mutex.Unlock()
		}()
	}

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

// Sa iyong SendMessage o sa isang bagong function para sa status:
func SendStatusUpdate(email string, status string) {
	Mutex.Lock()
	conn, ok := Clients[email]
	Mutex.Unlock()

	if ok {
		// Magpapadala tayo ng special JSON para alam ng app na typing si admin
		conn.WriteJSON(gin.H{"type": "status", "status": status})
	}
}
