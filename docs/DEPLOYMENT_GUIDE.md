# APIWatch — Production Deployment & Operations Guide

**Version**: v1.0.0 (MVP)  
**Target Environment**: Linux VPS (Ubuntu 22.04 / 24.04 LTS) with Docker & Docker Compose  
**Security Level**: Production Hardened  

---

## 1. Architecture Overview

APIWatch production architecture runs five containerized services orchestrated via Docker Compose:

```
[ Public Internet: HTTPS (443) / HTTP (80) ]
                     │
                     ▼
       ┌───────────────────────────┐
       │ reverse-proxy (Caddy 2.8) │  <-- Auto Let's Encrypt TLS, HTTP/3 QUIC,
       └─────────────┬─────────────┘      HSTS, Security Headers, Gzip/Zstd
                     │ (Internal Docker Network)
         ┌───────────┴───────────┐
         ▼                       │
┌──────────────────┐             │
│   web (Next 16)  │             │
│   Standalone     │             │
└────────┬─────────┘             ▼
         │             ┌───────────────────┐
         │             │ worker (Node 22)  │
         │             │ BullMQ & Engine   │
         │             └─────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     │ (Private Internal Backend Network Only)
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐   ┌───────────────────┐
│ postgres (PG 16) │   │ redis (Redis 7)   │
│ Persistent Vol   │   │ Append-Only Queue │
└──────────────────┘   └───────────────────┘
```

> [!IMPORTANT]
> PostgreSQL and Redis are **never** published to public host ports. All communication between web, worker, postgres, and redis occurs inside an isolated internal Docker bridge network (`backend-net`).

---

## 2. Infrastructure Prerequisites

### Minimum Hardware Requirements (MVP)
- **CPU**: 2 vCPUs (x86_64 or ARM64)
- **RAM**: 2 GB (4 GB recommended for comfortable build & concurrency headroom)
- **Disk**: 25 GB SSD / NVMe
- **Operating System**: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS
- **Network**: Static public IPv4 address, ports `80` and `443` open.

---

## 3. Server Preparation & Hardening

Log in to your Ubuntu VPS via SSH:

```bash
ssh ubuntu@YOUR_SERVER_IP
```

### 3.1 System Updates & Utilities
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget ufw fail2ban htop unzip
```

### 3.2 UFW Firewall Configuration
Permit only SSH, HTTP, and HTTPS:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp # For HTTP/3 QUIC support
sudo ufw enable
```

### 3.3 Install Docker Engine & Docker Compose
Follow the official Docker repository installation:

```bash
# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow non-root docker execution (optional)
sudo usermod -aG docker $USER
```

Verify installation:
```bash
docker --version
docker compose version
```

---

## 4. Domain & DNS Setup

Point your domain (e.g., `apiwatch.example.com`) to your server's IP address:

| Record Type | Host | Points to | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `apiwatch` (or `@`) | `YOUR_VPS_PUBLIC_IP` | 300 |

Verify DNS propagation:
```bash
dig +short apiwatch.example.com
```

---

## 5. Deployment Procedure

### 5.1 Clone Repository
```bash
sudo mkdir -p /opt/apiwatch
sudo chown -R $USER:$USER /opt/apiwatch
cd /opt/apiwatch

git clone <YOUR_GIT_REPOSITORY_URL> .
```

### 5.2 Configure Production Environment Variables
Copy the production environment template:

```bash
cp .env.production.example .env
```

Generate secure secrets for your production environment:

```bash
# 1. Better Auth secret:
openssl rand -base64 32

# 2. Header Encryption Key (Must be exactly 64 hex characters):
openssl rand -hex 32

# 3. Database & Redis passwords:
openssl rand -base64 24
```

Edit `.env` using your preferred editor:
```bash
nano .env
```

Ensure all variables are populated:
- `APP_DOMAIN`: Your domain (e.g., `apiwatch.example.com`).
- `ACME_EMAIL`: Your operational email for SSL expiration alerts.
- `NEXT_PUBLIC_APP_URL`: `https://apiwatch.example.com`.
- `POSTGRES_PASSWORD`: The generated password.
- `REDIS_PASSWORD`: The generated password.
- `BETTER_AUTH_SECRET`: The generated 32-byte secret.
- `ENCRYPTION_KEY`: The generated 64-hex-char key.
- `SMTP_*`: Valid SMTP credentials for alert delivery.

### 5.3 Build Multi-Stage Docker Images
```bash
docker compose build
```

### 5.4 Execute Production Database Migration
Run database migrations using the standalone Next.js container:

```bash
# Start PostgreSQL and Redis first
docker compose up -d postgres redis

# Wait for healthy database
docker compose ps

# Deploy Prisma database schema migrations
docker compose run --rm web npx prisma migrate deploy
```

> [!WARNING]
> Never run `prisma migrate dev` in production. Always use `prisma migrate deploy`.

### 5.5 Start All Production Services
```bash
docker compose up -d
```

### 5.6 Verify Container Status & Logs
```bash
# Verify all 5 containers are running and healthy:
docker compose ps

# Inspect logs:
docker compose logs -f web
docker compose logs -f worker
docker compose logs -f reverse-proxy
```

---

## 6. Automated Backup Strategy

### 6.1 Enable Automated Daily Backups
The project includes an automated backup script at [`deploy/backup.sh`](file:///d:/10Project/15-APIWatch/deploy/backup.sh).

Make the script executable:
```bash
chmod +x /opt/apiwatch/deploy/backup.sh
chmod +x /opt/apiwatch/deploy/restore.sh
```

Add a daily crontab entry (executes daily at 02:00 UTC):
```bash
crontab -e
```

Insert the line:
```cron
0 2 * * * cd /opt/apiwatch && ./deploy/backup.sh >> /var/log/apiwatch-backup.log 2>&1
```

### 6.2 Disaster Recovery / Restore Procedure
To restore the database from an existing `.sql.gz` archive:

```bash
cd /opt/apiwatch
./deploy/restore.sh /opt/apiwatch/backups/apiwatch_db_20261107_020000.sql.gz
```

The restore script automatically:
1. Prompts for explicit operator confirmation.
2. Gracefully stops the `web` and `worker` services.
3. Drops active database connections.
4. Restores schema and rows from the compressed dump.
5. Re-starts `web` and `worker` cleanly.

---

## 7. Zero-Downtime Updates & Rolling Deployments

To deploy a new release or update:

```bash
cd /opt/apiwatch

# 1. Pull latest git commit
git pull origin main

# 2. Build updated images
docker compose build

# 3. Run new database migrations (if any)
docker compose run --rm web npx prisma migrate deploy

# 4. Restart web and worker containers with zero reverse-proxy downtime
docker compose up -d --no-deps web worker

# 5. Clean up dangling builder images
docker image prune -f
```

---

## 8. Rollback Procedure

If a deployed version causes unexpected errors:

```bash
# 1. Check git log to identify last stable commit
git log --oneline -n 5

# 2. Checkout previous stable commit
git checkout <PREVIOUS_COMMIT_HASH>

# 3. Rebuild and restart containers
docker compose build
docker compose up -d web worker

# 4. If database state needs rollback:
./deploy/restore.sh /opt/apiwatch/backups/pre_deployment_backup.sql.gz
```

---

## 9. Production Smoke Test Verification Checklist

Run this quick test routine immediately after deploying:

| Step | Action | Expected Result | Verified? |
| :--- | :--- | :--- | :---: |
| **1. HTTPS Certificate** | Visit `https://apiwatch.example.com` in browser | Valid Let's Encrypt TLS certificate | [ ] |
| **2. Landing Page** | View public landing page | HTTP 200, styled UI | [ ] |
| **3. Registration** | Register new user account | Account created, session cookie set | [ ] |
| **4. Dashboard** | Navigate to `/dashboard` | Metrics cards render with zero state | [ ] |
| **5. Create Monitor** | Add a test monitor (`https://httpbin.org/status/200`) | Monitor created with `ACTIVE` status | [ ] |
| **6. Worker Check** | Wait 30-60 seconds for background execution | Check latency and status logged in history | [ ] |
| **7. Manual Check** | Click "Check Now" button | Instant check executes; 10s cooldown enforced | [ ] |
| **8. Pause / Resume** | Toggle monitor pause switch | Status toggles `PAUSED` -> `ACTIVE` | [ ] |
| **9. CSV Export** | Click "Export CSV" on check history | CSV downloads with sanitized formula values | [ ] |
| **10. Public Status** | Visit `https://apiwatch.example.com/status` | Real-time service uptime summary renders | [ ] |
| **11. Logout** | Click logout from user navigation | Session destroyed, redirected to login | [ ] |

---

## 10. Operational Monitoring

To maintain high availability:
1. **External Uptime Monitoring**: Use an independent external service (e.g. Better Uptime, UptimeRobot) pinging `https://apiwatch.example.com/robots.txt` every 60 seconds.
2. **Resource Metrics**: Monitor VPS RAM, CPU, and disk usage via `htop` or Prometheus/Node Exporter.
3. **Queue Health**: Check Redis queue status at any time via:
   ```bash
   docker compose exec redis redis-cli -a "$REDIS_PASSWORD" ping
   ```
