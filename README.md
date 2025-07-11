# AI-Powered Changelog Generator

A multi-project changelog generator that helps developers quickly create user-friendly changelogs from GitHub commits using AI.

## Features

- 🚀 **Multi-Project Support**: Manage changelogs for multiple GitHub repositories in one place
- 🤖 **AI-Powered Summarization**: Analyzes actual code changes (diffs) and repository context for accurate changelogs
- 🔗 **GitHub Integration**: Works with any public GitHub repository - just paste the URL
- 📅 **Date Range Selection**: Fetch commits from specific date ranges
- ✅ **Interactive Commit Selection**: Choose which commits to include in your changelog
- ✏️ **Full CRUD Operations**: Create, read, update, and delete changelogs
- 🎨 **Clean, Minimalistic UI**: Inspired by Stripe and ChatGPT designs
- 💾 **Database Storage**: Uses Prisma ORM with SQLite (easily upgradeable to PostgreSQL)
- 🚀 **Smart Caching**: Caches commit diffs and project context to minimize API calls
- 📝 **Edit Changelogs**: Update existing changelogs with a dedicated edit interface
- 🗑️ **Delete Changelogs**: Remove changelogs with confirmation dialog

## Technical Decisions

### Why Next.js with App Router?
- Modern React patterns with Server Components
- Built-in API routes for backend functionality
- Excellent TypeScript support
- Easy deployment options

### Why Prisma with SQLite?
- Type-safe database queries with excellent TypeScript support
- Easy to set up with SQLite for development
- Seamlessly upgradeable to PostgreSQL for production
- Stores commit diffs and project context for better AI generation

### Why OpenAI for Summarization?
- Best-in-class language model for technical writing
- Understands developer terminology and conventions
- Produces high-quality, user-friendly summaries

### Design Philosophy
- **Minimalistic**: Focus on functionality over flashy design
- **Developer-First**: Built for developers, by developers
- **Efficient**: Quick to generate, easy to edit
- **Flexible**: AI assists but doesn't restrict manual editing

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd greptile_interview
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your API keys:
```bash
cp .env.example .env
# Edit .env and add:
# - OPENAI_API_KEY (required)
# - GITHUB_TOKEN (optional, increases rate limits)
```

4. Set up the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding a Project

1. Click "+ Add Project" in the sidebar
2. Paste a public GitHub repository URL (e.g., `https://github.com/facebook/react`)
3. Click "Add" to add the project

### Generating a Changelog

1. Select a project from the sidebar
2. Navigate to `/generate` 
3. Select a date range to fetch commits
4. Click "Fetch Commits" to load commits from GitHub
5. Select the commits you want to include in the changelog
6. Click "Generate Changelog" to create an AI-powered summary
7. Edit the generated content if needed
8. Add version number, author name, and other details
9. Click "Save Changelog" to publish

### Managing Changelogs

1. **View**: Select a project from the sidebar on the home page
2. **Edit**: Hover over a changelog entry and click the pencil icon
3. **Delete**: Hover over a changelog entry and click the trash icon
4. **Details**: Click on any changelog to view the full formatted content

## Project Structure

```
greptile_interview/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── changelog/     # Changelog CRUD operations
│   │   ├── commits/       # GitHub commit fetching
│   │   └── projects/      # Project management
│   ├── generate/          # Developer tool page
│   └── page.tsx          # Public changelog page
├── components/            # React components
│   ├── ChangelogEntry.tsx # Display changelog entries
│   ├── CommitList.tsx    # Commit selection UI
│   ├── ChangelogForm.tsx # Changelog generation form
│   ├── ProjectSidebar.tsx# Project selection sidebar
│   └── LayoutWithSidebar.tsx # Layout wrapper
├── lib/                   # Utility functions
│   ├── github.ts         # GitHub API integration
│   ├── ai.ts             # Basic OpenAI integration
│   ├── ai-enhanced.ts    # Enhanced AI with code analysis
│   ├── prisma.ts         # Database client
│   └── types.ts          # TypeScript type definitions
├── prisma/
│   └── schema.prisma     # Database schema
└── scripts/
    └── migrate-to-db.ts  # Migration script from file storage
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Add a new project (requires GitHub URL)
- `DELETE /api/projects?id=ID` - Delete a project

### Commits
- `GET /api/commits?projectId=ID&since=YYYY-MM-DD&until=YYYY-MM-DD` - Fetch GitHub commits

### Changelogs
- `GET /api/changelog?projectId=ID` - Get changelogs for a project
- `POST /api/changelog` - Save a new changelog
- `GET /api/changelog/[id]` - Get a specific changelog
- `PUT /api/changelog/[id]` - Update a changelog
- `DELETE /api/changelog/[id]` - Delete a changelog
- `POST /api/changelog/generate` - Generate AI changelog summary with code analysis

### Additional Endpoints
- `GET /api/commits/[sha]?projectId=ID` - Get detailed commit info with diff
- `POST /api/projects/[id]/context` - Update project context (README, tech stack)

## Database Schema

The application uses Prisma ORM with the following models:
- **Project**: GitHub repository information
- **Changelog**: Individual changelog entries
- **Commit**: Git commits with diffs and file changes
- **ProjectContext**: Repository metadata (README, tech stack, file structure)
- **ChangelogCommit**: Many-to-many relation between changelogs and commits

## Future Enhancements

- **Authentication**: Add user authentication for team environments
- **Markdown Export**: Export changelogs as markdown files
- **Webhook Integration**: Auto-generate changelogs on git push
- **Custom AI Prompts**: Allow customization of AI generation prompts
- **Version Detection**: Auto-detect version numbers from tags
- **RSS Feed**: Provide RSS feed for changelog subscribers
- **Private Repos**: Support for private GitHub repositories

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT