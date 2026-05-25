package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

// DB ay naka-capital para magamit ng ibang files sa handlers package
var DB *sql.DB

func Connect() {
	var err error

	// 📋 LISTAHAN NG MGA SUBSUBUKANG PASSWORD SA PORT 5432
	// Dito natin iisa-isahin ang mga karaniwang password sa Port 5432 para
	// makapasok ang Go sa kung nasaan ang totoong tables na nakikita ng frontend mo.
	passwords := []string{"postgres", "admin", "root", "ojt1234", "12345", ""}

	log.Println("🔄 Initializing strict connection grid override for Port 5432...")

	for _, pwd := range passwords {
		dsn := fmt.Sprintf("host=127.0.0.1 user=postgres password=%s dbname=branch_task_db port=5432 sslmode=disable", pwd)

		DB, err = sql.Open("postgres", dsn)
		if err != nil {
			continue
		}

		// I-verify kung tatanggapin ng database ang password na ito
		if err = DB.Ping(); err == nil {
			log.Printf("✅ [CRITICAL SUCCESS] Go Backend successfully connected and locked to Port 5432!")
			return
		}
	}

	// Kung matapos ang loop at ayaw talaga, gagamit tayo ng pinal na safety tracker fallback sa 5433
	log.Println("⚠️ Port 5432 connection rejected. Attempting emergency fallback connection to Port 5433...")
	dsnFallback := "host=127.0.0.1 user=postgres password=ojt12345 dbname=branch_task_db port=5433 sslmode=disable"
	DB, err = sql.Open("postgres", dsnFallback)
	if err == nil {
		if err = DB.Ping(); err == nil {
			log.Println("✅ Connected to Backup Database on Port 5433.")
			return
		}
	}

	log.Fatal("❌ Fatal Error: All database validation checks failed. Please ensure pgAdmin service is active.")
}
