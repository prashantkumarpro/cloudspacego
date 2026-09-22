Yes. Now that your frontend is growing, you should have a **clear mental model of why every folder exists**. Otherwise, after a few weeks it becomes easy to forget where a file belongs.

Your current architecture is actually moving toward a **production-level Next.js feature-based architecture**.

The most important idea is:

> **`app/` controls routes and pages. `features/` contains business functionality. `components/` contains reusable UI. `lib/` contains infrastructure/utilities. `providers/` contains global React state/providers.**

---

# 1. Complete Architecture

Based on the structure you showed, I would organize the project like this:

```text
CLIENT/
│
├── .agents/                         # AI/agent configuration
├── .claude/                         # Claude/AI configuration
├── .next/                           # Next.js generated build/cache
│
├── app/                             # Next.js App Router
│   │
│   ├── (auth)/                      # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx
│   │   │
│   │   └── layout.tsx               # Shared auth layout
│   │
│   ├── (dashboard)/                 # Protected application routes
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   └── layout.tsx               # Dashboard layout
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home route
│
├── components/                      # Globally reusable components
│   │
│   ├── auth/
│   │   └── auth-guard.tsx           # Route/auth protection
│   │
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── ...
│   │
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── modal.tsx
│       └── ...
│
├── features/                        # Business/domain features
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── ...
│   │   │
│   │   ├── hooks/
│   │   │   └── use-auth.ts
│   │   │
│   │   ├── api.ts
│   │   ├── auth-error.ts
│   │   └── types.ts
│   │
│   ├── dashboard/
│   ├── directory/
│   ├── files/
│   ├── search/
│   ├── settings/
│   ├── sharing/
│   ├── storage/
│   └── trash/
│
├── hooks/                           # Global/shared hooks
│   └── ...
│
├── lib/                             # Infrastructure + utilities
│   │
│   ├── api/
│   │   └── client.ts                # API client
│   │
│   ├── constants/
│   │   └── ...
│   │
│   └── utils/
│       ├── api.ts
│       ├── cn.ts
│       └── format.ts
│
├── providers/                       # Global React providers
│   ├── app-provider.tsx
│   └── auth-provider.tsx
│
├── public/                          # Static assets
│
├── types/                           # Global TypeScript types
│   └── index.ts
│
├── .env                             # Environment variables
├── .env.example                     # Environment variable template
├── .env.local                       # Local environment variables
├── .gitignore
├── AGENTS.md                        # Agent instructions
├── CLAUDE.md                        # Claude instructions
└── DESIGN.md                        # Project design system/documentation
```

Now let's understand **what each one actually does**.

---

# 2. First understand the architecture in 5 boxes

If you forget everything else, remember this:

```text
                 CLIENT
                    │
       ┌────────────┴────────────┐
       │                         │
     app/                    features/
       │                         │
   ROUTING                  BUSINESS LOGIC
       │                         │
       └────────────┬────────────┘
                    │
              components/
                    │
                REUSABLE UI
                    │
          ┌─────────┴─────────┐
          │                   │
        lib/              providers/
          │                   │
   infrastructure       global state
```

And:

```text
app
 ↓
features
 ↓
components
 ↓
lib / providers
```

This isn't a strict dependency chain in every case, but it's a good **mental model**.

---

# 3. `app/` — Routing Layer

```text
app/
```

This is your **Next.js App Router layer**.

Its main responsibility is:

> **"Which URL displays which page/layout?"**

It should **not become the place where all your business logic lives.**

For example:

```text
app/(auth)/login/page.tsx
```

means:

```text
/user visits /login
        ↓
Next.js finds
app/(auth)/login/page.tsx
        ↓
Login page
```

---

# 4. `(auth)/` — Route Group

```text
app/
└── (auth)/
```

The parentheses are important.

```text
(auth)
```

is a **route group**.

It does **not appear in the URL**.

So:

```text
app/(auth)/login/
```

becomes:

```text
/login
```

NOT:

```text
/auth/login
```

### Why use it?

Because you can group authentication pages together and give them a common layout.

```text
(auth)
│
├── login
├── register
└── layout.tsx
```

For example:

```text
/login
/register
```

can share:

```text
AuthLayout
```

---

# 5. `(auth)/layout.tsx`

This controls the common layout of:

```text
/login
/register
```

For example:

```text
┌───────────────────────────────┐
│                               │
│       Authentication          │
│                               │
│       Login / Register        │
│                               │
└───────────────────────────────┘
```

You don't want to duplicate that layout inside:

```text
login/page.tsx
register/page.tsx
```

So you put it in:

```text
(auth)/layout.tsx
```

---

# 6. `login/page.tsx`

This is the **route entry point**.

Important distinction:

```text
app/(auth)/login/page.tsx
```

is NOT necessarily where your entire login implementation should live.

Instead:

```text
page.tsx
    ↓
LoginForm
    ↓
useAuth()
    ↓
API
```

For example:

```tsx
import LoginForm from '@/features/auth/components/login-form'

export default function LoginPage() {
  return <LoginForm />
}
```

So the page is primarily responsible for **composition/routing**, while the feature owns the actual login functionality.

---

# 7. `(dashboard)/`

```text
app/(dashboard)/
```

This is another route group.

It is useful for all authenticated application pages.

For example:

```text
/dashboard
/files
/search
/settings
/trash
```

could eventually live under this group.

The group itself doesn't appear in URLs.

---

# 8. `(dashboard)/layout.tsx`

This is your application/dashboard shell.

For example:

```text
┌──────────────┬─────────────────────────┐
│              │                         │
│   Sidebar    │       Header            │
│              ├─────────────────────────┤
│   Dashboard  │                         │
│   Files       │       Page content      │
│   Search      │                         │
│   Settings    │                         │
│              │                         │
└──────────────┴─────────────────────────┘
```

Instead of rebuilding the sidebar/header for every page:

```text
/dashboard
/files
/search
/settings
```

they all inherit the dashboard layout.

---

# 9. `app/layout.tsx`

This is the **root layout**.

It is above everything.

```text
app/layout.tsx
       │
       ├── (auth)
       │
       └── (dashboard)
```

This is where things such as:

- `<html>`
- `<body>`
- global providers
- global metadata
- global application configuration

can be connected.

Think:

> **Root layout = entire application shell**

---

# 10. `globals.css`

```text
app/globals.css
```

Global CSS.

Things such as:

```css
:root {
  ...;
}
```

theme variables:

```css
--background
--foreground
--card-border
```

global styles, Tailwind configuration-related styles, etc.

Your design system variables can live here.

---

# 11. `page.tsx`

```text
app/page.tsx
```

This represents:

```text
/
```

Your root/home page.

---

# 12. `components/` — Shared UI Components

This folder is extremely important.

```text
components/
```

contains components that can be reused **across multiple features**.

For example:

```text
components/ui/button.tsx
components/ui/input.tsx
components/layout/sidebar.tsx
```

---

# 13. `components/ui/`

This is your **design-system UI layer**.

Examples:

```text
button.tsx
input.tsx
dialog.tsx
dropdown.tsx
modal.tsx
checkbox.tsx
select.tsx
```

Your current `Input` component belongs here.

For example:

```tsx
<Input label='Password' error={errors.password?.message} />
```

The Input component doesn't know anything about registration.

It only knows:

> "I am a reusable input."

That's good architecture.

---

# 14. `components/layout/`

These are reusable application-layout components.

For example:

```text
header.tsx
sidebar.tsx
navbar.tsx
footer.tsx
mobile-sidebar.tsx
```

They aren't specific to one feature.

---

# 15. `components/auth/auth-guard.tsx`

This is interesting because it is an authentication-related **global component**.

Its job could be:

```text
User tries to access protected page
             ↓
        AuthGuard
             ↓
      Is user logged in?
        /          \
      YES           NO
       ↓             ↓
   continue       /login
```

It is different from:

```text
features/auth/components/login-form.tsx
```

because `LoginForm` is a **feature component**, while `AuthGuard` is an application-level reusable component.

---

# 16. `features/` — Most Important Folder

This is the heart of your architecture.

```text
features/
```

contains **business/domain functionality**.

Your application isn't really:

```text
buttons
inputs
pages
```

Your application is:

```text
Authentication
Files
Storage
Sharing
Search
Trash
Settings
Directory
Dashboard
```

Those are your **features**.

---

# 17. `features/auth/`

Your authentication domain.

```text
features/auth/
```

Everything specifically related to authentication belongs here.

For example:

```text
auth/
├── components/
├── hooks/
├── api.ts
├── auth-error.ts
└── types.ts
```

This is called **feature-based architecture**.

---

# 18. `features/auth/components/`

Feature-specific UI.

```text
features/auth/components/
```

For example:

```text
login-form.tsx
register-form.tsx
forgot-password-form.tsx
reset-password-form.tsx
```

These components know about authentication.

For example:

```tsx
login(data)
```

belongs naturally here.

Your:

```text
login-form.tsx
register-form.tsx
```

are correctly placed.

---

# 19. `features/auth/hooks/`

Feature-specific React hooks.

Your:

```text
use-auth.ts
```

belongs here.

For example:

```tsx
const { login, logout, user } = useAuth()
```

The hook can provide authentication operations to the UI.

Think:

```text
login-form
      ↓
   useAuth()
      ↓
    auth API
```

---

# 20. `features/auth/api.ts`

This is your **authentication API layer**.

You already have:

```tsx
register()
login()
getUser()
logout()
```

That's exactly what this file represents.

Conceptually:

```text
login-form.tsx
       ↓
    useAuth()
       ↓
     api.ts
       ↓
  apiClient
       ↓
     Backend
```

This separation is very useful.

Your component doesn't need to know:

```text
POST /user/login
```

or how your API client works.

---

# 21. `features/auth/auth-error.ts`

This is your authentication error normalization layer.

Your backend might return:

```json
{
  "error": "Validation failed",
  "fieldErrors": {
    "email": "Email is required"
  }
}
```

Your frontend converts that into a predictable structure.

For example:

```ts
type AuthError = {
  message: string
  fieldErrors?: FieldErrors
}
```

So your UI can handle errors consistently.

That's a good separation.

---

# 22. `features/auth/types.ts`

Authentication-specific TypeScript types.

For example:

```ts
type LoginCredentials = {
  email: string
  password: string
}
```

and:

```ts
type RegisterCredentials = {
  name: string
  email: string
  password: string
}
```

Also:

```text
LoginResponse
RegisterResponse
User
```

etc.

These types belong to auth because they are specific to authentication.

---

# 23. Other `features/`

You currently have:

```text
features/
├── dashboard/
├── directory/
├── files/
├── search/
├── settings/
├── sharing/
├── storage/
└── trash/
```

This is a good direction.

Eventually each can have its own internal structure.

For example:

```text
features/files/
│
├── components/
│   ├── file-list.tsx
│   ├── file-card.tsx
│   ├── upload-file.tsx
│   └── file-preview.tsx
│
├── hooks/
│   ├── use-files.ts
│   └── use-file-upload.ts
│
├── api.ts
├── types.ts
└── utils.ts
```

But **don't create empty folders/files just because the architecture says so**.

Grow each feature as needed.

---

# 24. `hooks/` — Global Hooks

You also have:

```text
hooks/
```

This is different from:

```text
features/auth/hooks/
```

### Feature hook

```text
features/auth/hooks/use-auth.ts
```

Only authentication-related.

### Global hook

```text
hooks/use-debounce.ts
hooks/use-media-query.ts
hooks/use-mounted.ts
```

Potentially usable by many unrelated features.

Rule:

> If the hook belongs to one business feature → put it inside that feature.

> If multiple unrelated features can use it → `hooks/`.

---

# 25. `lib/` — Infrastructure

This is another important folder.

```text
lib/
```

Think:

> **"Code that supports the application but isn't itself a business feature."**

---

# 26. `lib/api/client.ts`

This is your central API client.

For example:

```text
features/auth/api.ts
       ↓
lib/api/client.ts
       ↓
fetch()
       ↓
Backend
```

Your `apiClient` could handle common things such as:

- base URL
- headers
- credentials
- JSON parsing
- common response handling
- authentication cookies
- HTTP errors

This prevents every feature from implementing API communication differently.

---

# 27. `lib/constants/`

Application-wide constants.

For example:

```ts
export const APP_NAME = 'CloudE'
```

or:

```ts
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  FILES: '/files'
}
```

or:

```ts
export const MAX_FILE_SIZE = ...
```

But be careful:

If a constant is only relevant to files:

```text
features/files/constants.ts
```

may be better.

Global constants go into:

```text
lib/constants/
```

---

# 28. `lib/utils/`

Generic utility functions.

You currently have:

```text
api.ts
cn.ts
format.ts
```

### `cn.ts`

Usually combines Tailwind classes.

Example:

```ts
cn('px-4', isActive && 'bg-blue-500')
```

It doesn't know anything about auth/files/dashboard.

Therefore:

```text
lib/utils/cn.ts
```

is correct.

---

# 29. `lib/utils/format.ts`

Formatting utilities.

For example:

```ts
formatFileSize(1024000)
```

→

```text
976.56 KB
```

or:

```ts
formatDate(date)
```

→

```text
26 Aug 2026
```

These are generic utilities.

---

# 30. `lib/utils/api.ts`

Generic API helpers.

For example, things that are useful across:

```text
auth
files
storage
sharing
search
```

could go here.

But don't put feature-specific API functions here.

This:

```ts
login()
register()
logout()
```

belongs to:

```text
features/auth/api.ts
```

not:

```text
lib/utils/api.ts
```

---

# 31. `providers/`

```text
providers/
```

contains global React context/providers.

Think:

> **Things that need to wrap large portions of the application.**

---

# 32. `auth-provider.tsx`

This could manage global authentication state.

Conceptually:

```text
AuthProvider
      │
      ├── user
      ├── loading
      ├── login()
      ├── logout()
      └── refreshUser()
```

Then:

```text
useAuth()
```

can consume that provider.

---

# 33. `app-provider.tsx`

This can combine your global providers.

For example:

```tsx
<AppProvider>
  <AuthProvider>{children}</AuthProvider>
</AppProvider>
```

As your application grows, it might eventually contain things such as:

```text
AuthProvider
ThemeProvider
QueryProvider
ToastProvider
```

depending on what your application actually needs.

Don't add providers unnecessarily.

---

# 34. `types/`

```text
types/
└── index.ts
```

This should contain **truly global types**.

For example:

```ts
type ApiResponse<T>
type Pagination
type ID
```

Potentially:

```ts
type UserRole
```

if it is genuinely shared throughout the application.

But:

```ts
LoginCredentials
RegisterCredentials
```

should stay here:

```text
features/auth/types.ts
```

because they're auth-specific.

This is an important rule.

---

# 35. `public/`

Static files.

For example:

```text
public/
├── logo.svg
├── images/
├── icons/
└── ...
```

Files here are publicly accessible.

For example:

```text
public/logo.svg
```

can be referenced as:

```text
/logo.svg
```

---

# 36. `.env`

Environment variables.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

But be careful with secrets.

Never put private secrets into variables prefixed with:

```text
NEXT_PUBLIC_
```

because those can be exposed to the browser.

---

# 37. `.env.local`

Local development environment variables.

Usually this is where machine-specific/local secrets belong.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

and potentially:

```env
SOME_PRIVATE_SECRET=...
```

depending on your architecture.

Generally, `.env.local` should not be committed.

---

# 38. `.env.example`

This is a **template for developers**.

Example:

```env
NEXT_PUBLIC_API_URL=
```

It tells another developer:

> "These environment variables are required."

But it doesn't contain your actual secrets.

This file **should usually be committed**.

---

# 39. `.gitignore`

Tells Git what not to commit.

For example:

```text
node_modules/
.next/
.env
.env.local
```

etc.

---

# 40. `.next/`

```text
.next/
```

This is generated by Next.js.

It contains build/cache/generated information.

You normally **do not manually edit it**.

You normally don't commit it to Git.

Think:

> `.next/` = Next.js working/build output.

---

# 41. `.agents/`

This appears to be your AI-agent configuration directory.

Because you're using agent tooling, this can contain instructions/configuration used by agents.

It isn't part of your application's runtime architecture.

Think:

```text
.agents/
    ↓
AI development tooling
```

not:

```text
.agents/
    ↓
CloudE application
```

---

# 42. `.claude/`

Similarly:

```text
.claude/
```

is related to Claude/AI tooling and configuration.

Again:

```text
.claude/
```

is development/AI tooling, not your application feature architecture.

---

# 43. `AGENTS.md`

Instructions/documentation for AI agents working on the repository.

For example:

```text
Project architecture
Coding rules
Testing rules
Naming conventions
Important constraints
```

Think:

> **How should an AI agent work on this project?**

---

# 44. `CLAUDE.md`

Similar idea, but specifically for Claude-related development instructions.

For example:

```text
Use feature-based architecture.
Don't use axios.
Use fetch.
Use existing UI components.
Don't create duplicate components.
```

This can help maintain consistency when using AI coding assistants.

---

# 45. `DESIGN.md`

This is actually a very useful file for your project.

It can document your design system.

For example:

```text
# CloudE Design System

## Colors

Primary:
#1c69d4

## Typography

Heading:
...

## Buttons

...

## Inputs

...

## Spacing

...

## Dark mode

...
```

This becomes your **design reference**.

---

# 46. The most important distinction: `app` vs `features`

This is probably the thing you need to remember most.

Imagine:

```text
/login
```

You might think:

> "Login code belongs in `app/login`."

But in your architecture:

```text
app/(auth)/login/page.tsx
```

is the **route**.

The actual functionality lives here:

```text
features/auth/
```

So:

```text
app
 ↓
"Where is the page?"
```

while:

```text
features
 ↓
"What does this page actually do?"
```

---

# 47. Example: Login flow

Your current architecture should mentally look like this:

```text
User
 │
 │ visits /login
 ↓
app/(auth)/login/page.tsx
 │
 │ renders
 ↓
features/auth/components/login-form.tsx
 │
 │ uses
 ↓
features/auth/hooks/use-auth.ts
 │
 │ calls
 ↓
features/auth/api.ts
 │
 │ calls
 ↓
lib/api/client.ts
 │
 │ HTTP request
 ↓
Backend
```

And errors:

```text
Backend
   ↓
apiClient
   ↓
auth/api.ts
   ↓
auth-error.ts
   ↓
login-form.tsx
   ↓
Input error / general error
```

That's a **clean architecture**.

---

# 48. Example: Registration flow

Your registration flow:

```text
/register
   ↓
app/(auth)/register/page.tsx
   ↓
RegisterForm
   ↓
react-hook-form
   ↓
features/auth/api.ts
   ↓
apiClient
   ↓
POST /user/register
   ↓
Backend
```

Validation:

```text
User enters data
       ↓
React Hook Form
       ↓
Client validation
       ↓
Valid?
   /       \
 NO         YES
 ↓           ↓
show       API request
error
```

Then backend validation is your second layer:

```text
Client validation
       ↓
Backend validation
       ↓
Database
```

That is the correct approach.

---

# 49. Your architecture by responsibility

Here's the cheat sheet I want you to remember:

| Folder                   | Main responsibility               |
| ------------------------ | --------------------------------- |
| `app/`                   | Routes, pages, layouts            |
| `app/(auth)/`            | Authentication routes             |
| `app/(dashboard)/`       | Application/protected routes      |
| `components/ui/`         | Reusable design-system components |
| `components/layout/`     | Shared layout components          |
| `components/auth/`       | Global auth-related components    |
| `features/`              | Business/domain features          |
| `features/auth/`         | Authentication business logic     |
| `features/*/components/` | Feature-specific UI               |
| `features/*/hooks/`      | Feature-specific hooks            |
| `features/*/api.ts`      | Feature API functions             |
| `features/*/types.ts`    | Feature-specific types            |
| `hooks/`                 | Globally reusable hooks           |
| `lib/api/`               | API infrastructure                |
| `lib/constants/`         | Global constants                  |
| `lib/utils/`             | Generic utility functions         |
| `providers/`             | Global React providers/state      |
| `types/`                 | Global TypeScript types           |
| `public/`                | Static assets                     |
| `.env*`                  | Environment configuration         |
| `.next/`                 | Generated Next.js files           |
| `DESIGN.md`              | Design-system documentation       |
| `AGENTS.md`              | AI agent instructions             |
| `CLAUDE.md`              | Claude instructions               |

---

# 50. The rule for deciding where a new file goes

This is the part I recommend you save somewhere.

When you create a new file, ask these questions:

### Question 1

**Is it a route/page/layout?**

```text
YES → app/
```

---

### Question 2

**Is it business functionality specific to one domain?**

For example:

```text
file-upload
file-preview
file-sharing
```

```text
YES → features/files/
```

---

### Question 3

**Is it a reusable UI component?**

For example:

```text
Button
Input
Modal
Dialog
Dropdown
```

```text
YES → components/ui/
```

---

### Question 4

**Is it a shared application layout?**

```text
Sidebar
Header
Navbar
```

```text
YES → components/layout/
```

---

### Question 5

**Is it a hook used only by one feature?**

```text
useAuth()
```

```text
features/auth/hooks/
```

---

### Question 6

**Is it a generic hook used by many features?**

```text
useDebounce()
useMediaQuery()
```

```text
hooks/
```

---

### Question 7

**Is it API infrastructure?**

```text
apiClient
fetch wrapper
request configuration
```

```text
lib/api/
```

---

### Question 8

**Is it a generic utility?**

```text
formatDate()
formatFileSize()
cn()
```

```text
lib/utils/
```

---

### Question 9

**Is it global state/provider?**

```text
AuthProvider
ThemeProvider
```

```text
providers/
```

---

### Question 10

**Is it a type used by only one feature?**

```text
LoginCredentials
RegisterCredentials
```

```text
features/auth/types.ts
```

If it's genuinely shared:

```text
types/
```

---

# 51. One thing I would NOT do

Don't make your architecture unnecessarily complicated.

For example, don't create:

```text
features/files/
├── components/
├── hooks/
├── api/
├── services/
├── repositories/
├── utils/
├── constants/
├── validators/
├── models/
├── adapters/
├── mappers/
└── ...
```

when you only have:

```text
file-list.tsx
```

That's **architecture for architecture's sake**.

Start small:

```text
features/files/
├── components/
├── api.ts
└── types.ts
```

When the feature actually grows, then split it.

---

# 52. Your architecture in one picture

Keep this mental picture:

```text
                         CLIENT
                           │
             ┌─────────────┴─────────────┐
             │                           │
          app/                       features/
             │                           │
       ROUTING LAYER              BUSINESS LAYER
             │                           │
             │          ┌────────────────┼────────────────┐
             │          │                │                │
             │         auth            files           storage
             │          │
             │      components
             │      hooks
             │      api
             │      types
             │
             └──────────────┬────────────┘
                            │
                     components/
                            │
                     REUSABLE UI
                            │
                ┌───────────┴───────────┐
                │                       │
             lib/                  providers/
                │                       │
         infrastructure            global state
                │
          ┌─────┴─────┐
          │           │
        api/        utils/
```

### The simplest memory trick

> **`app` = WHERE** > **`features` = WHAT** > **`components` = HOW IT LOOKS** > **`lib` = TOOLS/INFRASTRUCTURE** > **`providers` = GLOBAL STATE** > **`hooks` = REUSABLE BEHAVIOR** > **`types` = SHARED CONTRACTS**

That is the architecture you should keep in your head while this project grows.

And one important point: **your current architecture does not need a major restructuring right now.** The structure you've built is coherent; the main thing is to maintain the boundaries as new features are added.
