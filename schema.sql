CREATE TABLE IF NOT EXISTS app_meta (key text PRIMARY KEY, value text NOT NULL);
CREATE TABLE IF NOT EXISTS units (id text PRIMARY KEY, name text NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS categories (id text PRIMARY KEY, name text NOT NULL, icon text NOT NULL DEFAULT 'message', description text NOT NULL DEFAULT '', unit_id text REFERENCES units(id), sla_hours integer NOT NULL DEFAULT 72 CHECK(sla_hours BETWEEN 1 AND 720), sensitive boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT true);
CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE, password_hash text, role text NOT NULL CHECK(role IN ('student','triage','unit','specialist','leader','admin')), unit_id text REFERENCES units(id), student_number text, study_program text, cohort_year integer, phone text, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_number text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS study_program text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cohort_year integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
CREATE UNIQUE INDEX IF NOT EXISTS users_student_number_unique_idx ON users(student_number) WHERE student_number IS NOT NULL;
CREATE TABLE IF NOT EXISTS sessions (token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
CREATE SEQUENCE IF NOT EXISTS ticket_sequence;
CREATE TABLE IF NOT EXISTS tickets (
 id text PRIMARY KEY, number text NOT NULL UNIQUE, access_hash text NOT NULL,
 reporter_id text REFERENCES users(id), title text NOT NULL, description text NOT NULL,
 category_id text NOT NULL REFERENCES categories(id), unit_id text REFERENCES units(id),
 status text NOT NULL DEFAULT 'received' CHECK(status IN ('received','verified','assigned','in_progress','needs_info','awaiting_confirmation','resolved','rejected','closed')),
 priority text NOT NULL DEFAULT 'normal' CHECK(priority IN ('normal','high','urgent')),
 sensitive boolean NOT NULL DEFAULT false, confidential boolean NOT NULL DEFAULT false,
 location text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 due_at timestamptz NOT NULL, resolved_at timestamptz, version integer NOT NULL DEFAULT 1,
 rating integer CHECK(rating BETWEEN 1 AND 5), feedback text, escalated boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS tickets_reporter_date_idx ON tickets(reporter_id,created_at DESC);
CREATE INDEX IF NOT EXISTS tickets_queue_idx ON tickets(unit_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS tickets_category_idx ON tickets(category_id,created_at DESC);
CREATE INDEX IF NOT EXISTS tickets_due_idx ON tickets(due_at) WHERE status NOT IN ('resolved','rejected','closed');
CREATE INDEX IF NOT EXISTS tickets_search_idx ON tickets USING gin(to_tsvector('simple', title || ' ' || description));
CREATE TABLE IF NOT EXISTS events (id text PRIMARY KEY, ticket_id text NOT NULL REFERENCES tickets(id), actor_id text REFERENCES users(id), actor_label text NOT NULL, kind text NOT NULL, body text NOT NULL, status text, internal boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS events_ticket_idx ON events(ticket_id,created_at);
CREATE TABLE IF NOT EXISTS attachments (id text PRIMARY KEY, ticket_id text NOT NULL REFERENCES tickets(id), name text NOT NULL, mime text NOT NULL, size integer NOT NULL CHECK(size>0), storage_key text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS attachments_ticket_idx ON attachments(ticket_id);
CREATE TABLE IF NOT EXISTS notifications (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id), ticket_id text REFERENCES tickets(id), title text NOT NULL, body text NOT NULL, read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS audit_logs (id text PRIMARY KEY, actor_id text REFERENCES users(id), action text NOT NULL, entity_id text, detail text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS audit_date_idx ON audit_logs(created_at DESC);
CREATE TABLE IF NOT EXISTS outbox (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id), subject text NOT NULL, body text NOT NULL, status text NOT NULL DEFAULT 'pending', attempts integer NOT NULL DEFAULT 0, last_error text, next_attempt_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS outbox_pending_idx ON outbox(status,next_attempt_at);
CREATE TABLE IF NOT EXISTS rate_limits (key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL);
