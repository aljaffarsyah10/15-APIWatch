#!/usr/bin/env bash
# ==============================================================================
# APIWatch Production Database Backup Script
# Usage: ./deploy/backup.sh
# Scheduled via crontab: 0 2 * * * /opt/apiwatch/deploy/backup.sh >> /var/log/apiwatch-backup.log 2>&1
# ==============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/opt/apiwatch/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/apiwatch_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting APIWatch PostgreSQL backup..."

# Execute pg_dump within the running postgres container
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-apiwatch}" "${POSTGRES_DB:-apiwatch}" | gzip > "${BACKUP_FILE}"

# Verify file size is greater than 0
if [ -s "${BACKUP_FILE}" ]; then
    FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup completed successfully: ${BACKUP_FILE} (${FILE_SIZE})"
else
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] ERROR: Backup file is empty!" >&2
    exit 1
fi

# Rotate backups: remove files older than retention policy
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "apiwatch_db_*.sql.gz" -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup routine finished."
