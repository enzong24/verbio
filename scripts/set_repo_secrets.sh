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
    if [ "$name" = "DATABASE_URL" ]; then
      # Re-prompt for DATABASE_URL until user provides a value or explicitly skips
      while true; do
        read -rp "Enter value for DATABASE_URL (required) or leave blank to skip: " val
        if [ -n "$val" ]; then
          break
        fi
        read -rp "You didn't enter a value. Do you want to skip DATABASE_URL? (y/N): " yn
        case "$yn" in
          [Yy]*)
            val=""
            break
            ;;
          *)
            # loop again to re-prompt
            ;;
        esac
      done
    else
      read -rp "Enter value for $name (leave blank to skip): " val
    fi
  fi

  if [ -n "$val" ]; then
    echo "Setting secret: $name"
    # Use stdin to avoid shell interpolation issues. Capture gh failure but continue.
    if ! printf "%s" "$val" | gh secret set "$name" --repo "$REPO" -b - >/dev/null 2>&1; then
      echo "Warning: failed to set secret $name (check gh auth and permissions)"
    fi
  else
    echo "Skipping $name"
  fi
done

echo "Repository secrets updated. For Codespaces-specific secrets, go to:"
echo "  https://github.com/$(echo $REPO)/settings/secrets/codespaces"
echo "(Or set Codespaces secrets via the GitHub UI)"

exit 0
