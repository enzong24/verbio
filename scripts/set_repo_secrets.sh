#!/usr/bin/env bash
set -euo pipefail

# Helper to set GitHub repository secrets using the GitHub CLI.
# It reads values from environment variables or prompts interactively.
#
# Usage:
# 1) Install and authenticate gh locally: https://cli.github.com/
# 2) Run: ./scripts/set_repo_secrets.sh
# 3) Or export variables first, then run:
#    DATABASE_URL="..." OPENAI_API_KEY="..." ./scripts/set_repo_secrets.sh

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"

SECRETS=(
  DATABASE_URL
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  OPENAI_API_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  SESSION_SECRET
)

echo "Setting repository secrets for $REPO"

for name in "${SECRETS[@]}"; do
  val=""
  # Use environment variable if provided
  if [ -n "${!name-}" ]; then
    val="${!name}"
  else
    read -rp "Enter value for $name (leave blank to skip): " val
  fi

  if [ -n "$val" ]; then
    echo "Setting secret: $name"
    # gh will prompt for confirmation if needed
    printf "%s" "$val" | gh secret set "$name" --repo "$REPO" -b - >/dev/null
  else
    echo "Skipping $name"
  fi
done

echo "Repository secrets updated. For Codespaces-specific secrets, go to:"
echo "  https://github.com/$(echo $REPO)/settings/secrets/codespaces"
echo "(Or set Codespaces secrets via the GitHub UI)"

exit 0
