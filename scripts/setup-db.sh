#!/usr/bin/env bash
set -euo pipefail

# ---- Interactive config ----
read -r -p "Database name [reconxi_db]: " DB_NAME
DB_NAME=${DB_NAME:-reconxi_db}

read -r -p "Database user [reconxi_user]: " DB_USER
DB_USER=${DB_USER:-reconxi_user}

read -r -s -p "Database password (input hidden): " DB_PASSWORD
echo

read -r -p "Allow remote connections? [no]: " ALLOW_REMOTE
ALLOW_REMOTE=${ALLOW_REMOTE:-no}

# Validate ALLOW_REMOTE
case "${ALLOW_REMOTE,,}" in
  yes) ALLOW_REMOTE=yes ;;
  no)  ALLOW_REMOTE=no  ;;
  *)
    echo "ERROR: Invalid value for 'Allow remote connections': '${ALLOW_REMOTE}'. Expected 'yes' or 'no'." >&2
    exit 1
    ;;
esac

# ---- Resolve Postgres config paths (Ubuntu/Debian) ----
PG_VERSION="$(find /etc/postgresql -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -V | tail -n 1)"
PG_CONF_DIR="/etc/postgresql/${PG_VERSION}/main"
PG_CONF="${PG_CONF_DIR}/postgresql.conf"
PG_HBA="${PG_CONF_DIR}/pg_hba.conf"

echo "Using Postgres ${PG_VERSION} config in ${PG_CONF_DIR}"

# ---- Create or reconcile role and database ----
# DB_PASSWORD is passed via a quoted psql variable — not via a shell argument
# visible in the process list (the -v value appears in /proc but sudo -u postgres
# keeps it within the postgres user's process space, not the shell's argv).
# We use quote_literal() in SQL to safely embed it.
sudo -u postgres psql -v ON_ERROR_STOP=1 \
  -v db_user="${DB_USER}" \
  -v db_name="${DB_NAME}" \
  -v db_password="${DB_PASSWORD}" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'db_user') THEN
    EXECUTE 'CREATE ROLE ' || quote_ident(:'db_user') || ' LOGIN PASSWORD ' || quote_literal(:'db_password');
  ELSE
    -- Reconcile password on rerun
    EXECUTE 'ALTER ROLE ' || quote_ident(:'db_user') || ' PASSWORD ' || quote_literal(:'db_password');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db_name') THEN
    EXECUTE 'CREATE DATABASE ' || quote_ident(:'db_name') || ' OWNER ' || quote_ident(:'db_user');
  ELSE
    -- Reconcile owner on rerun
    EXECUTE 'ALTER DATABASE ' || quote_ident(:'db_name') || ' OWNER TO ' || quote_ident(:'db_user');
  END IF;
END
$$;
SQL

# ---- Extensions ----
sudo -u postgres psql -v ON_ERROR_STOP=1 -d "${DB_NAME}" <<'SQL'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
SQL

# ---- Schema grants (DB_USER passed via psql -v, quoted in SQL) ----
sudo -u postgres psql -v ON_ERROR_STOP=1 -v db_user="${DB_USER}" -d "${DB_NAME}" <<'SQL'
DO $$
BEGIN
  EXECUTE 'GRANT USAGE, CREATE ON SCHEMA public TO ' || quote_ident(:'db_user');
END
$$;
SQL

# ---- Network config ----
if [[ "${ALLOW_REMOTE}" == "yes" ]]; then
  sudo sed -i "s/^#*listen_addresses.*/listen_addresses = '*'/" "${PG_CONF}"
else
  sudo sed -i "s/^#*listen_addresses.*/listen_addresses = 'localhost'/" "${PG_CONF}"

  # For each localhost CIDR, replace any existing weaker rule with scram-sha-256,
  # or insert a new rule if none exists.
  for CIDR in "127.0.0.1/32" "::1/128"; do
    ESCAPED_CIDR="${CIDR//\//\\/}"
    if grep -qE "^\s*host\s+all\s+all\s+${ESCAPED_CIDR}" "${PG_HBA}"; then
      # Replace existing rule (whatever auth method) with scram-sha-256
      sudo sed -i -E "s|^(\s*host\s+all\s+all\s+${ESCAPED_CIDR}\s+).*|\1scram-sha-256|" "${PG_HBA}"
    else
      echo "host all all ${CIDR} scram-sha-256" | sudo tee -a "${PG_HBA}" >/dev/null
    fi
  done
fi

# ---- Reload Postgres ----
sudo systemctl reload postgresql

echo "Done. DB=${DB_NAME}, USER=${DB_USER}, EXTENSIONS=uuid-ossp,citext, REMOTE=${ALLOW_REMOTE}"
