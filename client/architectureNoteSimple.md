Yes. The problem is **not that your architecture is too complicated**. The problem is that you are looking at folders without knowing **what responsibility each folder owns**.

Let's make this very simple.

# 1. First understand the BIG picture

Your frontend has roughly **7 different responsibilities**:

```text
CLIENT
│
├── app/          → WHERE pages/routes live
├── features/     → WHAT each business feature does
├── components/   → REUSABLE UI
├── hooks/        → REUSABLE React logic
├── lib/          → TECHNICAL infrastructure/helpers
├── providers/    → GLOBAL React state/context
└── types/        → SHARED TypeScript types
```

The most important thing to remember is:

> **app = pages**
>
> **features = business logic**
>
> **components = reusable UI**
>
> **hooks = reusable behavior**
>
> **lib = infrastructure/utilities**
>
> **providers = global state**
>
> **types = shared types**

If you remember only this, you already understand 70% of your architecture.

---

# 2. Imagine your application is a company 🏢

Think about your CloudE application as a company.

```text
CloudE Company
│
├── Reception       → app/
├── Departments     → features/
├── Common furniture → components/
├── Employees/tools  → hooks/
├── Infrastructure   → lib/
├── Company-wide rules/state → providers/
└── Common documents/types → types/
```

Now let's go folder by folder.

---

# 3. `app/` — Where are my pages?

### Simple English

`app/` answers:

> **"What URL/page should the user see?"**

### Technical English

`app/` contains your **Next.js App Router routes, layouts, loading/error boundaries, and route-specific files**.

Your structure:

```text
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── layout.tsx
│
├── (dashboard)/
│   ├── dashboard/
│   └── layout.tsx
│
├── layout.tsx
└── page.tsx
```

---

## Why `(auth)`?

```text
(auth)
```

is a **route group**.

The parentheses mean it is used to organize routes but **doesn't appear in the URL**.

So:

```text
app/(auth)/login/
```

becomes:

```text
/login
```

not:

```text
/auth/login
```

Similarly:

```text
app/(dashboard)/dashboard/
```

becomes:

```text
/dashboard
```

### Why use route groups?

Because login/register can share one layout.

```text
(auth)
├── login
├── register
└── layout.tsx
```

For example:

```text
Login
Register
```

can share:

```text
Auth Layout
```

And dashboard pages can share:

```text
Dashboard Layout
```

---

# 4. `app/(auth)/login/`

This represents:

```text
/login
```

But here's something very important.

You have:

```text
app/(auth)/login/
```

AND:

```text
features/auth/components/login-form.tsx
```

Why both?

Because they have **different jobs**.

### `app/(auth)/login/`

Simple:

> "This is the login page."

Technical:

> Route composition.

For example:

```tsx
import LoginForm from '@/features/auth/components/login-form'

export default function LoginPage() {
  return <LoginForm />
}
```

---

### `features/auth/components/login-form.tsx`

Simple:

> "This is the actual login form."

Technical:

> Feature-specific presentation + interaction logic.

So:

```text
app/
    ↓
Where the page is

features/
    ↓
What the page actually does
```

This distinction is **very important**.

---

# 5. `app/(auth)/layout.tsx`

Simple English:

> Layout shared by login/register.

For example:

```text
       AUTH LAYOUT
┌─────────────────────────┐
│                         │
│       Login             │
│                         │
└─────────────────────────┘

       OR

┌─────────────────────────┐
│                         │
│       Register          │
│                         │
└─────────────────────────┘
```

Instead of writing the same structure twice:

```text
login
register
```

you put common structure in:

```text
(auth)/layout.tsx
```

---

# 6. `(dashboard)`

This is another route group.

```text
app/
└── (dashboard)/
    ├── dashboard/
    └── layout.tsx
```

Simple:

> All pages that belong to the logged-in application.

Technical:

> A route group used to apply a common dashboard layout to protected application routes.

For example later you may have:

```text
(dashboard)/
├── dashboard/
├── files/
├── directory/
├── settings/
├── sharing/
└── trash/
```

All can share:

```text
dashboard/layout.tsx
```

containing things like:

```text
Sidebar
Header
Navigation
Main content
```

---

# 7. `app/layout.tsx`

This is your **root layout**.

Simple:

> The layout used by the whole application.

Technical:

> The root Next.js layout that wraps the entire application.

Things like:

```text
HTML
Body
Global providers
Global fonts
metadata
```

can be connected here.

Think:

```text
app/layout.tsx
        ↓
EVERYTHING
```

---

# 8. `app/page.tsx`

This is:

```text
/
```

Your home page.

Simple:

> The page users see at the root URL.

---

# 9. Now the MOST IMPORTANT folder: `features/`

This is where your architecture becomes **feature-based**.

```text
features/
├── auth/
├── dashboard/
├── directory/
├── files/
├── search/
├── settings/
├── sharing/
├── storage/
└── trash/
```

Simple English:

> Each folder represents one major functionality of your application.

Technical English:

> `features/` contains domain/business-specific code organized by feature.

For example:

```text
features/files/
```

contains things related to file management.

```text
features/search/
```

contains search-related functionality.

```text
features/settings/
```

contains settings-related functionality.

---

# 10. Why feature-based architecture?

Imagine you didn't use feature-based architecture.

You might eventually have:

```text
components/
  login.tsx
  file-card.tsx
  search.tsx
  settings.tsx
  trash.tsx
  upload.tsx
  profile.tsx
  ...
```

And:

```text
hooks/
  use-login.ts
  use-files.ts
  use-search.ts
  use-settings.ts
  ...
```

And:

```text
api/
  login.ts
  files.ts
  search.ts
  settings.ts
  ...
```

Everything becomes mixed.

With feature architecture:

```text
features/
│
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── api.ts
│   ├── auth-error.ts
│   └── types.ts
│
├── files/
│   ├── components/
│   ├── hooks/
│   ├── api.ts
│   └── types.ts
│
└── search/
    ├── components/
    ├── hooks/
    ├── api.ts
    └── types.ts
```

Everything related to one feature stays together.

That's the main idea.

---

# 11. Let's understand your `features/auth/`

You currently have:

```text
features/auth/
│
├── components/
│   ├── login-form.tsx
│   └── register-form.tsx
│
├── hooks/
│   └── use-auth.ts
│
├── api.ts
├── auth-error.ts
└── types.ts
```

This is actually a good example to learn the whole architecture.

---

## `features/auth/components/`

Simple:

> UI specifically related to authentication.

Examples:

```text
login-form.tsx
register-form.tsx
```

These aren't generic components.

A login form makes sense only in the authentication domain.

Therefore:

```text
features/auth/components/
```

is appropriate.

---

# 12. `login-form.tsx`

This contains:

```text
Email
Password
Remember me
Sign in
Validation
Submit
Error display
```

Simple:

> The UI and interaction for logging in.

Technical:

> Feature-specific React component responsible for collecting login credentials and invoking authentication behavior.

---

# 13. `register-form.tsx`

Same concept.

```text
Name
Email
Password
Validation
Submit
Errors
```

It's authentication-specific UI.

---

# 14. `features/auth/hooks/use-auth.ts`

This one is important.

Simple:

> A React hook that gives components access to authentication actions/state.

For example:

```tsx
const { login } = useAuth()
```

Then:

```tsx
await login(data)
```

Your component doesn't need to know all the details of authentication.

Conceptually:

```text
LoginForm
    ↓
useAuth()
    ↓
authentication logic
    ↓
API
```

---

# 15. `features/auth/api.ts`

Simple:

> Talks to the backend.

For example:

```tsx
register(data)
login(data)
getUser()
logout()
```

Technical:

> Feature-specific API service layer responsible for HTTP communication with authentication endpoints.

Your:

```tsx
login(data)
```

eventually calls:

```text
POST /user/login
```

So:

```text
login-form
      ↓
useAuth
      ↓
api.ts
      ↓
apiClient
      ↓
Backend
```

This is a very useful mental model.

---

# 16. `features/auth/auth-error.ts`

Simple:

> Converts backend errors into errors your frontend understands.

Your backend might return:

```json
{
  "error": "Validation failed",
  "fieldErrors": {
    "email": "Email is required"
  }
}
```

Your frontend needs to understand that.

So:

```text
Backend error
      ↓
auth-error.ts
      ↓
Frontend-friendly error
```

That's why you created:

```tsx
getAuthError(error)
```

This is good separation.

---

# 17. `features/auth/types.ts`

Simple:

> Defines the data shapes used by authentication.

For example:

```ts
type LoginCredentials = {
  email: string
  password: string
}
```

And:

```ts
type RegisterCredentials = {
  name: string
  email: string
  password: string
}
```

Technical:

> Feature-level TypeScript contracts/interfaces.

---

# 18. `components/`

Now we come to another important distinction.

```text
components/
├── auth/
├── layout/
└── ui/
```

Simple:

> Things that are reusable across different parts of the application.

Technical:

> Shared presentation components that should not belong exclusively to one business feature.

---

# 19. `components/ui/`

This is your **design system / reusable UI primitives**.

Examples:

```text
Button
Input
Modal
Dialog
Dropdown
Checkbox
Card
```

Your:

```tsx
<Input />
```

belongs here.

Why?

Because `Input` isn't specifically authentication.

You might use it in:

```text
Login
Register
Search
Settings
Profile
Upload
```

Therefore:

```text
components/ui/input.tsx
```

is correct.

---

# 20. `components/layout/`

Simple:

> Reusable application layout components.

Examples:

```text
Sidebar
Header
Navbar
Footer
MobileNavigation
```

These aren't specific to authentication.

They are application-level UI.

---

# 21. `components/auth/auth-guard.tsx`

This is authentication-related, but it is not necessarily the same as:

```text
features/auth/components/
```

Why?

Because `AuthGuard` is an **application-level protection mechanism**.

For example:

```text
Dashboard
     ↓
AuthGuard
     ↓
Is user logged in?
     ↓
YES → Dashboard
NO  → Login
```

So keeping it in:

```text
components/auth/
```

can make sense because it is a shared application component used to protect routes/components.

---

# 22. `hooks/`

You also have:

```text
hooks/
```

outside `features`.

This is different from:

```text
features/auth/hooks/
```

### Feature hook

```text
features/auth/hooks/use-auth.ts
```

Simple:

> Only authentication-related.

### Global/shared hook

```text
hooks/use-something.ts
```

Simple:

> Useful across multiple unrelated features.

For example:

```text
hooks/
├── use-debounce.ts
├── use-media-query.ts
└── use-local-storage.ts
```

These aren't owned by one feature.

---

# 23. `lib/`

This is another folder people often misunderstand.

```text
lib/
├── api/
├── constants/
└── utils/
```

Simple:

> Technical infrastructure and reusable helper code.

It is **not a business feature**.

---

# 24. `lib/api/client.ts`

This is especially important.

You have:

```text
features/auth/api.ts
```

and:

```text
lib/api/client.ts
```

They have different jobs.

### `features/auth/api.ts`

Knows:

```text
/user/login
/user/register
/user/logout
```

### `lib/api/client.ts`

Knows:

```text
How do we make HTTP requests?
How do we configure the API?
How do we handle headers?
How do we handle credentials?
```

Think:

```text
auth/api.ts
      ↓
"What endpoint should I call?"

client.ts
      ↓
"How should I make the request?"
```

This is an excellent separation.

---

# 25. `lib/constants/`

Simple:

> Application-wide fixed values.

For example:

```ts
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
}
```

Or:

```ts
export const API_TIMEOUT = 10000
```

Or:

```ts
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
}
```

Things that don't belong to one specific feature can go here.

---

# 26. `lib/utils/`

This contains small reusable technical helpers.

You currently have:

```text
utils/
├── api.ts
├── cn.ts
└── format.ts
```

### `cn.ts`

Usually:

```text
Combine Tailwind/class names
```

That's why your Input has:

```tsx
cn(...)
```

---

### `format.ts`

Things like:

```text
formatDate()
formatFileSize()
formatCurrency()
```

These are generic utilities.

---

### `api.ts`

Generic API-related helpers.

For example:

```text
extract API error
format API response
```

The exact responsibility depends on your implementation.

---

# 27. `providers/`

You have:

```text
providers/
├── app-provider.tsx
└── auth-provider.tsx
```

Simple:

> Providers give application-wide state/configuration to React components.

Think:

```text
                    App
                     │
              AppProvider
                     │
              AuthProvider
                     │
             Your application
```

---

# 28. `auth-provider.tsx`

Simple:

> Keeps authentication information available to the application.

For example:

```text
currentUser
isAuthenticated
loading
login
logout
```

Then any relevant component can access authentication state.

---

# 29. `app-provider.tsx`

Simple:

> Combines application-wide providers.

For example:

```tsx
<AppProvider>
    <AuthProvider>
        {children}
    </AuthProvider>
</AppProvider>
```

As your application grows, you might have:

```text
ThemeProvider
QueryProvider
AuthProvider
ToastProvider
```

etc.

---

# 30. `types/`

You have:

```text
types/
└── index.ts
```

Simple:

> Types shared by the whole application.

This is different from:

```text
features/auth/types.ts
```

### Feature-specific

```text
features/auth/types.ts
```

Contains:

```text
LoginCredentials
RegisterCredentials
LoginResponse
```

### Global

```text
types/index.ts
```

Contains things used across multiple features.

For example:

```ts
type ApiResponse<T>
type Pagination
type UserRole
type FileMetadata
```

But don't put everything here.

A good rule:

> **If a type belongs to one feature, keep it inside that feature.**

---

# 31. `public/`

Simple:

> Static files that the browser can access directly.

Examples:

```text
public/
├── logo.png
├── images/
├── icons/
└── fonts/
```

If you have:

```text
public/logo.png
```

the browser can access:

```text
/logo.png
```

---

# 32. `globals.css`

Simple:

> Global CSS for the entire application.

This is where you keep things like:

```text
Tailwind
CSS variables
theme variables
global styles
body styles
```

Your design system colors can also be defined here.

---

# 33. `.env`

Environment variables.

Simple:

> Configuration that should not be hardcoded into source code.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Be careful: not every environment variable is safe to expose to the browser.

---

# 34. `.env.local`

Usually local developer configuration.

Simple:

> Your computer's local environment settings.

Usually this should not be committed to Git.

---

# 35. `.env.example`

This is very useful for a production project.

Simple:

> Tells another developer which environment variables they need.

For example:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

It doesn't contain your real secrets.

---

# 36. `.gitignore`

Simple:

> Tells Git what NOT to commit.

For example:

```text
node_modules/
.next/
.env.local
```

---

# 37. `.next/`

Important:

**You normally don't write code here.**

Next.js generates it.

Simple:

> Build/cache output created by Next.js.

Think:

```text
Your source code
      ↓
Next.js
      ↓
.next/
```

Don't manually organize this folder.

---

# 38. `.agents/` and `.claude/`

These are related to your AI development tooling/configuration.

They are not part of your application's runtime architecture in the same way as:

```text
app/
features/
components/
lib/
```

They are development/AI-agent configuration.

---

# 39. `AGENTS.md`

Instructions/context for AI agents working on the repository.

Simple:

> "Here are the rules an AI coding agent should follow."

---

# 40. `CLAUDE.md`

Similar idea, specifically for Claude-related development instructions/context.

Simple:

> "Here is project guidance for Claude."

---

# 41. `DESIGN.md`

Simple:

> Your project's design documentation.

You can document:

```text
Colors
Typography
Spacing
Components
Layout
Design principles
Responsive behavior
```

This is actually useful for maintaining consistency as your project grows.

---

# 42. Now understand the COMPLETE request flow

This is the part I really want you to remember.

Suppose the user clicks:

**SIGN UP**

Your architecture roughly works like this:

```text
                 USER
                  │
                  ▼
        /register page
                  │
                  ▼
app/(auth)/register/
                  │
                  ▼
        RegisterForm
                  │
                  ▼
       useAuth / auth logic
                  │
                  ▼
        features/auth/api.ts
                  │
                  ▼
        lib/api/client.ts
                  │
                  ▼
              BACKEND
```

And errors come back:

```text
BACKEND
   │
   ▼
apiClient
   │
   ▼
auth/api.ts
   │
   ▼
auth-error.ts
   │
   ▼
RegisterForm
   │
   ▼
Input error
```

That is your architecture in action.

---

# 43. The most important distinction

You currently have:

```text
app/
components/
features/
hooks/
lib/
providers/
types/
```

Don't think:

> "Why do I have so many folders?"

Think:

> **"What responsibility does each folder own?"**

### Your cheat sheet

| Folder        | Simple English      | Technical meaning        |
| ------------- | ------------------- | ------------------------ |
| `app/`        | Pages/routes        | Next.js App Router       |
| `features/`   | Business features   | Domain/feature modules   |
| `components/` | Reusable UI         | Shared presentation      |
| `hooks/`      | Reusable behavior   | Shared React hooks       |
| `lib/`        | Technical helpers   | Infrastructure/utilities |
| `providers/`  | Global state/config | React context/providers  |
| `types/`      | Shared data shapes  | Global TypeScript types  |
| `public/`     | Static files        | Public assets            |

---

# 44. And your architecture can be remembered like this

Write this somewhere. Seriously.

```text
APP
│
│  "WHERE?"
│
▼
app/
│
▼
FEATURE
│
│  "WHAT DOES IT DO?"
│
▼
features/
│
├── auth
├── files
├── search
└── settings
│
▼
SHARED UI
│
│  "CAN MANY FEATURES USE IT?"
│
▼
components/
│
▼
REUSABLE LOGIC
│
│  "CAN MANY FEATURES USE THIS BEHAVIOR?"
│
▼
hooks/
│
▼
INFRASTRUCTURE
│
│  "HOW DOES THE APP WORK TECHNICALLY?"
│
▼
lib/
│
▼
GLOBAL STATE
│
▼
providers/
│
▼
GLOBAL TYPES
│
▼
types/
```

---

# 45. One rule that will save you from architecture confusion

When creating a new file, ask **three questions**:

### Question 1

**Is this a page/route?**

Yes →

```text
app/
```

---

### Question 2

**Is this specific to one business feature?**

Yes →

```text
features/<feature>/
```

Example:

```text
features/files/
features/auth/
features/search/
```

---

### Question 3

**Can multiple unrelated features use it?**

Yes →

```text
components/
hooks/
lib/
types/
```

depending on what it is.

---

# 46. Example: Where would you put things?

Suppose tomorrow you build file upload.

### Upload page?

```text
app/(dashboard)/files/
```

### File upload business logic?

```text
features/files/
```

### File upload form?

```text
features/files/components/
```

### `useFileUpload()`?

```text
features/files/hooks/
```

### API:

```text
features/files/api.ts
```

### Generic Button?

```text
components/ui/button.tsx
```

### Generic file-size formatter?

```text
lib/utils/format.ts
```

### Global `Pagination` component?

```text
components/ui/pagination.tsx
```

That's how you decide.

---

# 47. Your architecture in one picture

```text
CLIENT
│
├── app/                         ← ROUTES / PAGES
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   │
│   └── (dashboard)/
│       ├── dashboard/
│       └── layout.tsx
│
├── features/                    ← BUSINESS FEATURES
│   │
│   ├── auth/
│   │   ├── components/          ← Auth UI
│   │   ├── hooks/               ← Auth behavior
│   │   ├── api.ts               ← Auth API
│   │   ├── auth-error.ts        ← Auth error handling
│   │   └── types.ts             ← Auth types
│   │
│   ├── files/
│   ├── search/
│   ├── settings/
│   └── ...
│
├── components/                  ← SHARED UI
│   ├── ui/                      ← Input, Button, Modal...
│   ├── layout/                  ← Header, Sidebar...
│   └── auth/                    ← AuthGuard...
│
├── hooks/                       ← SHARED HOOKS
│
├── lib/                         ← INFRASTRUCTURE
│   ├── api/
│   │   └── client.ts            ← HTTP client
│   ├── constants/
│   └── utils/
│
├── providers/                   ← GLOBAL STATE
│   ├── app-provider.tsx
│   └── auth-provider.tsx
│
├── types/                       ← GLOBAL TYPES
│
├── public/                      ← STATIC ASSETS
│
└── app/layout.tsx               ← ROOT LAYOUT
```

## Finally, your mental model

Don't try to memorize every file.

Remember this sentence:

> **`app` decides WHERE, `features` decide WHAT, `components` provide reusable UI, `hooks` provide reusable behavior, `lib` provides technical infrastructure, `providers` provide global state, and `types` define shared data shapes.**

Once you understand that sentence, your growing folder structure will stop feeling random.
