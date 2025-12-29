# Issue Tracker

A production-ready Issue Tracking system built with Next.js, TypeScript, and Firebase.
The project intentionally prioritizes business logic, data integrity, and real-world constraints over heavy UI polish, aligning with the given time and scope requirements.

Why This Stack?
Next.js (App Router)

File-based routing simplifies navigation and protected routes

Client & Server Components provide a clean separation of concerns

TypeScript-first experience ensures type safety

Zero-config deployment on Vercel

Firebase Firestore

No backend boilerplate — direct client-side data access

Real-time updates using onSnapshot

Scales well for concurrent reads/writes

Security rules enforce access control at the database level

Firebase Authentication

Handles password security, sessions, and tokens

Simple Email/Password flow

Integrates cleanly with Firestore rules via request.auth

TypeScript

Prevents runtime errors

Improves maintainability

Acts as self-documenting code

## 📊 Firestore Schema

### Collection: `issues`

```typescript
{
  id: string;                    // Document ID (auto-generated)
  title: string;                  // Issue title (required)
  description: string;            // Detailed description (required)
  priority: 'Low' | 'Medium' | 'High';  // Priority level
  status: 'Open' | 'In Progress' | 'Done';  // Current status
  assignedTo: string;             // Assignee email (required)
  createdBy: string;              // Creator email (auto-populated)
  createdAt: Timestamp;           // Firestore timestamp (auto-populated)
}
```

### Indexes Required
- **Composite Index**: `createdAt` (descending) for default sorting
  - Collection: `issues`
  - Fields: `createdAt` (Descending)

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /issues/{issueId} {
      // All authenticated users can read all issues
      allow read: if request.auth != null;
      
      // All authenticated users can create issues
      allow create: if request.auth != null;
      
      // All authenticated users can update issues
      allow update: if request.auth != null;
      
      // Only the creator can delete their issues
      allow delete: if request.auth != null && 
                      resource.data.createdBy == request.auth.token.email;
    }
  }
}
```

## 🔍 Similar Issue Handling

The application implements a **client-side similarity detection algorithm** to prevent duplicate issues:

### Algorithm

1. **Title Normalization**: Convert both the new issue title and existing issue titles to lowercase
2. **Word Extraction**: Split titles into words, filtering out words shorter than 3 characters (removes common words like "the", "is", etc.)
3. **Similarity Matching**: Check if any significant words from the new title appear in existing titles (or vice versa)
4. **Threshold**: If any matching words are found, the issue is flagged as similar


## 🎨 Design Philosophy

**Note**: This project focused primarily on **business logic, data architecture, and core functionality** rather than extensive frontend polish. The UI is clean and functional, but the emphasis was on:

- ✅ Robust validation and business rules
- ✅ Efficient data handling and real-time updates
- ✅ Type-safe codebase with TypeScript
- ✅ Scalable data architecture
- ✅ Security best practices

The frontend serves as a clean interface to demonstrate and test the core logic, but the real value lies in the backend architecture and business rule implementation.

## 🛠️ Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Firebase**
   - Create Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Copy config to `.env.local`

3. **Run development server**
   ```bash
   npm run dev
   ```

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel

---

Built with focus on **logic over aesthetics** - prioritizing robust business rules and scalable architecture.
