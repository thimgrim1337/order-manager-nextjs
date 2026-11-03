#!/usr/bin/env sh
# `test:e2e:run` reuses the last production build, so it only runs once the app's sources still
# match what that build was made from. `stamp` records them after a build; `check` compares.
stamp=.next/e2e-sources

sources_hash() {
  git ls-files -co --exclude-standard -- app components features lib db types public env.ts \
    next.config.ts package.json pnpm-lock.yaml | sort | xargs sha1sum | sha1sum
}

case "$1" in
  stamp) sources_hash > "$stamp" ;;
  check)
    if [ ! -f "$stamp" ] || [ "$(sources_hash)" != "$(cat "$stamp")" ]; then
      echo "The app changed since the last e2e build: run 'pnpm test:e2e' to rebuild."
      echo "'test:e2e:run' reuses that build, for a change to specs only."
      exit 1
    fi
    ;;
  *) echo "Usage: $0 stamp|check" && exit 2 ;;
esac
