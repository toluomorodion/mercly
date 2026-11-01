# API Route Scaffolder Skill

Load this skill when creating or modifying a Next.js route handler (`app/api/**/route.ts`) or a server action. It tells you the exact shape every route should have in SellSnap, so routes behave consistently whether they handle a login, an order creation, or a webhook.

## Before You Start

Read `.agent/rules/architecture.md` and `.agent/rules/security.md`. This skill assumes you know the difference between a server action and a route handler, and it assumes you will validate input and handle errors the way those rules describe.

Ask: should this be a server action or a route handler?
- **Server action** if the caller is our own dashboard UI and the action is a form submit or a UI-triggered mutation.
- **Route handler** if the caller is a public client (the product page), a third party (Flutterwave webhook), or another service.

Server actions are the default for internal writes. Route handlers are for external boundaries.

## Route Handler Template

```ts
// app/api/<resource>/<action>/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const inputSchema = z.object({
  // Describe every field you expect from the client.
});

type Success<T> = { ok: true; data: T };
type Failure = { ok: false; error: { code: string; message: string } };

export async function POST(req: NextRequest) {
  try {
    // 1. Validate the request body.
    const body = await req.json().catch(() => null);
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<Failure>(
        { ok: false, error: { code: 'invalid_input', message: 'Check your input and try again.' } },
        { status: 400 }
      );
    }

    // 2. CSRF guard: for state-changing routes that accept cookies, verify origin.
    // Skip this for webhooks and CORS-enabled public endpoints.
    const origin = req.headers.get('origin');
    const appUrl = process.env.NEXTAUTH_URL;
    if (origin && appUrl) {
      const originHost = new URL(origin).host;
      const appHost = new URL(appUrl).host;
      if (originHost !== appHost) {
        return NextResponse.json<Failure>(
          { ok: false, error: { code: 'forbidden', message: 'Origin not allowed.' } },
          { status: 403 }
        );
      }
    }

    // 3. Authenticate if the route requires it.
    const session = await getSession();
    if (!session) {
      return NextResponse.json<Failure>(
        { ok: false, error: { code: 'unauthorized', message: 'Please sign in.' } },
        { status: 401 }
      );
    }

    // 4. Authorize: does this user own the resource they are trying to touch?
    //    Do the check explicitly, right here. Do not rely on the URL shape.

    // 5. Do the work. Keep this block small; extract to lib/ if it gets long.
    const result = await /* ... */;

    // 6. Return a structured success response.
    return NextResponse.json<Success<typeof result>>({ ok: true, data: result });
  } catch (error) {
    // TODO: replace with structured logger once lib/logger.ts is implemented.
    console.error(`api.<resource>.<action>.failed`, error);
    return NextResponse.json<Failure>(
      { ok: false, error: { code: 'server_error', message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}
```

## Dynamic Route Params

In Next.js 15, `context.params` is a Promise. Always validate params with zod, just like the body:

```ts
export async function GET(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const params = await context.params;
  const paramSchema = z.object({ slug: z.string().min(1) });
  const parsedParams = paramSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json<Failure>(
      { ok: false, error: { code: 'invalid_params', message: 'Invalid resource identifier.' } },
      { status: 400 }
    );
  }
  // Use parsedParams.data.slug safely.
}
```

## The Rules

**Always validate with zod.** The request body, query params, and path params all come from outside and cannot be trusted. Even if TypeScript thinks it knows the shape, zod is what actually enforces it at runtime.

**Always authenticate before authorizing.** Check the session exists, then check the session has permission to do the thing. Authorization is always per-resource. "Can this user edit this product?" means checking `product.userId === session.userId`, not just "is this user signed in?"

**Always verify CSRF on state-changing routes.** Route handlers that mutate data and accept cookie-based sessions must check the `Origin` or `Referer` header matches `NEXTAUTH_URL`. Server actions have built-in CSRF protection; route handlers do not.

**Always return a consistent envelope.** Success is `{ ok: true, data }`. Failure is `{ ok: false, error: { code, message } }`. The client parses the same shape everywhere, which keeps error handling simple.

**Never return raw error messages.** Log the real error on the server, return a sanitized message to the client. A Prisma error message might reveal the database schema or the structure of your query. A stack trace is even worse.

**Use proper HTTP status codes.**
- `200` for success.
- `201` for resource creation if you want to be precise.
- `400` for validation errors (client sent garbage).
- `401` for unauthenticated (no session).
- `403` for unauthorized (session exists but lacks permission) or CSRF failure.
- `404` for resource not found.
- `409` for conflicts (duplicate slug, duplicate order).
- `429` for rate limit hits.
- `500` for server errors.

**Rate limit public endpoints.** Anything reachable without a session must have a rate limit. The rate-limit module in `lib/rate-limit.ts` is not yet implemented — use `upstash/ratelimit` or a similar library when adding this. Apply it to login, signup, password reset, and order creation on the public product page. See `.agent/rules/security.md` for the full rate-limiting policy.

**Log structured data, not strings.** When `lib/logger.ts` is implemented, use `logger.info('order.created', { orderId, productId })` instead of string concatenation. Structured logs can be queried; strings can only be grep'd. Until then, `console.error` with structured objects is acceptable.

## Server Action Template

```ts
// app/(dashboard)/<area>/actions.ts

'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const inputSchema = z.object({
  // ...
});

type ActionResult =
  | { ok: true; data?: unknown }
  | { ok: false; error: { code: string; message: string } };

export async function createSomething(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, error: { code: 'unauthorized', message: 'Please sign in.' } };
    }

    const parsed = inputSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ok: false, error: { code: 'invalid_input', message: 'Please check your entries.' } };
    }

    const created = await db.something.create({
      data: { ...parsed.data, userId: session.userId },
    });

    revalidateTag('somethings');
    return { ok: true, data: created };
  } catch (error) {
    // TODO: replace with structured logger once lib/logger.ts is implemented.
    console.error('action.create_something.failed', error);
    return { ok: false, error: { code: 'server_error', message: 'Something went wrong.' } };
  }
}
```

Server actions that redirect on success do so at the end with `redirect(...)`. Actions that return data let the caller handle the response.

## Validation vs Authentication Ordering

Route handlers validate before authenticating (external callers may send malformed input before any session check). Server actions authenticate before validating (the caller is our own UI; the session is the first gate). This difference is intentional and consistent across the codebase.

## Idempotency

Any route that creates something paid for must be idempotent. See `.agent/skills/flutterwave-integration/SKILL.md` for the pattern using unique constraints. Do not try to implement idempotency with application-level locking; the database is the source of truth.

## Request IDs

Every log line should include a request ID so you can trace a single request through the logs. The `logger` helper in `lib/logger.ts` (not yet implemented) will add this automatically when called from a route context. Until then, include a `requestId` field manually if you need traceability during debugging.

## Common Mistakes

- Skipping zod validation and trusting TypeScript. TypeScript does not run at runtime.
- Authenticating but forgetting to authorize. Any signed-in user could edit anyone else's product if you skip the ownership check.
- Forgetting the CSRF origin check on state-changing route handlers.
- Using a `GET` for a mutation. Stick to REST conventions: `POST` creates, `PATCH` updates, `DELETE` deletes, `GET` reads.
- Returning raw Prisma errors or exception messages.
- Forgetting to `revalidateTag` or `revalidatePath` after a server action mutates data. The cache will serve stale data until you do.
- Putting business logic inline in the route handler. If it is more than a few lines, move it to `lib/`.
- Treating `context.params` as a synchronous object in Next.js 15. It is a Promise; always `await` it first.
