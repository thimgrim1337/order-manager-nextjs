#!/usr/bin/env sh
# CODING_STANDARDS.md (Placement): a domain rule in `lib/<concept>.ts` is tested in
# `__tests__/<concept>.test.ts`, or `__tests__/<concept>.db.test.ts` when it needs Postgres.
# Modules that hold no domain rule are listed here instead.
not_domain_rules="action-response actions consts db-errors error helpers utils"

status=0
for module in lib/*.ts; do
  concept=$(basename "$module" .ts)
  case " $not_domain_rules " in *" $concept "*) continue ;; esac
  if [ ! -f "__tests__/$concept.test.ts" ] && [ ! -f "__tests__/$concept.db.test.ts" ]; then
    echo "$module has no __tests__/$concept.test.ts (or .db.test.ts): a domain rule in lib/ is tested beside its siblings (CODING_STANDARDS.md, Placement)."
    echo "  Holds no domain rule? Add '$concept' to not_domain_rules in $0."
    status=1
  fi
done
exit $status
