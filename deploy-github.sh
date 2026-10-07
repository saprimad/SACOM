#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
repo='saprimad/SACOM'

login=$(gh api user --jq .login) || {
  echo 'Cannot reach GitHub or authenticate. Run gh auth login in this terminal, then retry.' >&2
  exit 1
}
if [[ "$login" != saprimad ]]; then
  echo "Expected saprimad, but GitHub is signed in as $login." >&2
  exit 1
fi

gh auth setup-git
if ! gh repo view "$repo" --json name >/dev/null 2>&1; then
  gh repo create "$repo" --public --description 'SACOM bilingual questionnaire prototype'
fi

if git remote get-url origin >/dev/null 2>&1; then
  origin=$(git remote get-url origin)
  if [[ "$origin" != "https://github.com/$repo.git" && "$origin" != "https://github.com/$repo" && "$origin" != "git@github.com:$repo.git" ]]; then
    echo "Unexpected origin: $origin. Set origin to $repo before retrying." >&2
    exit 1
  fi
else
  git remote add origin "https://github.com/$repo.git"
fi
git push -u origin main

if gh api "repos/$repo/pages" >/dev/null 2>&1; then
  gh api --method PUT "repos/$repo/pages" -f build_type=workflow >/dev/null
else
  gh api --method POST "repos/$repo/pages" -f build_type=workflow >/dev/null
fi

gh workflow run deploy.yml --repo "$repo" --ref main
run_id=''
for attempt in {1..12}; do
  run_id=$(gh run list --repo "$repo" --workflow deploy.yml --event workflow_dispatch --branch main --limit 1 --json databaseId --jq '.[0].databaseId // empty')
  [[ -n "$run_id" ]] && break
  sleep 5
done
if [[ -z "$run_id" ]]; then
  echo "Deployment was requested. Check https://github.com/$repo/actions for its status." >&2
  exit 1
fi
gh run watch "$run_id" --repo "$repo" --exit-status
gh api "repos/$repo/pages" --jq .html_url
