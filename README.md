# Issue Tracker

A modern, full-featured issue tracking application built with Next.js and Firebase. This application allows users to create, manage, and track issues with intelligent similar issue detection and comprehensive filtering capabilities.

## Features

- **Authentication**: Secure user authentication with Firebase Auth (sign up and login)
- **Issue Management**: Create issues with title, description, priority, status, assignment, and timestamps
- **Similar Issue Detection**: Intelligent detection of similar issues when creating new ones
- **Issue Filtering**: Filter issues by status and priority
- **Status Management**: Smart status transitions with validation rules
- **Modern UI**: Clean, responsive design with Tailwind CSS

## Tech Stack

### Frontend Stack

**Why Next.js?**
I chose Next.js 14 with the App Router for several key reasons:

1. **Server-Side Rendering & Performance**: Next.js provides excellent performance out of the box with automatic code splitting, image optimization, and server-side rendering capabilities. This ensures fast page loads and better SEO.

2. **React Framework**: Built on React, it provides a familiar development experience while adding powerful features like file-based routing, API routes, and built-in optimizations.

3. **TypeScript Support**: Excellent TypeScript integration ensures type safety and better developer experience, reducing runtime errors.

4. **Vercel Integration**: Seamless deployment to Vercel with zero configuration, making the deployment process straightforward.

5. **Modern Development Experience**: The App Router provides a more intuitive routing system, better data fetching patterns, and improved developer experience compared to the Pages Router.

**Why Tailwind CSS?**
- Utility-first approach allows rapid UI development
- Consistent design system with minimal CSS
- Responsive design made simple
- Small production bundle size with purging unused styles

**Why Firebase?**
- Real-time database capabilities with Firestore
- Built-in authentication system
- Scalable backend without managing servers
- Easy integration with Next.js
- Generous free tier for development

## Firestore Data Structure

The application uses a single collection called `issues` in Firestore. Each document in the collection represents an issue with the following structure:

```typescript
{
  title: string              // Issue title
  description: string        // Detailed description
  priority: "Low" | "Medium" | "High"  // Priority level
  status: "Open" | "In Progress" | "Done"  // Current status
  assignedTo: string         // Email or name of assignee
  createdTime: Timestamp    // Firebase Timestamp of creation
  createdBy: string         // Email of the user who created the issue
}
```

**Design Decisions:**
- **Single Collection**: Kept the structure simple with one collection since we don't need complex relationships
- **Timestamp**: Using Firebase Timestamp for consistent date handling across clients
- **String IDs**: Firestore auto-generates document IDs, which we use for references
- **No Nested Data**: Flat structure makes queries simple and efficient
- **Indexing**: Firestore automatically indexes fields, making filtering and sorting efficient

## Similar Issue Handling

The similar issue detection works by analyzing both the title and description of new issues against existing issues in the database. Here's how it works:

### Detection Algorithm

1. **Title Matching**:
   - Checks if the new title contains the existing title or vice versa (substring matching)
   - Extracts words longer than 3 characters and finds common words between titles
   - If 2 or more significant words match, considers it similar

2. **Description Matching**:
   - Performs substring matching on descriptions
   - Checks if either description contains the other

3. **Real-time Detection**:
   - As the user types the title (after 5 characters), the system automatically checks for similar issues
   - Results are displayed immediately in a warning banner

### User Experience

When similar issues are detected:
- A yellow warning banner appears showing the number of similar issues
- Displays up to 3 similar issue titles with their current status
- User can still proceed with creation after confirmation
- The confirmation dialog shows the total count of similar issues

This approach balances being helpful without being overly restrictive, allowing users to make informed decisions about whether to create a duplicate issue or reference an existing one.

## Challenges and Confusions

### Challenges Encountered

1. **Firebase Timestamp Handling**: 
   - Initially struggled with converting Firestore Timestamps to JavaScript Date objects for display
   - Solution: Used the `.toDate()` method when available, with fallback for different timestamp formats

2. **Real-time Similar Issue Detection**:
   - Implementing efficient similarity checking without making too many database calls
   - Solution: Debounced the check to only run after user stops typing for a moment, and optimized the matching algorithm

3. **Status Transition Validation**:
   - Ensuring the UI properly prevents invalid transitions while maintaining good UX
   - Solution: Added client-side validation with clear error messages

4. **Next.js App Router Client Components**:
   - Understanding when to use 'use client' directive and managing state in server vs client components
   - Solution: Used 'use client' for all interactive components that need browser APIs

### What Was Confusing

1. **Firebase Environment Variables**: 
   - Initially unclear about which variables needed the `NEXT_PUBLIC_` prefix for client-side access
   - Learned that all Firebase config variables need this prefix since they're used in client components

2. **Firestore Query Ordering**:
   - Understanding how to properly order by timestamp fields
   - Required ensuring the field is properly indexed in Firestore

## Future Improvements

If I were to continue developing this project, here are the improvements I would prioritize:

1. **Real-time Updates**: 
   - Implement Firestore real-time listeners to automatically update the issue list when changes occur
   - This would eliminate the need for manual refresh

2. **Issue Details Page**:
   - Create a dedicated page for viewing and editing individual issues
   - Add comment/activity log functionality

3. **Advanced Similarity Detection**:
   - Implement more sophisticated algorithms (e.g., Levenshtein distance, semantic similarity)
   - Use machine learning for better duplicate detection

4. **User Management**:
   - Add user profiles and avatars
   - Implement user roles and permissions
   - Add ability to mention users in issues

5. **Search Functionality**:
   - Full-text search across titles and descriptions
   - Search by assignee or creator

6. **Bulk Operations**:
   - Allow selecting multiple issues for bulk status/priority changes
   - Export issues to CSV/JSON

7. **Notifications**:
   - Email notifications for assigned issues
   - In-app notifications for status changes

8. **Analytics Dashboard**:
   - Charts showing issue distribution by status/priority
   - Time-to-resolution metrics
   - User activity statistics

9. **Better Mobile Experience**:
   - Optimize forms and layouts for mobile devices
   - Add swipe gestures for status changes

10. **Testing**:
    - Add unit tests for utility functions
    - Integration tests for critical user flows
    - E2E tests for main features

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project created
- Firebase Authentication enabled (Email/Password)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd issue-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase configuration values:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. Add Environment Variables:
   - In the Vercel project settings, add all the Firebase environment variables
   - Use the same variable names as in `.env.local`

4. Deploy:
   - Vercel will automatically deploy on every push to main branch
   - Or click "Deploy" to deploy immediately

The application will be available at your Vercel URL (e.g., `your-project.vercel.app`)

## Project Structure

```
├── app/
│   ├── create-issue/    # Issue creation page
│   ├── issues/          # Issues list page
│   ├── login/           # Authentication page
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   └── globals.css      # Global styles
├── lib/
│   ├── firebase.ts      # Firebase configuration
│   └── types.ts         # TypeScript type definitions
├── public/              # Static assets
└── ...config files
```

## License

This project is open source and available under the MIT License.

