'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, addDoc, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Issue, Priority, Status } from '@/lib/types';
import Link from 'next/link';

export default function CreateIssue() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [similarIssues, setSimilarIssues] = useState<Issue[]>([]);
  const [showSimilarWarning, setShowSimilarWarning] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium' as Priority,
    status: 'Open' as Status,
    assignedTo: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const checkSimilarIssues = async (title: string, description: string) => {
    if (!title.trim()) return [];

    const issuesRef = collection(db, 'issues');
    const q = query(issuesRef);
    const querySnapshot = await getDocs(q);
    
    const similar: Issue[] = [];
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    querySnapshot.forEach((doc) => {
      const issue = { id: doc.id, ...doc.data() } as Issue;
      const issueTitleLower = issue.title.toLowerCase();
      const issueDescLower = issue.description.toLowerCase();

      // Check for similar title (contains similar words or exact match)
      const titleWords = titleLower.split(/\s+/);
      const issueTitleWords = issueTitleLower.split(/\s+/);
      const commonWords = titleWords.filter(word => 
        word.length > 3 && issueTitleWords.includes(word)
      );

      if (
        issueTitleLower.includes(titleLower) ||
        titleLower.includes(issueTitleLower) ||
        commonWords.length >= 2 ||
        (descLower && issueDescLower && (
          issueDescLower.includes(descLower) ||
          descLower.includes(issueDescLower)
        ))
      ) {
        similar.push(issue);
      }
    });

    return similar;
  };

  const handleTitleChange = async (value: string) => {
    setFormData({ ...formData, title: value });
    await checkForSimilarIssues(value, formData.description);
  };

  const handleDescriptionChange = async (value: string) => {
    setFormData({ ...formData, description: value });
    await checkForSimilarIssues(formData.title, value);
  };

  const checkForSimilarIssues = async (title: string, description: string) => {
    if (title.trim().length > 5 || description.trim().length > 10) {
      const similar = await checkSimilarIssues(title, description);
      if (similar.length > 0) {
        setSimilarIssues(similar);
        setShowSimilarWarning(true);
      } else {
        setSimilarIssues([]);
        setShowSimilarWarning(false);
      }
    } else {
      setSimilarIssues([]);
      setShowSimilarWarning(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showSimilarWarning && similarIssues.length > 0) {
      const confirmed = window.confirm(
        `Found ${similarIssues.length} similar issue(s). Do you still want to create this issue?`
      );
      if (!confirmed) return;
    }

    setSubmitting(true);

    try {
      const newIssue: Omit<Issue, 'id'> = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo,
        createdTime: Timestamp.now(),
        createdBy: user?.email || '',
      };

      await addDoc(collection(db, 'issues'), newIssue);
      router.push('/issues');
    } catch (error) {
      console.error('Error creating issue:', error);
      alert('Failed to create issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Issue Tracker
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{user.email}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Issue</h1>

          {showSimilarWarning && similarIssues.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                    Similar issues found ({similarIssues.length})
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {similarIssues.slice(0, 3).map((issue) => (
                      <li key={issue.id}>
                        • {issue.title} ({issue.status})
                      </li>
                    ))}
                    {similarIssues.length > 3 && (
                      <li className="text-yellow-600">... and {similarIssues.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter issue title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Describe the issue in detail"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <input
                id="assignedTo"
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Email or name"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Issue'}
              </button>
              <Link
                href="/issues"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

