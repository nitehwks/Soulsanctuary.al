---
name: Drizzle post-merge prompts
description: Non-interactive handling for Drizzle rename questions during reconciliation.
---

Drizzle schema push can still prompt for table rename-versus-create choices even when invoked with `--force`.

**Why:** In non-interactive post-merge reconciliation, an unanswered rename prompt may exit without applying the schema while appearing superficially successful.

**How to apply:** Ensure the post-merge schema command supplies default answers non-interactively, and verify the resulting database schema rather than relying only on the process exit status.