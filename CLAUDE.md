# PulseLive

PulseLive is a real-time live polling and Q&A web application designed for interactive presentations, workshops, and events. It enables presenters to create polls and Q&A sessions, display a QR code for audience participation, and view live-updating results without requiring any login or accounts for the audience.

## Project Structure & Architecture

PulseLive is built as a Single Page Application (SPA) using:
- **Frontend**: Vite, React, TypeScript, React Router, Tailwind CSS (or modern CSS/styling setup)
- **Backend / Database**: Supabase (PostgreSQL with Row Level Security and Realtime subscriptions)
- **Deployment**: Vercel (with client-side routing rewrites via `vercel.json`)

### Core Features & Views

1. **Presenter Dashboard (`/`)**: View all polls, status badges (`Draft`, `Live`, `Closed`), response counts, and create new polls.
2. **Create Poll (`/create`)**: Form to specify Title, Question, and Type (`choice` or `qa`), with dynamic option adding for multiple choice.
3. **Poll Management (`/poll/:id`)**: Displays QR code, join link with copy button, voting open/close controls, live results view, and result reset functionality.
4. **Presenter View (`/poll/:id/present`)**: Full-screen projector-optimized view with large text, animated live results, and a persistent QR code in the corner.
5. **Audience Vote Page (`/vote/:id`)**: Mobile-first, login-free interface for casting votes or submitting/upvoting Q&A questions with real-time updates.

## Database Schema (`Supabase`)

The backend consists of four primary tables with `anon` RLS policies enabled for demo accessibility:
- **`polls`**: `id` (uuid), `title` (text), `question` (text), `type` ('choice' | 'qa'), `status` ('draft' | 'live' | 'closed'), `created_at` (timestamptz)
- **`options`**: `id` (uuid), `poll_id` (uuid), `option_text` (text), `display_order` (int)
- **`votes`**: `id` (uuid), `poll_id` (uuid), `option_id` (uuid), `created_at` (timestamptz)
- **`questions`**: `id` (uuid), `poll_id` (uuid), `question_text` (text), `upvotes` (int), `created_at` (timestamptz)

Realtime replication is enabled on `polls`, `votes`, and `questions` tables for instant live updates across all connected clients.

## Getting Started

1. Configure environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY_HERE
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run local development server:
   ```bash
   npm run dev
   ```
