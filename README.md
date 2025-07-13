# AI-Powered Changelog Generator

A multi-project changelog generator that helps developers quickly create user-friendly changelogs from GitHub commits using AI.

## Features

- 🚀 **Multi-Project Support**: Manage changelogs for multiple GitHub repositories in one place
- 🤖 **AI-Powered Summarization**: Analyzes actual code changes (diffs) and repository context for accurate changelogs
- 🔗 **GitHub Integration**: Works with any public GitHub repository - just paste the URL
- 📅 **Date Range Selection**: Fetch commits from specific date ranges with proper timezone handling
- ✅ **Interactive Commit Selection**: Choose which commits to include in your changelog
- ✏️ **Full CRUD Operations**: Create, read, update, and delete changelogs
- 🎨 **Clean, Minimalistic UI**: Inspired by Stripe and modern SaaS designs
- 💾 **Database Storage**: Uses Prisma ORM with SQLite (easily upgradeable to PostgreSQL)
- 🚀 **Smart Caching**: Caches commit diffs and project context to minimize API calls
- 📝 **Rich Editing**: Full markdown support with live preview
- 🌐 **Public Changelog Pages**: Share changelogs with customizable URLs
- 🔄 **Project Summaries**: AI-generated project overviews with public visibility controls

## Tech Stack

**Next.js 14** (React) • **TypeScript** • **Tailwind CSS** • **Prisma ORM** • **SQLite** • **OpenAI API** • **GitHub API**

## Quick Start

### Prerequisites
- Node.js 18+ installed
- An OpenAI API key (required for changelog generation)
- Git installed

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd greptile_interview
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Create a .env file in the root directory
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL="file:./dev.db"
EOF
```

> **Note**: The `DATABASE_URL` is pre-configured for SQLite. No additional database setup required!
> 
> Optional: Add `GITHUB_TOKEN=ghp_...` to increase GitHub API rate limits.

4. **Initialize the database:**
```bash
npm run db:push
```

5. **Start the development server:**
```bash
npm run dev
```

6. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

That's it! You're ready to start generating changelogs.

## Technical & Product Decisions

### Architecture Overview

We built a **modern Next.js application** with a focus on simplicity and maintainability:

- **Service-Oriented Design**: Business logic separated from API routes for better organization
- **Type-Safe Throughout**: Full TypeScript coverage with strict typing
- **Smart Data Management**: Efficient caching to minimize API calls and improve performance
- **Component Reusability**: Custom hooks and shared components reduce code duplication
- **Clean Separation**: Developer tools and public pages have distinct routing and experiences

### Product Decisions

#### Dual-View Architecture
- **Developer View** (`/dev`): Full CRUD operations, draft/publish workflow
- **Public View** (`/p/[slug]`): Clean, read-only changelog presentation
- Separate routing ensures clear separation of concerns

#### AI-Enhanced Features
- **Context-Aware Generation**: AI analyzes repository structure, README, and tech stack
- **Smart Summarization**: Groups related commits and identifies key changes
- **Project Summaries**: Auto-generated overviews with manual editing capability

### Database Design
- **Efficient Caching**: Stores commit diffs to minimize GitHub API calls
- **Flexible Schema**: JSON fields for extensibility without migrations
- **Relational Design**: Proper many-to-many relationships for commits and changelogs


## Usage Guide

### Getting Started

1. **Add Your First Project**
   - Click the "+ Add Project" button in the sidebar
   - Paste any public GitHub repository URL (e.g., `https://github.com/facebook/react`)
   - The system will verify access and create the project

2. **Generate Your First Changelog**
   - Select your project from the sidebar
   - Click "Generate New Changelog" 
   - Select a date range to fetch commits
   - Choose the commits you want to include
   - Click "Generate with AI" to create a professional changelog
   - Review, edit if needed, and save

### Developer Workflow

#### Creating Changelogs
1. Navigate to the Generate page via the sidebar
2. Select your date range (timezone-aware)
3. Review and select relevant commits
4. Generate AI summary with context-aware analysis
5. Edit the markdown content with live preview
6. Add metadata (version, author)
7. Save as draft or publish immediately

#### Managing Content
- **Project Summary**: Auto-generated overview with visibility controls
- **Changelog Entries**: Full CRUD with draft/publish workflow
- **Public Pages**: Share at `/p/[project-slug]`
- **Bulk Actions**: Publish/unpublish with one click

### Public Changelog Pages

Each project gets a unique public URL:
- Format: `yoursite.com/p/[project-slug]`
- Features clean, read-only presentation
- Shows only published entries
- Optional project summary section
- Individual entry permalinks

## Future Enhancements

- **Authentication**: Add user authentication for team environments
- **Markdown Export**: Export changelogs as markdown files
- **Webhook Integration**: Auto-generate changelogs on git push
- **Custom AI Prompts**: Allow customization of AI generation prompts
- **Version Detection**: Auto-detect version numbers from tags
- **Chat Interface**: chat with AI to edit changelog content
- **Private Repos**: Support for private GitHub repositories

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

---

*This project was built with the assistance of AI (Cursor).*