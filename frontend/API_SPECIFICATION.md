# API Specification

## Backend (Hono)

Base URL: `import.meta.env.VITE_API_BASE_URL`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Health Check | No |
| GET | `/version.json` | Version Info | No |
| GET | `/health` | Health Check | No |

## Supabase (Direct Integration)

The application interacts directly with Supabase for Authentication and Data Storage.

### Authentication (Supabase Auth)

Using `@supabase/supabase-js`:
- `supabase.auth.signInWithPassword`
- `supabase.auth.signUp`
- `supabase.auth.signOut`
- `supabase.auth.onAuthStateChange`

### Database (Supabase Table: `saved_leads`)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary Key |
| user_id | uuid | Foreign Key to Auth User |
| company_name | text | |
| industry | text | |
| website | text | |
| email | text | |
| linkedin | text | |
| role | text | |
| location | text | |
| company_size | text | |
| enrichment | jsonb | AI Enrichment Data |
| generated_emails | jsonb | List of Outreach Emails |
| generated_linkedin | jsonb | List of LinkedIn Messages |
| created_at | timestamp | Default: now() |