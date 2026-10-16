export type Role = "Admin" | "Manager" | "Collaborator" | "Client"
export type ProjectStatus = "In Progress" | "Closed" | "Archived"
export type Priority = "High" | "Medium" | "Low"
export type TaskStatus = "To Do" | "In Progress" | "Review" | "Done"
export type TestStatus = "Passed" | "Failed" | "Pending"
export type AmendmentStatus = "Draft" | "Pending Approval" | "Approved"
export type AmendmentType = "Scope" | "Schedule" | "Budget"
export type NoteCategory = "Technical" | "Site Visit" | "Decision" | "Client"

export const TASK_STATUSES: TaskStatus[] = ["To Do", "In Progress", "Review", "Done"]
export const PRIORITIES: Priority[] = ["High", "Medium", "Low"]
export const PROJECT_STATUSES: ProjectStatus[] = ["In Progress", "Closed", "Archived"]
export const NOTE_CATEGORIES: NoteCategory[] = ["Technical", "Site Visit", "Decision", "Client"]
export const AMENDMENT_TYPES: AmendmentType[] = ["Scope", "Schedule", "Budget"]
export const AMENDMENT_STATUSES: AmendmentStatus[] = ["Draft", "Pending Approval", "Approved"]

export interface Member {
  id: string
  name: string
  initials: string
  role: Role
  title: string
  company?: string
}

export interface Project {
  id: string
  code: string
  name: string
  client: string
  description: string
  status: ProjectStatus
  priority: Priority
  startDate: string
  endDate: string
  tags: string[]
  memberIds: string[]
  budget: number
}

export interface Task {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  priority: Priority
  assigneeId: string
  startDate: string
  dueDate: string
}

export interface TestCase {
  id: string
  projectId: string
  campaign: string
  name: string
  status: TestStatus
  priority: Priority
  assigneeId: string
  lastRun: string
}

export interface NoteComment {
  id: string
  authorId: string
  content: string
  createdAt: string
}

export interface Note {
  id: string
  projectId: string
  authorId: string
  category: NoteCategory
  content: string
  createdAt: string
  comments: NoteComment[]
}

export interface Amendment {
  id: string
  projectId: string
  ref: string
  title: string
  type: AmendmentType
  status: AmendmentStatus
  amount: number
  daysImpact: number
  requestedBy: string
  createdAt: string
}

export interface Meeting {
  id: string
  projectId: string
  title: string
  start: string
  durationMin: number
  location: string
  attendeeIds: string[]
}

export interface Milestone {
  id: string
  projectId: string
  title: string
  date: string
}
