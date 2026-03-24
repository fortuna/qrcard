# Agent Instructions (AGENTS.md)

## Project Context
This repository contains a mobile-friendly QR vCard Generator web application.
- **Tech Stack:** Vanilla JavaScript, HTML, CSS, Vite.
- **Key Libraries:** `qrcode` (generation), `jsqr` (scanning/uploading), `lucide` (icons).
- **Deployment:** GitHub Pages via `.github/workflows/deploy.yml` (deployed to the `/qrcard/` subpath).

## Rules for AI Agents
1. **Never commit and push changes without asking the user first.** Always propose changes, edit files, and wait for explicit confirmation from the user before running any `git commit` or `git push` commands.
2. Maintain the existing UI aesthetic (dark mode, glassmorphism, responsive design).
3. Do not introduce modern JS frameworks (React, Vue, etc.) unless explicitly requested; stick to Vanilla JS.
4. Always serve the app during verification using the provided Vite commands or by testing the finalized `/dist` build.
