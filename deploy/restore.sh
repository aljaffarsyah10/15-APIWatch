#!/usr/bin/env bash
# ==============================================================================
# APIWatch Production Database Restore Script
# Usage: ./deploy/restore.sh /path/to/backup.sql.gz
# ==============================================================================

set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path-to-backup.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file ${BACKUP_FILE} does not exist!" >&2
    exit 1
fi

echo "========================================================================"
echo "WARNING: RESTORING WILL OVERWRITE ALL EXISTING DATA IN APIWATCH DATABASE"
echo "Backup File: ${BACKUP_FILE}"
echo "========================================================================"
read -p "Are you sure you want to proceed? (type 'yes' to confirm): " CONFIRMATION

if [ "${CONFIRMATION}" != "yes" ]; then
    echo "Restore aborted by user."
    exit 0
fi

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Stopping Web and Worker containers..."
docker compose stop web worker

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Terminating active PostgreSQL connections..."
docker compose exec -T postgres psql -U "${POSTGRES_USER:-apiwatch}" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${POSTGRES_DB:-apiwatch}' AND pid <> pg_backend_pid();" || true

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Recreating clean database..."
docker compose exec -T postgres dropdb -U "${POSTGRES_USER:-apiwatch}" --if-exists "${POSTGRES_DB:-apiwatch}"
docker compose exec -T postgres createdb -U "${POSTGRES_USER:-apiwatch}" "${POSTGRES_DB:-apiwatch}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Restoring data from compressed archive..."
gunzip -c "${BACKUP_FILE}" | docker compose exec -T postgres psql -U "${POSTGRES_USER:-apiwatch}" -d "${POSTGRES_DB:-apiwatch}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Restarting Web and Worker containers..."
docker compose start web worker

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Database restoration completed successfully!"
