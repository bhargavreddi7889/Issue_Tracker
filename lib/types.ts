import { Timestamp } from 'firebase/firestore';

export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Open' | 'In Progress' | 'Done';

export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface IssueFormData {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo: string;
}

