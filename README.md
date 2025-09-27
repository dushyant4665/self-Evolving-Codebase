# Self-Evolving Codebase 🤖

A futuristic AI-powered self-improving software system that analyzes your GitHub repositories, suggests intelligent improvements, and automatically creates pull requests with tests.

![Self-Evolving Codebase](https://img.shields.io/badge/AI-Powered-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue) ![Supabase](https://img.shields.io/badge/Supabase-Database-green) ![Vercel](https://img.shields.io/badge/Vercel-Deployment-black)

## 🚀 Features

- **🧠 AI Code Analysis**: Intelligent analysis of repository structure and code patterns
- **💡 Smart Suggestions**: AI-generated improvements for features, bug fixes, refactoring, and optimizations
- **🔄 Automatic PRs**: Creates pull requests with detailed descriptions and code changes
- **🧪 CI/CD Integration**: GitHub Actions workflow for automated testing
- **📊 Evolution History**: Track all AI suggestions and their outcomes
- **🎨 Modern UI**: Clean, futuristic interface built with Tailwind CSS
- **🔐 Secure**: GitHub OAuth integration with proper authentication

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase (PostgreSQL)
- **Authentication**: GitHub OAuth
- **AI**: Gemini API / DeepSeek / OpenRouter (free tiers)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (free tier)

## 🏗️ Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd self-evolving-codebase
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# AI API (choose one)
GEMINI_API_KEY=your_gemini_api_key
# OR
DEEPSEEK_API_KEY=your_deepseek_api_key
# OR
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-setup.sql`
3. Get your project URL and anon key from Settings > API

### 4. GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App:
   - Application name: `Self-Evolving Codebase`
   - Homepage URL: `http://localhost:3000` (for development)
   - Authorization callback URL: `http://localhost:3000/auth/callback`
3. Copy Client ID and Client Secret to your `.env.local`

### 5. AI API Setup

Choose one of these free AI providers:

#### Option A: Google Gemini (Recommended)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add `GEMINI_API_KEY=your_key` to `.env.local`

#### Option B: DeepSeek
1. Sign up at [DeepSeek](https://platform.deepseek.com)
2. Get your API key
3. Add `DEEPSEEK_API_KEY=your_key` to `.env.local`

#### Option C: OpenRouter
1. Sign up at [OpenRouter](https://openrouter.ai)
2. Get your API key (free tier available)
3. Add `OPENROUTER_API_KEY=your_key` to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Update GitHub OAuth callback URL to your Vercel domain
5. Deploy!

## 📖 How It Works

1. **Connect Repository**: Users authenticate with GitHub and select a repository
2. **Select Files**: Choose files to analyze (supports most code file types)
3. **AI Analysis**: AI analyzes the codebase and suggests improvements
4. **Preview Changes**: Review the suggested changes in a detailed modal
5. **Create PR**: Automatically creates a pull request with the changes
6. **CI/CD Testing**: GitHub Actions runs tests on the PR
7. **Track Evolution**: All suggestions and outcomes are logged and tracked

## 🎯 AI Suggestion Types

- **🆕 Features**: New functionality additions
- **🐛 Bug Fixes**: Potential bug fixes and improvements
- **🔄 Refactoring**: Code structure and readability improvements
- **⚡ Optimizations**: Performance and efficiency enhancements

## 📊 Evolution Dashboard

- **Repository Browser**: View and select repositories
- **File Explorer**: Navigate and select files for analysis
- **Evolution History**: Track all AI suggestions with status updates
- **Statistics**: View evolution metrics and success rates

## 🔒 Security Features

- GitHub OAuth for secure authentication
- Row Level Security (RLS) in Supabase
- API rate limiting and validation
- Secure token handling

## 🧪 Testing

The project includes automated testing via GitHub Actions:

- Basic syntax validation
- Security scanning for hardcoded secrets
- Code formatting checks
- Custom test integration

## 🤝 Contributing

This is a demonstration project showcasing AI-powered code evolution. Feel free to:

- Fork and experiment
- Submit improvements
- Report issues
- Suggest new features

## 📄 License

MIT License - feel free to use this project as inspiration for your own AI-powered development tools.

---

**Built with ❤️ for the future of self-improving software systems**
