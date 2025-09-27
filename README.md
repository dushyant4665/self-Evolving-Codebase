# Self-Evolving Codebase

A smart system that reads your code and suggests improvements automatically.

## What it does

This project connects to your GitHub account and analyzes your code repositories. It uses AI to understand your code patterns and suggests better ways to write them. When you approve a suggestion, it creates a pull request on GitHub with the improvements.

Think of it as having a smart coding assistant that never gets tired of helping you write better code.

## How it works

1. Connect your GitHub account
2. Choose a repository to analyze
3. Select files you want to improve
4. AI analyzes your code and suggests changes
5. Review the suggestions
6. Create pull requests with improvements
7. Track all changes in evolution history

## Technology used

- Next.js for the web interface
- TypeScript for type safety
- Supabase for database
- GitHub API for repository access
- AI APIs (Gemini, DeepSeek, or OpenRouter)

## Setup

### Clone the project

```bash
git clone https://github.com/dushyant4665/self-Evolving-Codebase.git
cd self-evolving-codebase
npm install
```

### Environment variables

Create `.env.local` file with these settings:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# GitHub
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret

# AI (pick one)
GEMINI_API_KEY=your_gemini_key
```

### Database setup

1. Create account at supabase.com
2. Create new project
3. Get URL and key from settings

### GitHub setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new app with callback: http://localhost:3000/auth/callback
3. Copy client ID and secret

### AI setup

Get free API key from:
- Google AI Studio (Gemini) - recommended
- DeepSeek platform
- OpenRouter

### Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Contributing

Fork this repository, make changes, and submit a pull request.

## License

<<<<<<< HEAD
MIT License
=======
MIT License
>>>>>>> 3693b3c5e4e64ffffcde6997d8b1ed265829884f
