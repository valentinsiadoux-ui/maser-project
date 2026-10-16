"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import {
  AMENDMENTS,
  CURRENT_USER_BY_ROLE,
  MEETINGS,
  MEMBERS,
  MILESTONES,
  NOTES,
  PROJECTS,
  TASKS,
  TESTS,
} from "./seed"
import type {
  Amendment,
  AmendmentStatus,
  Meeting,
  Member,
  Milestone,
  Note,
  Project,
  Role,
  Task,
  TaskStatus,
  TestCase,
} from "./types"

interface StoreValue {
  role: Role
  setRole: (role: Role) => void
  currentUser: Member
  members: Member[]
  projects: Project[]
  tasks: Task[]
  tests: TestCase[]
  notes: Note[]
  amendments: Amendment[]
  meetings: Meeting[]
  milestones: Milestone[]
  getMember: (id: string) => Member | undefined
  getProject: (id: string) => Project | undefined
  getProgress: (projectId: string) => number
  addProject: (p: Omit<Project, "id" | "code">) => Project
  addTask: (t: Omit<Task, "id">) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  addNote: (n: Omit<Note, "id" | "createdAt" | "comments" | "authorId">) => void
  updateNote: (id: string, content: string) => void
  deleteNote: (id: string) => void
  addComment: (noteId: string, content: string) => void
  addAmendment: (a: Omit<Amendment, "id" | "ref" | "createdAt" | "requestedBy" | "status">) => void
  updateAmendmentStatus: (id: string, status: AmendmentStatus) => void
  addMeeting: (m: Omit<Meeting, "id">) => void
}

const StoreContext = createContext<StoreValue | null>(null)

const uid = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 9)}`

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("Manager")
  const [projects, setProjects] = useState(PROJECTS)
  const [tasks, setTasks] = useState(TASKS)
  const [notes, setNotes] = useState(NOTES)
  const [amendments, setAmendments] = useState(AMENDMENTS)
  const [meetings, setMeetings] = useState(MEETINGS)

  const currentUser = MEMBERS.find((m) => m.id === CURRENT_USER_BY_ROLE[role])!

  const getMember = useCallback((id: string) => MEMBERS.find((m) => m.id === id), [])
  const getProject = useCallback((id: string) => projects.find((p) => p.id === id), [projects])

  const getProgress = useCallback(
    (projectId: string) => {
      const list = tasks.filter((t) => t.projectId === projectId)
      if (list.length === 0) return 0
      const score = list.reduce(
        (acc, t) => acc + (t.status === "Done" ? 1 : t.status === "Review" ? 0.75 : t.status === "In Progress" ? 0.4 : 0),
        0,
      )
      return Math.round((score / list.length) * 100)
    },
    [tasks],
  )

  const addProject = useCallback(
    (p: Omit<Project, "id" | "code">) => {
      const project: Project = {
        ...p,
        id: uid("p"),
        code: `MSR-25${String(projects.length + 1).padStart(2, "0")}`,
      }
      setProjects((prev) => [project, ...prev])
      return project
    },
    [projects.length],
  )

  const addTask = useCallback((t: Omit<Task, "id">) => {
    setTasks((prev) => [...prev, { ...t, id: uid("t") }])
  }, [])

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }, [])

  const addNote = useCallback(
    (n: Omit<Note, "id" | "createdAt" | "comments" | "authorId">) => {
      setNotes((prev) => [
        { ...n, id: uid("n"), authorId: currentUser.id, createdAt: new Date().toISOString(), comments: [] },
        ...prev,
      ])
    },
    [currentUser.id],
  )

  const updateNote = useCallback((id: string, content: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content } : n)))
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addComment = useCallback(
    (noteId: string, content: string) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                comments: [
                  ...n.comments,
                  { id: uid("c"), authorId: currentUser.id, content, createdAt: new Date().toISOString() },
                ],
              }
            : n,
        ),
      )
    },
    [currentUser.id],
  )

  const addAmendment = useCallback(
    (a: Omit<Amendment, "id" | "ref" | "createdAt" | "requestedBy" | "status">) => {
      setAmendments((prev) => {
        const count = prev.filter((x) => x.projectId === a.projectId).length + 1
        return [
          ...prev,
          {
            ...a,
            id: uid("a"),
            ref: `AV-${String(count).padStart(3, "0")}`,
            status: "Draft",
            requestedBy: currentUser.id,
            createdAt: new Date().toISOString().slice(0, 10),
          },
        ]
      })
    },
    [currentUser.id],
  )

  const updateAmendmentStatus = useCallback((id: string, status: AmendmentStatus) => {
    setAmendments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }, [])

  const addMeeting = useCallback((m: Omit<Meeting, "id">) => {
    setMeetings((prev) => [...prev, { ...m, id: uid("m") }])
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      role,
      setRole,
      currentUser,
      members: MEMBERS,
      projects,
      tasks,
      tests: TESTS,
      notes,
      amendments,
      meetings,
      milestones: MILESTONES,
      getMember,
      getProject,
      getProgress,
      addProject,
      addTask,
      updateTaskStatus,
      addNote,
      updateNote,
      deleteNote,
      addComment,
      addAmendment,
      updateAmendmentStatus,
      addMeeting,
    }),
    [
      role,
      currentUser,
      projects,
      tasks,
      notes,
      amendments,
      meetings,
      getMember,
      getProject,
      getProgress,
      addProject,
      addTask,
      updateTaskStatus,
      addNote,
      updateNote,
      deleteNote,
      addComment,
      addAmendment,
      updateAmendmentStatus,
      addMeeting,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
