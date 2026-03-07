-- Tasko Database Schema
-- Run against Neon PostgreSQL

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'running',
  color VARCHAR(50),
  icon VARCHAR(10),
  due_date DATE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  avatar_url VARCHAR(500),
  initials VARCHAR(5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  assigned_to INTEGER REFERENCES team_members(id) ON DELETE SET NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task tags table (many-to-many)
CREATE TABLE IF NOT EXISTS task_tags (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time_start TIME,
  time_end TIME,
  reminder_date DATE,
  type VARCHAR(50) DEFAULT 'meeting',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  event_time TIME NOT NULL,
  duration VARCHAR(50),
  event_type VARCHAR(50) DEFAULT 'meeting',
  color VARCHAR(50),
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics weekly data
CREATE TABLE IF NOT EXISTS analytics_weekly (
  id SERIAL PRIMARY KEY,
  day_label VARCHAR(10) NOT NULL,
  day_name VARCHAR(20) NOT NULL,
  value INTEGER NOT NULL,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  team_member_id INTEGER REFERENCES team_members(id) ON DELETE SET NULL,
  seconds_elapsed INTEGER DEFAULT 0,
  is_running BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team task assignments (for collaboration view)
CREATE TABLE IF NOT EXISTS team_tasks (
  id SERIAL PRIMARY KEY,
  team_member_id INTEGER REFERENCES team_members(id) ON DELETE CASCADE,
  task_description VARCHAR(500) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
