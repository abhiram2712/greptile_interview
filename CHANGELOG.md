# Changelog

## [2025-01-10] - Initial Development

### Added
- Created project structure and initial setup files
- Set up todo list for tracking development progress
- Planned architecture for AI-powered changelog generator
  - Next.js with TypeScript for the web application
  - Developer tool for generating changelogs at /generate
  - Public-facing changelog display at /
  - OpenAI integration for intelligent commit summarization
  - Simple file-based storage system for changelogs

### Technical Decisions
- Chose Next.js App Router for modern React patterns
- Selected file-based storage for simplicity (easily upgradeable to database)
- Planned minimalistic UI design focused on developer experience

### Implementation Progress
- ✅ Created project structure with Next.js, TypeScript, and Tailwind CSS
- ✅ Implemented core utilities:
  - Git operations (commit parsing, filtering by date range)
  - OpenAI integration for changelog summarization
  - File-based storage system for changelog entries
- ✅ Built API endpoints:
  - `/api/commits` - Fetch git commits with date filtering
  - `/api/changelog/generate` - AI-powered changelog generation
  - `/api/changelog` - CRUD operations for changelog entries
- ✅ Created React components:
  - ChangelogEntry - Display individual changelog entries
  - CommitList - Interactive commit selection interface
  - ChangelogForm - Complete form for generating and editing changelogs
- ✅ Implemented main pages:
  - Home page (/) - Public changelog display with delete functionality
  - Generate page (/generate) - Developer tool with date range selection and AI generation

### Next Steps
- Install dependencies and test the application
- Add environment variables for OpenAI API
- Create sample changelogs to demonstrate functionality
- Write comprehensive README with setup instructions

## [2025-01-10] - Multi-Project Support

### Added
- **Multi-Project Architecture**: Complete redesign to support multiple projects
  - Project sidebar similar to chat.com interface
  - GitHub URL input for adding public repositories
  - Project persistence using file storage
  - Project switching with localStorage for selected project

### Changed
- **GitHub API Integration**: Replaced local git operations with GitHub API
  - Fetch commits from any public GitHub repository
  - No authentication required for public repos
  - Support for date range filtering

- **Updated Storage System**: 
  - Changelogs now associated with project IDs
  - File naming includes project ID prefix
  - Filtering by project in all operations

- **UI Improvements**:
  - Added collapsible sidebar for project navigation
  - Project-aware pages that respond to selection
  - Empty states when no project selected
  - Maintained clean, Stripe-inspired design

### Technical Implementation
- Created GitHub utilities for parsing URLs and fetching commits
- Project management system with CRUD operations
- Updated all API routes to handle project context
- Client-side state management for selected project
- Responsive layout with sidebar integration