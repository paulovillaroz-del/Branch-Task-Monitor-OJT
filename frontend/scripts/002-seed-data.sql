-- Seed projects
INSERT INTO projects (name, description, status, progress, color, icon, due_date) VALUES
  ('Develop API Endpoints', 'Build REST API endpoints for the application', 'running', 65, 'bg-blue-500', 'zap', '2024-11-26'),
  ('Onboarding Flow', 'Create user onboarding experience', 'running', 40, 'bg-cyan-500', 'waves', '2024-11-28'),
  ('Build Dashboard', 'Design and build the main dashboard', 'running', 80, 'bg-emerald-500', 'palette', '2024-11-30'),
  ('Optimize Page Load', 'Improve performance and page load times', 'pending', 20, 'bg-amber-500', 'zap', '2024-12-05'),
  ('Cross-Browser Testing', 'Test across all major browsers', 'pending', 10, 'bg-purple-500', 'search', '2024-12-06');

-- Seed team members
INSERT INTO team_members (name, role, email, status, avatar_url, initials) VALUES
  ('Alexandra Deff', 'Product Designer', 'alexandra@tasko.com', 'active', '/avatars/avatar-1.jpg', 'AD'),
  ('Edwin Adenike', 'Frontend Developer', 'edwin@tasko.com', 'active', '/avatars/avatar-2.jpg', 'EA'),
  ('Isaac Oluwatemilorun', 'Backend Developer', 'isaac@tasko.com', 'away', '/avatars/avatar-3.jpg', 'IO'),
  ('David Oshodi', 'UI/UX Designer', 'david@tasko.com', 'active', '/avatars/avatar-4.jpg', 'DO');

-- Seed tasks
INSERT INTO tasks (title, description, project_id, priority, status, due_date, completed, assigned_to) VALUES
  ('Design landing page mockup', 'Create mockup for the website redesign landing page', 1, 'High', 'active', '2024-11-24', false, 1),
  ('Implement authentication flow', 'Build user auth system for mobile app', 2, 'High', 'active', '2024-11-25', false, 2),
  ('Review pull requests', 'Review open PRs in the Github project', 1, 'Medium', 'completed', '2024-11-23', true, 3),
  ('Update documentation', 'Update API development documentation', 1, 'Low', 'active', '2024-11-26', false, 4),
  ('Fix responsive layout issues', 'Fix layout bugs on mobile devices', 3, 'High', 'active', '2024-11-24', false, 1),
  ('Database optimization', 'Optimize database queries for performance', 1, 'Medium', 'active', '2024-11-27', false, 3);

-- Seed task tags
INSERT INTO task_tags (task_id, tag) VALUES
  (1, 'Design'), (1, 'UI/UX'),
  (2, 'Backend'), (2, 'Security'),
  (3, 'Code Review'),
  (4, 'Documentation'),
  (5, 'Frontend'), (5, 'Bug'),
  (6, 'Database'), (6, 'Performance');

-- Seed reminders
INSERT INTO reminders (title, description, reminder_date, time_start, time_end, type) VALUES
  ('Meeting with Arc Company', 'Discuss project requirements and timeline', CURRENT_DATE, '14:00', '16:00', 'meeting');

-- Seed calendar events
INSERT INTO calendar_events (title, event_date, event_time, duration, event_type, color) VALUES
  ('Team Standup', '2024-11-17', '09:00', '30 min', 'meeting', 'bg-blue-500'),
  ('Design Review', '2024-11-17', '11:00', '1 hour', 'review', 'bg-purple-500'),
  ('Client Presentation', '2024-11-17', '14:00', '2 hours', 'presentation', 'bg-green-600'),
  ('Code Review Session', '2024-11-17', '16:30', '45 min', 'meeting', 'bg-amber-500');

-- Seed analytics weekly data
INSERT INTO analytics_weekly (week_start, day_label, day_name, value) VALUES
  ('2024-11-11', 'S', 'Sunday', 45),
  ('2024-11-11', 'M', 'Monday', 75),
  ('2024-11-11', 'T', 'Tuesday', 74),
  ('2024-11-11', 'W', 'Wednesday', 92),
  ('2024-11-11', 'T', 'Thursday', 35),
  ('2024-11-11', 'F', 'Friday', 60),
  ('2024-11-11', 'S', 'Saturday', 50);

-- Seed team tasks (collaboration view)
INSERT INTO team_tasks (team_member_id, task_description, status) VALUES
  (1, 'Github Project Repository', 'Completed'),
  (2, 'Integrate User Authentication System', 'In Progress'),
  (3, 'Develop Search and Filter Functionality', 'Pending'),
  (4, 'Responsive Layout for Homepage', 'In Progress');

-- Seed a time entry
INSERT INTO time_entries (task_id, team_member_id, started_at, seconds_elapsed, is_running) VALUES
  (1, 1, NOW() - INTERVAL '24 hours 8 seconds', 86408, true);
