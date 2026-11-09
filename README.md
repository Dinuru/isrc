# ISRC Finder

A minimal, fast, and responsive web application built with **Next.js (App Router)**, **Tailwind CSS**, and the **Spotify Web API** that allows users to search for any track and retrieve its official **ISRC (International Standard Recording Code)**.

## Features

- **Strict Dark Mode:** Sleek pure black (`#000000`) and zinc (`bg-zinc-950`) UI with smooth hover/focus transitions.
- **Fast Search:** Direct Spotify Web API track search using Spotify Client Credentials OAuth with server-side in-memory token caching.
- **ISRC Extraction & Strict Formatting:** Displays codes in standard `isrc:[CODE]` format (e.g., `isrc:AUUM71500303`).
- **One-Click Raw Code Copy:** Dedicated copy button copies **only** the raw code (e.g., `AUUM71500303`) with a 2-second checkmark visual confirmation.
- **Rich Track Metadata:** Displays album cover artwork thumbnail, song title, primary artist, and album release year.
- **Fully Responsive:** Optimized for mobile, tablet, and desktop (Windows, macOS, iOS, Android).
- **Vercel-Ready:** Zero-config one-click deployment ready for Vercel.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Icons:** `lucide-react`
- **Data Source:** Spotify Web API (Client Credentials Flow)
- **Deployment:** Vercel

## Getting Started

### 1. Clone the repository & install dependencies

```bash
git clone <your-repo-url>
cd isrc
npm install
```

### 2. Environment Variables

Create or verify `.env.local` in the project root:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm run start
```

## Deploying to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project into [Vercel](https://vercel.com).
3. In the Vercel project settings, add the environment variables:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
4. Click **Deploy**.

## License

MIT
