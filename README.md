# CloudSpaceGo

> A full-stack cloud storage web application I'm building to go deeper into backend engineering and understand how a real product is built from end to end.

[![Status](https://img.shields.io/badge/Status-Actively%20Building-orange.svg)](#current-status)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-black.svg)](https://expressjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com)
[![Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare%20R2-orange.svg)](https://www.cloudflare.com/products/r2/)

---

## Current Status

### 🚧 Actively Building

CloudSpaceGo is still under active development.

The core authentication, file storage, file streaming, directory management, cursor-based pagination, and upload systems are currently being developed and improved.

Features such as server-side search, starred files, trash lifecycle, upload cancellation, sharing, and storage quotas are being built as the project evolves.

---

## Table of Contents

* [1. What is CloudSpaceGo?](#1-what-is-cloudspacego)
* [2. Why I Started Building CloudSpaceGo](#2-why-i-started-building-cloudspacego)
* [3. Current Status & Features](#3-current-status--features)
* [4. Tech Stack](#4-tech-stack)
* [5. System Architecture](#5-system-architecture)
* [6. How CloudSpaceGo Works](#6-how-cloudspacego-works)
* [7. Important Engineering Decisions](#7-important-engineering-decisions)
* [8. Challenges & Solutions](#8-challenges--solutions)
* [9. Project Structure](#9-project-structure)
* [10. API Overview](#10-api-overview)
* [11. Local Development](#11-local-development)
* [12. Environment Variables](#12-environment-variables)
* [13. Product Preview](#13-product-preview)
* [14. Roadmap](#14-roadmap)
* [15. What I Am Learning](#15-what-i-am-learning)
* [16. Author & Connect](#16-author--connect)

---

# 1. What is CloudSpaceGo?

CloudSpaceGo is a cloud storage web application that I am building from scratch.

The idea is simple: build a place where users can upload, organize, preview, download, and manage their files and folders.

The project is inspired by the kind of experience users expect from products like Google Drive and Dropbox, but CloudSpaceGo is my own engineering project and learning journey.

I'm building it to understand how the different parts of a real application work together.

### What I'm working with

* **Frontend** — Next.js, React, TypeScript, and Tailwind CSS
* **Backend** — Node.js and Express
* **Database** — MongoDB with Mongoose
* **Object Storage** — Cloudflare R2
* **Authentication** — OTP verification and session-based authentication
* **APIs** — REST APIs connecting the frontend and backend
* **Deployment** — Vercel for the frontend and Render for the backend

The goal isn't just to build a storage UI.

I want to understand what happens behind the UI as well.

---

# 2. Why I Started Building CloudSpaceGo

I started building CloudSpaceGo while going deeper into backend development.

The backend course I was following focuses on backend engineering in depth and uses a cloud storage application as the main project.

Instead of learning backend concepts separately and building only small examples, I wanted to work on something complex enough to make me understand how those concepts come together in a complete application.

A cloud storage application gives me the opportunity to work with problems such as:

* How should files be stored?
* How should file metadata be stored?
* How should authentication work?
* How should large files be uploaded without unnecessarily using server memory?
* How should folders and nested directories be represented?
* How should files be paginated as the amount of data grows?
* How should the frontend communicate with the backend?
* How should the application handle persistent storage after deployment?
* How should different parts of the system work together?

That is why I chose CloudSpaceGo.

My goal is not simply to finish a cloud storage application.

I want to use this project to build a deeper understanding of **backend engineering** while also learning how a complete product is designed, developed, connected, and deployed **end to end**.

As I build it, I'm documenting the problems I face, the decisions I make, and what I learn from them.

---

# 3. Current Status & Features

CloudSpaceGo is actively being developed.

The feature list below reflects the current state of the project.

## 🟢 Completed / Functional

### Authentication

* Email verification using 4-digit OTP
* OTP delivery through Resend
* Password hashing using bcrypt
* Session-based authentication
* Signed HTTP-only session cookies
* Automatic session handling
* User and root-directory provisioning using a MongoDB transaction

### File Management

* Single file uploads
* Multiple file uploads
* Upload progress tracking
* File listing
* File preview
* File download
* File renaming
* File deletion
* File metadata storage
* Unique storage keys for uploaded files

### Storage

* Local filesystem storage for development
* Cloudflare R2 storage for cloud deployment
* Storage driver abstraction
* Streaming file uploads
* Streaming file downloads
* Separation between file metadata and actual file objects

### Folder Management

* Create folders
* Rename folders
* Nested folder hierarchy
* Folder navigation
* Recursive folder deletion

### Pagination & Loading

* Cursor-based pagination
* Signed pagination cursors
* Server-side pagination limit validation
* Infinite scrolling
* Duplicate prevention during progressive loading

### Frontend

* Next.js App Router
* Responsive interface
* Grid and list/table views
* File preview modal
* Image preview
* PDF preview
* Video preview
* Audio preview
* Code file preview
* Light mode
* Dark mode
* Upload manager

---

## 🟡 In Progress

The following areas are currently being developed:

* Server-side search
* Starred files
* File tagging
* Trash lifecycle
* Upload cancellation using `AbortController`

---

## ⚪ Planned

* Public/shared file links
* Time-limited signed access URLs
* User storage quotas
* Storage tier management
* Activity/audit logs
* More collaboration features

---

# 4. Tech Stack

## Frontend

| Technology      | Purpose                                 |
| --------------- | --------------------------------------- |
| Next.js 16      | React framework and application routing |
| React 19        | UI development                          |
| TypeScript      | Type safety                             |
| Tailwind CSS v4 | Styling                                 |
| Lucide React    | Icons                                   |
| Axios           | API communication                       |

## Backend

| Technology           | Purpose                               |
| -------------------- | ------------------------------------- |
| Node.js              | Backend runtime                       |
| Express 5            | REST API                              |
| MongoDB              | Database                              |
| Mongoose             | MongoDB ODM                           |
| `@aws-sdk/client-s3` | Cloudflare R2 integration             |
| Resend               | OTP email delivery                    |
| bcrypt               | Password hashing                      |
| cookie-parser        | Cookie handling                       |
| Node.js `crypto`     | Cursor signing and security utilities |

## Infrastructure

| Service       | Purpose             |
| ------------- | ------------------- |
| MongoDB Atlas | Hosted database     |
| Cloudflare R2 | Object/file storage |
| Vercel        | Frontend deployment |
| Render        | Backend deployment  |

---

# 5. System Architecture

CloudSpaceGo uses a separate frontend and backend architecture.

```text
                         ┌───────────────────────┐
                         │      User Browser     │
                         │                       │
                         │ Next.js + React       │
                         │ TypeScript + Tailwind │
                         └───────────┬───────────┘
                                     │
                              REST API Requests
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    Express Backend    │
                         │                       │
                         │ Authentication        │
                         │ Controllers           │
                         │ Validation            │
                         │ Business Logic        │
                         │ Storage Service       │
                         └───────┬───────┬───────┘
                                 │       │
                       Metadata  │       │  File Objects
                                 │       │
                                 ▼       ▼
                    ┌──────────────┐   ┌──────────────┐
                    │ MongoDB Atlas│   │ Cloudflare R2│
                    │              │   │              │
                    │ Users        │   │ File Objects │
                    │ Files        │   │ Storage Keys │
                    │ Directories  │   │              │
                    │ Sessions     │   │              │
                    │ OTPs         │   │              │
                    └──────────────┘   └──────────────┘
```

### Layer Responsibilities

**Next.js Client**

* Renders the application
* Handles user interaction
* Sends API requests
* Manages file uploads
* Displays upload progress
* Handles file previews
* Implements progressive file loading

**Express Backend**

* Handles API requests
* Authenticates users
* Validates requests
* Manages files and folders
* Handles database operations
* Coordinates storage operations
* Streams file uploads and downloads

**MongoDB Atlas**

Stores application data such as:

* Users
* Directories
* File metadata
* Sessions
* OTP records

**Cloudflare R2**

Stores the actual uploaded file objects.

The database stores information about the file, while R2 stores the actual file.

---

# 6. How CloudSpaceGo Works

## 6.1 User Registration

The registration flow uses OTP verification and database transactions.

```text
User enters email
       ↓
Backend generates OTP
       ↓
OTP sent through Resend
       ↓
User verifies OTP
       ↓
User submits registration details
       ↓
MongoDB transaction starts
       ↓
Create user
       ↓
Create user's root directory
       ↓
Commit transaction
       ↓
Account created
```

The user and their root directory are created within the same transaction so the database doesn't end up with only one of them if something fails.

---

## 6.2 File Upload

CloudSpaceGo uses streaming for file uploads.

```text
User selects file
       ↓
Frontend starts upload
       ↓
POST request to backend
       ↓
Authentication check
       ↓
Backend validates directory ownership
       ↓
Generate file ID + storage key
       ↓
Storage service receives stream
       ↓
Cloudflare R2 / Local Storage
       ↓
Save file metadata in MongoDB
       ↓
Return response to client
       ↓
Frontend updates file list
```

The backend doesn't need to load the entire file into memory before sending it to storage.

---

## 6.3 File Listing & Cursor Pagination

The file API supports cursor-based pagination.

```text
Client requests files
       ↓
Backend validates limit
       ↓
Check cursor if provided
       ↓
Verify cursor signature
       ↓
Query MongoDB using cursor
       ↓
Fetch requested number of files
       ↓
Determine whether more files exist
       ↓
Generate next cursor
       ↓
Return files + pagination information
```

The cursor contains information needed to continue from the previous position and is signed before being returned to the client.

---

## 6.4 File Preview / Download

```text
Client requests file
       ↓
Backend finds file metadata
       ↓
Ownership check
       ↓
Storage service retrieves object
       ↓
Backend sets response headers
       ↓
File stream returned to client
       ↓
Browser previews or downloads file
```

This allows the application to preview supported files without storing the entire file in backend memory.

---

# 7. Important Engineering Decisions

## 7.1 Local Storage → Cloudflare R2

During early development, files were stored on the local filesystem.

That works locally, but it is not suitable as persistent storage for a deployed application.

I introduced a storage service abstraction that allows the application to work with different storage drivers.

```text
Application
     ↓
Storage Service
     ├── Local Storage
     └── Cloudflare R2
```

This allows the rest of the application to work with a common storage interface while the actual storage implementation can change.

For deployment, Cloudflare R2 is used for persistent object storage.

---

## 7.2 MongoDB Atlas

The project started with MongoDB during development and uses MongoDB Atlas for the deployed application.

MongoDB stores the application's structured data and file metadata, while the actual file objects are stored separately in object storage.

This keeps the database focused on application data instead of storing large binary files directly.

---

## 7.3 MongoDB Transactions

Creating a user also requires creating their root directory.

These operations are related.

If one succeeds and the other fails, the application could be left in an inconsistent state.

To avoid that, the registration flow uses a MongoDB transaction.

```text
Start Transaction
      ↓
Create User
      ↓
Create Root Directory
      ↓
Commit

If something fails:
      ↓
Rollback
```

This was one of the areas where I started understanding why database transactions matter in real applications.

---

## 7.4 Cursor-Based Pagination

Instead of relying only on offset pagination, CloudSpaceGo uses cursor-based pagination for file listing.

The cursor contains information about the current position and is signed using HMAC-SHA256.

This allows the backend to verify that the cursor hasn't been modified before using it in a database query.

The file query also uses a compound index based on the fields used by the cursor.

The frontend uses the returned cursor to continue loading more files.

---

## 7.5 Streaming Files

File uploads and downloads can involve large amounts of data.

Instead of unnecessarily buffering the complete file in memory, CloudSpaceGo streams file data between the client, backend, and storage layer.

```text
Upload:

Client
  ↓
HTTP Stream
  ↓
Backend
  ↓
R2 / Local Storage


Download:

R2 / Local Storage
  ↓
Backend Stream
  ↓
Client
```

This keeps the backend from having to hold the complete file in memory before processing it.

---

# 8. Challenges & Solutions

One of the most valuable parts of building CloudSpaceGo has been dealing with problems that don't appear when you're only following small tutorials.

## Challenge 1: Local Files Were Not Suitable for Deployment

### Problem

During development, uploaded files were stored on the local filesystem.

After deploying the backend, relying on local storage was not suitable for persistent file storage.

### What I changed

I introduced a storage service abstraction and added Cloudflare R2 as a storage driver.

```text
Storage Service
   ├── Local Driver
   └── R2 Driver
```

### What I learned

Application servers and persistent file storage are different concerns.

A deployed application should not depend on its local filesystem for persistent user files.

---

## Challenge 2: Authentication Worked Locally but Failed After Deployment

### Problem

Authentication worked during local development but had problems after deploying the frontend and backend separately.

### Investigation

The frontend and backend were running on different origins, so browser cookie and CORS configuration became important.

### What I changed

I configured:

* HTTP-only cookies
* Secure cookies in production
* Appropriate `SameSite` configuration
* Credentialed CORS
* Axios requests with credentials

### What I learned

Authentication isn't only about creating a login endpoint.

Browser security, cookies, CORS, HTTPS, and frontend/backend deployment configuration all have to work together.

---

## Challenge 3: User Registration Needed Multiple Database Writes

### Problem

Creating a user also required creating their root directory.

If one operation failed after the other had already succeeded, the database could be left in an inconsistent state.

### Solution

I moved the related operations into a MongoDB transaction.

### What I learned

When multiple database operations form one logical operation, they may need to succeed or fail together.

---

## Challenge 4: Making Pagination Reliable

### Problem

As the number of files grows, simply loading everything at once doesn't scale well.

I also wanted the frontend to continue loading files as the user scrolls.

### Solution

I implemented cursor-based pagination with:

* A cursor containing the current position
* HMAC-SHA256 signing
* Server-side limit validation
* MongoDB sorting and filtering
* A `hasMore` indicator
* A next cursor for the following request

### What I learned

Pagination isn't just a frontend feature.

The backend, database query, indexes, API response, and frontend loading strategy all have to work together.

---

# 9. Project Structure

```text
cloudspacego/
│
├── client/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── landing/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── directory/
│   │   ├── files/
│   │   ├── search/
│   │   ├── settings/
│   │   ├── sharing/
│   │   ├── storage/
│   │   └── trash/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   ├── types/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── local.storage.js
│   │   ├── r2.service.js
│   │   ├── sendOtpService.js
│   │   └── storage.service.js
│   ├── utils/
│   ├── index.js
│   └── package.json
│
└── README.md
```

The project is organized into separate frontend and backend applications.

The backend further separates routes, controllers, models, services, middleware, and utilities so that different responsibilities remain easier to manage.

---

# 10. API Overview

## Authentication

| Method | Endpoint           | Description                             | Auth |
| ------ | ------------------ | --------------------------------------- | ---- |
| POST   | `/auth/send-otp`   | Send verification OTP                   | No   |
| POST   | `/auth/verify-otp` | Verify OTP                              | No   |
| POST   | `/user/register`   | Register user and create root directory | No   |
| POST   | `/user/login`      | Login and create session                | No   |
| GET    | `/user`            | Get authenticated user                  | Yes  |
| POST   | `/user/logout`     | Logout current session                  | Yes  |

## File Management

| Method | Endpoint             | Description                       | Auth |
| ------ | -------------------- | --------------------------------- | ---- |
| GET    | `/file`              | List files with cursor pagination | Yes  |
| GET    | `/file/:id`          | Preview or download a file        | Yes  |
| POST   | `/file/:parentDirId` | Upload a file                     | Yes  |
| PATCH  | `/file/:id`          | Rename a file                     | Yes  |
| DELETE | `/file/:id`          | Delete a file                     | Yes  |

## Directory Management

| Method | Endpoint                  | Description                  | Auth |
| ------ | ------------------------- | ---------------------------- | ---- |
| GET    | `/directory/:id`          | Get directory contents       | Yes  |
| POST   | `/directory/:parentDirId` | Create a directory           | Yes  |
| PATCH  | `/directory/:id`          | Rename a directory           | Yes  |
| DELETE | `/directory/:id`          | Delete directory recursively | Yes  |

## System

| Method | Endpoint  | Description      | Auth |
| ------ | --------- | ---------------- | ---- |
| GET    | `/health` | API health check | No   |

---

# 11. Local Development

## Prerequisites

* Node.js
* npm
* MongoDB or a MongoDB Atlas connection
* Resend API key for OTP emails
* Cloudflare R2 credentials if using R2 storage

## Clone the repository

```bash
git clone https://github.com/prashantkumarpro/cloudspacego.git
cd cloudspacego
```

## Start the backend

```bash
cd server
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Add the required environment variables and start the server:

```bash
npm run dev
```

The backend runs on port `4000` by default.

## Start the frontend

Open another terminal:

```bash
cd client
npm install
```

Create:

```text
.env.local
```

Set the backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Then start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 12. Environment Variables

## Server

Create:

```text
server/.env
```

Example:

```env
PORT=4000

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/

CORS_ORIGIN=http://localhost:3000

STORAGE_DRIVER=local

CURSOR_SECRET=your_cursor_secret

RESEND_API_KEY=your_resend_api_key

R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
```

If `STORAGE_DRIVER=local`, the R2 variables are not required for local storage.

For R2:

```env
STORAGE_DRIVER=r2
```

## Client

Create:

```text
client/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Never commit real credentials or secrets to the repository.

---

# 13. Product Preview

Screenshots and product walkthroughs will be added as the product continues to evolve.

---

# 14. Roadmap

## Phase 1 — Foundation

* [x] Authentication
* [x] OTP email verification
* [x] Session authentication
* [x] User + root directory creation
* [x] MongoDB integration
* [x] Local storage
* [x] Cloudflare R2 integration
* [x] File upload
* [x] File download
* [x] File preview
* [x] Folder management

## Phase 2 — File Loading & UX

* [x] Cursor-based pagination
* [x] Infinite scrolling
* [x] Upload progress
* [x] Upload manager
* [x] File preview modal
* [x] Recursive directory deletion
* [x] Responsive UI
* [x] Dark/light mode

## Phase 3 — Search & File Lifecycle

* [ ] Server-side search
* [ ] Search indexing
* [ ] Starred files
* [ ] File tagging
* [ ] Trash lifecycle
* [ ] Upload cancellation
* [ ] Storage quota calculation

## Phase 4 — Sharing & Collaboration

* [ ] Public file links
* [ ] Temporary signed access URLs
* [ ] File sharing between users
* [ ] Permissions
* [ ] Activity/audit logs

---

# 15. What I Am Learning

CloudSpaceGo is helping me understand backend development by actually building with it.

### Backend Architecture

I'm learning how to organize a backend using routes, controllers, services, models, middleware, and utilities.

### API Design

I'm learning how frontend actions become API requests and how the backend validates and processes them.

### Database Engineering

I'm working with MongoDB and learning about schemas, relationships, indexes, aggregation pipelines, and transactions.

### File Storage

I'm learning the difference between application data and binary file storage, and why object storage is useful for a cloud application.

### Streaming

I'm learning how files can be streamed instead of unnecessarily loading entire files into server memory.

### Authentication

I'm learning how sessions, cookies, CORS, browser security, and frontend/backend deployment work together.

### Pagination

I'm learning how cursor-based pagination works across the database, API, and frontend.

### Deployment

I'm learning that deploying a project introduces problems that don't always appear during local development.

### Debugging

Most importantly, I'm learning how to investigate a problem, understand why it happens, and then change the implementation instead of simply looking for a quick fix.

---

# 16. Author & Connect

## Prashant Kumar

I'm a developer focused on building web applications and learning by building real projects.

CloudSpaceGo is one of the projects I'm using to go deeper into backend engineering and understand how complete products are built from end to end.

* GitHub: [@prashantkumarpro](https://github.com/prashantkumarpro)
* Repository: [CloudSpaceGo](https://github.com/prashantkumarpro/cloudspacego)

---

> Built while learning, debugging, experimenting, and trying to understand how things work from end to end.
