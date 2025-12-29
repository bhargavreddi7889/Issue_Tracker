'use client';

import { useState } from 'react';
import { collection, addDoc, query, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Priority, Status, IssueFormData } from '@/lib/types';

interface IssueFormProps {
  onIssueCreated: () => void;
}

export default function IssueForm({ onIssueCreated }: IssueFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<IssueFormData>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    assignedTo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [similarIssues, setSimilarIssues] = useState<any[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const checkSimilarIssues = async (title: string) => {
    if (!title.trim()) return [];

    const issuesRef = collection(db, 'issues');
    const q = query(issuesRef);
    const snapshot = await getDocs(q);

    const similar: any[] = [];
    const titleLower = title.toLowerCase();

    snapshot.forEach((doc) => {
      const issue = doc.data();
      const issueTitleLower = issue.title.toLowerCase();
      const titleWords = titleLower.split(/\s+/).filter((w) => w.length > 3);
      const issueWords = issueTitleLower.split(/\s+/).filter((w) => w.length > 3);
      const commonWords = titleWords.filter((word) =>
        issueWords.some((iWord) => iWord.includes(word) || word.includes(iWord))
      );

      if (commonWords.length > 0) {
        similar.push({ id: doc.id, ...issue });
      }
    });

    return similar;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const similar = await checkSimilarIssues(formData.title);
    if (similar.length > 0 && !showConfirmation) {
      setSimilarIssues(similar);
      setShowConfirmation(true);
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'issues'), {
        ...formData,
        createdBy: user?.email || 'unknown',
        createdAt: Timestamp.now(),
      });

      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Open',
        assignedTo: '',
      });
      setSimilarIssues([]);
      setShowConfirmation(false);
      onIssueCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-8">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create Issue</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Add a new issue to track</p>
      </div>

      <div className="p-6">
        {showConfirmation && similarIssues.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-300">Similar Issues Found</h4>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  {similarIssues.length} similar issue{similarIssues.length > 1 ? 's' : ''} found. Continue anyway?
                </p>
                <div className="mt-3 space-y-2">
                  {similarIssues.slice(0, 2).map((issue) => (
                    <div key={issue.id} className="text-xs bg-white dark:bg-slate-800 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="font-medium text-slate-900 dark:text-white">{issue.title}</div>
                      <div className="text-slate-500 dark:text-slate-400">{issue.status}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => { setSimilarIssues([]); setShowConfirmation(false); }}
                    className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition disabled:bg-amber-400"
                  >
                    {loading ? 'Creating...' : 'Create Anyway'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              placeholder="Brief description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-sm"
              placeholder="Detailed description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Assigned To
            </label>
            <input
              type="email"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              placeholder="user@example.com"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating...</span>
              </>
            ) : (
              'Create Issue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
