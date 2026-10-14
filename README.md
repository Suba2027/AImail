# AImail (ReachAI) — Email Campaign Scheduling Platform

A full-stack email campaign scheduler: Google login, CSV lead import,
AI-personalized email content, and a Redis-backed delayed-job scheduler
that sends emails reliably without cron — with rate limiting, retry
with backoff, and crash-safe idempotency.

## Stack
- **Backend:** Java 21, Spring Boot 3.3, Spring Security + OAuth2 + JWT,
  MySQL (Spring Data JPA), Redis (Redisson), Spring Mail
- **Frontend:** React 18 + Vite, React Router, Tailwind CSS, axios

## Prerequisites
- Java 21 (JDK)
- Maven
- MySQL running locally (or update `DB_HOST`/`DB_PORT` in `.env`)
- Redis running locally (`docker run -d -p 6379:6379 redis` is the easiest way)
- Node.js 18+ and npm
- A Google OAuth2 Client ID/Secret ([console.cloud.google.com](https://console.cloud.google.com/apis/credentials))
  — set the authorized redirect URI to `http://localhost:8080/login/oauth2/code/google`
- An Ethereal test SMTP account ([ethereal.email/create](https://ethereal.email/create))
  — free, disposable, and lets you see "sent" emails without spamming anyone

## Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env and fill in: DB_PASSWORD, JWT_SECRET, GOOGLE_CLIENT_ID,
# GOOGLE_CLIENT_SECRET, SMTP_USERNAME, SMTP_PASSWORD
mvn spring-boot:run
```

The `.env` file is loaded automatically via `spring.config.import` in
`application.yml` — no need to export environment variables manually, as
long as you run `mvn` from inside the `backend/` folder (where `.env` lives).

You should see `Tomcat started on port 8080` with no errors. If MySQL
isn't running or the database doesn't exist yet, Hibernate will create
the schema automatically (`createDatabaseIfNotExist=true` in the JDBC URL).

### Optional: turn on AI email personalization
By default, `AI_ENABLED=false` and every email uses a simple template.
To turn on real AI-personalized subject/body generation per lead, set in `.env`:
```
AI_ENABLED=true
AI_PROVIDER_API_KEY=sk-...          # your own OpenAI (or compatible) API key
AI_MODEL=gpt-4o-mini
```
If the AI call fails for any reason (bad key, timeout, rate limit), the
service automatically falls back to the plain template — a campaign
will never get stuck because of an AI failure.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000`.

## The full flow
```
Google Login
     ↓
Create Campaign (name, objective, start time, hourly limit, delay)
     ↓
Upload Leads (CSV: name, email, company, designation)
     ↓
Schedule Campaign  →  EmailJobs created (AI-personalized or templated)
     ↓                staggered by max(delaySeconds, 3600/hourlyLimit)
     ↓
Redis delayed queue (NOT cron — RDelayedQueue, survives restarts via
     ↓                startup reconciliation)
Worker threads (configurable concurrency)
     ↓
Distributed lock (idempotency) → Rate limiter (per-campaign, non-blocking)
     ↓
SMTP send (Ethereal) → SENT, or RETRYING with backoff (10s/30s/60s), or
                        FAILED after 3 attempts
     ↓
Campaign Detail page — live job status table, polls every 5s
```

## Design decisions worth knowing for an interview
- **No cron jobs anywhere.** Scheduling uses Redisson's `RDelayedQueue`,
  which holds jobs in Redis until their delay elapses, then moves them
  to a blocking queue workers consume from.
- **`EmailJobProcessor` is a separate Spring bean from `EmailWorkerService`.**
  `@Transactional` only applies when a method is called through Spring's
  proxy — calling it from within the same class (self-invocation) silently
  skips the transaction, which caused a real `LazyInitializationException`
  bug during development. Keeping these as two beans avoids that.
- **Startup reconciliation.** On boot, any `EmailJob` still `SCHEDULED` or
  `RETRYING` gets re-pushed into the delayed queue — this covers the case
  where Redis lost its queue state (e.g. restarted without persistence)
  while the database still thinks the job is pending. Double-enqueuing is
  safe because of the idempotency lock + status check in `EmailJobProcessor`.
- **Distributed lock uses a lease time**, not just `tryLock()` — if a worker
  crashes mid-processing, the lock auto-expires instead of deadlocking that
  job forever.
- **Rate limiter uses non-blocking `tryAcquire()`**, not blocking `acquire()`
  — with a fixed-size thread pool, a blocking call would starve the whole
  pool under load.
- **Rate-limit reschedules don't increment `attemptCount`** — only genuine
  SMTP send failures count as an "attempt." A job throttled repeatedly
  should never reach `FAILED` purely from being rate-limited.
- **`/api/**` returns a clean 401 JSON on missing/expired auth**, instead of
  Spring's default behavior of redirecting into the Google OAuth2 login
  flow — which an axios/XHR call can't follow, and which the browser
  reports as a confusing CORS "Network Error."
- **No IDOR:** `UserController` only exposes `/api/users/me` — there's no
  way to enumerate other users' profiles by ID.

## What's not included yet (deliberately out of scope for this pass)
- **Elasticsearch** — indexing sent/scheduled emails for full-text search
  was in the original spec but adds real infra complexity (a service to
  run, indexing logic, sync-on-status-change) for limited interview payoff
  relative to everything else here. Worth adding as a follow-up if there's
  time before an interview.
- **Slack notifications on rate-limit hit** — same reasoning; the real
  OAuth + webhook flow is a self-contained feature that can be layered on
  independently once the core is solid.
- **Multi-sender support** — rate limiting is per-campaign, not per-sender,
  since there's no separate "sender" entity in this scope.
