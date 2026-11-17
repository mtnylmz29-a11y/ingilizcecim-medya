#!/bin/sh
# Actions sonunda film klasorunu, sesleri ve gunler/ ciktilarini depoya yazar
git config user.name "lemo-render"
git config user.email "actions@users.noreply.github.com"
git add -A gunler hf/ses_cache "$FILM" 2>/dev/null || true
git diff --cached --quiet && exit 0
git commit -q -m "lemo-render: $FILM ($ASAMA)"
for i in 1 2 3 4 5; do
  git pull -q --rebase && git push -q && exit 0
  sleep 7
done
exit 1
