# TaskManager

School project for TalTech IT College — a task management web app built with
Next.js, React and TypeScript against the course teaching API
(`taltech.akaver.com`). Not intended for production use.

## Features

- Email/password auth with JWT access + refresh token sessions
- Task lifecycle: create, edit, complete/delete, filter by status/priority/category
- Categories and priorities management

## Getting started

Requires Node 22+.

```bash
cp .env.local.example .env.local   # set the API base URL
npm install
npm run dev                        # http://localhost:3000
```

Register an account via the app — the backend is the public teaching API.

## Tests & lint

```bash
npm test
npm run lint
```

## Docker

```bash
docker compose up -d --build       # serves static export on port 89
```
