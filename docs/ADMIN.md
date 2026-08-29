# Admin System

The admin dashboard uses ordinary Clerk sign-in plus server-side application
authorization. Signing in proves identity; it does not grant administrator
access by itself.

## Authorization model

Every `/api/admin` request first passes through the same Clerk and local-user
middleware as other application APIs. The server resolves the Clerk identity to
the existing local `users` row and sets `req.userId` to that row's immutable
local ID. `requireAdmin` then permits the request only when
`req.user.role === "admin"`. Non-admin authenticated users receive `403`;
unauthenticated requests receive `401`.

The browser never supplies or controls the role, email address, Clerk ID, or
local user ID used for authorization. Audit events identify the server-derived
local user ID of the administrator who performed the action.

`/admin` is a normal authenticated client route. It verifies
`GET /api/admin/status` before displaying administration features.

## Granting and revoking access

Use a trusted, access-controlled database administration session. Locate the
 already Clerk-bound local user by its immutable local `users.id` (or confirm
 the `user_identities` mapping row with `provider = 'clerk'`), then update
 only that row:

```sql
UPDATE users SET role = 'admin' WHERE id = '<local-user-id>';
```

To revoke access immediately:

```sql
UPDATE users SET role = 'user' WHERE id = '<local-user-id>';
```

Do not grant access based on an email address supplied by a client, a Clerk
claim supplied by the browser, or a configuration secret. Verify the intended
operator through your approved operational process before changing the role.
The role column is non-null and defaults to `user`, so new users have no
administrator privileges.

## Dashboard functions

- **Feedback** — triage feedback as submitted, reviewed, or resolved.
- **Logs** — view the hash-chained audit log, filterable by action.
- **Moderation** — restore or delete automatically moderated group messages.

## Schema implications

Apply the schema with `npm run db:push`. It adds `users.role text NOT NULL
DEFAULT 'user'` and removes the obsolete `sessions`, `admin_keys`,
`admin_challenges`, and `admin_sessions` tables plus `users.password`. Existing
local user IDs and all application data remain unchanged.