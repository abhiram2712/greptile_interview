# AI-Powered Changelog Generator

An intelligent changelog generator that helps developers quickly create user-friendly changelogs from git commits using AI.

## Features

- 🤖 **AI-Powered Summarization**: Uses OpenAI to intelligently summarize git commits into user-friendly changelog entries
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

### Generating a Changelog

1. Navigate to `/generate`
2. Select a date range to fetch commits
3. Click "Fetch Commits" to load commits from your git repository
4. Select the commits you want to include in the changelog
5. Click "Generate Changelog" to create an AI-powered summary
6. Edit the generated content if needed
7. Add version number, author name, and other details
8. Click "Save Changelog" to publish

### Viewing Changelogs

1. Navigate to `/` (home page)
2. View all published changelogs in chronological order
3. Delete entries if needed (with confirmation)

## Project Structure

```
greptile_interview/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── changelog/     # Changelog CRUD operations
│   │   └── commits/       # Git commit fetching
│   ├── generate/          # Developer tool page
│   └── page.tsx          # Public changelog page
├── components/            # React components
│   ├── ChangelogEntry.tsx # Display changelog entries
│   ├── CommitList.tsx    # Commit selection UI
│   └── ChangelogForm.tsx # Changelog generation form
├── lib/                   # Utility functions
│   ├── git.ts            # Git operations
│   ├── ai.ts             # OpenAI integration
│   └── storage.ts        # File storage operations
└── public/
    └── changelogs/       # JSON changelog storage
```

## API Endpoints

- `GET /api/commits?since=YYYY-MM-DD&until=YYYY-MM-DD` - Fetch git commits
- `POST /api/changelog/generate` - Generate AI changelog summary
- `GET /api/changelog` - Get all changelogs
- `POST /api/changelog` - Save a new changelog
- `DELETE /api/changelog?id=ID` - Delete a changelog

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