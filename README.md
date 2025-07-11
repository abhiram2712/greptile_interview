# AI-Powered Changelog Generator

A multi-project changelog generator that helps developers quickly create user-friendly changelogs from GitHub commits using AI.

## Features

- 🚀 **Multi-Project Support**: Manage changelogs for multiple GitHub repositories in one place
- 🤖 **AI-Powered Summarization**: Uses OpenAI to intelligently summarize git commits into user-friendly changelog entries
- 🔗 **GitHub Integration**: Works with any public GitHub repository - just paste the URL
- 📅 **Date Range Selection**: Fetch commits from specific date ranges
- ✅ **Interactive Commit Selection**: Choose which commits to include in your changelog
- ✏️ **Editable Output**: AI-generated content can be edited before saving
- 🎨 **Clean, Minimalistic UI**: Inspired by Stripe and Twilio changelog designs
- 💾 **Simple Storage**: File-based storage system (easily upgradeable to database)

## Technical Decisions

### Why Next.js with App Router?
- Modern React patterns with Server Components
- Built-in API routes for backend functionality
- Excellent TypeScript support
- Easy deployment options

### Why File-Based Storage?
- Simple to implement and understand
- No database setup required
- Easy to version control changelogs
- Can be easily migrated to a database later

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

3. Create a `.env.local` file with your OpenAI API key:
```bash
cp .env.local.example .env.local
# Edit .env.local and add your OpenAI API key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

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

### Viewing Changelogs

1. Select a project from the sidebar
2. Navigate to `/` (home page)
3. View all published changelogs for that project in chronological order
4. Delete entries if needed (with confirmation)

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
│   ├── projects.ts       # Project management
│   ├── ai.ts             # OpenAI integration
│   └── storage.ts        # File storage operations
└── public/
    ├── changelogs/       # JSON changelog storage
    └── projects.json     # Projects data
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
- `POST /api/changelog` - Save a new changelog (requires projectId)
- `DELETE /api/changelog?id=ID&projectId=PID` - Delete a changelog
- `POST /api/changelog/generate` - Generate AI changelog summary

## Future Enhancements

- **Database Integration**: Migrate from file storage to PostgreSQL/MongoDB
- **Authentication**: Add user authentication for team environments
- **Markdown Export**: Export changelogs as markdown files
- **Webhook Integration**: Auto-generate changelogs on git push
- **Custom AI Prompts**: Allow customization of AI generation prompts
- **Version Detection**: Auto-detect version numbers from tags
- **RSS Feed**: Provide RSS feed for changelog subscribers

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT