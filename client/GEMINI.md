Always Use:
- frontend-design, tailwind-4-docs, web-design-guidelines these 3 skills for this project
- DESIGN.md for this project design

# GEMINI.md

## Always Use

* `frontend-design`, `tailwind-4-docs`, and `web-design-guidelines` skills for this project.
* `DESIGN.md` for the project design system.
* Follow the project structure and architecture defined below.

## Project Architecture

Use this structure as the default architecture for the frontend:

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

## Architecture Rules

* Read and understand the existing code before making changes.
* Follow the existing project structure.
* Keep `app/` focused on routing, layouts, and page composition.
* Keep business/domain logic inside `features/`.
* Put genuinely reusable components inside `components/`.
* Put globally reusable hooks inside `hooks/`.
* Put infrastructure and generic utilities inside `lib/`.
* Put global providers inside `providers/`.
* Put genuinely shared types inside `types/`.
* Keep feature-specific components, hooks, API functions, types, and utilities inside their respective feature.
* Reuse existing code whenever possible.
* Do not create duplicate components, hooks, utilities, API functions, or types.
* Do not create unnecessary files or folders.
* Keep components small and focused.
* Keep pages thin.
* Use strict TypeScript.
* Avoid `any` unless absolutely necessary.
* Do not introduce dependencies unless necessary.
* Do not restructure or move existing files unnecessarily.
* Preserve existing functionality unless the task requires changing it.
* Before creating a new file, check whether the functionality can reasonably be added to or reused from an existing file.
* Follow `DESIGN.md` for all UI/design decisions.
* Use the required design skills when working on UI.
* If a requested implementation conflicts with the architecture, explain the conflict before making a major architectural change.

## Main Goal

Write production-quality code that is:

* Maintainable
* Reusable
* Scalable
* Reliable
* Readable
* Consistent
