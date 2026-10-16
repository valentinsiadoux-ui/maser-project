"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageSquare, Pencil, Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { SelectField, toOptions } from "@/components/dialogs/form-fields"
import { MemberAvatar } from "@/components/shared/member-avatar"
import { formatDateTime } from "@/lib/format"
import { useStore } from "@/lib/store"
import { NOTE_CATEGORIES, type Note, type NoteCategory } from "@/lib/types"
import { cn } from "@/lib/utils"

const categoryTone: Record<NoteCategory, string> = {
  Technical: "bg-primary/10 text-primary",
  "Site Visit": "bg-success/12 text-success",
  Decision: "bg-warning/20 text-warning-foreground",
  Client: "bg-chart-5/15 text-chart-5",
}

const isSubmitKey = (e: React.KeyboardEvent) =>
  e.key === "Enter" && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing && e.keyCode !== 229

export function NotesModule({ projectId, clientView = false }: { projectId?: string; clientView?: boolean }) {
  const { notes, projects, addNote } = useStore()
  const [filter, setFilter] = useState<"All" | NoteCategory>("All")
  const [project, setProject] = useState(projectId ?? projects[0]?.id ?? "")
  const [category, setCategory] = useState<NoteCategory>(clientView ? "Client" : "Technical")
  const [draft, setDraft] = useState("")

  const visible = notes
    .filter((n) => (projectId ? n.projectId === projectId : true))
    .filter((n) => (clientView ? n.category === "Client" : filter === "All" || n.category === filter))

  const submit = () => {
    if (!draft.trim()) return
    addNote({ projectId: projectId ?? project, category, content: draft.trim() })
    setDraft("")
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Card className="gap-3 p-4">
          <label htmlFor="new-note" className="text-sm font-medium">
            {clientView ? "Leave a message for the project team" : "Add a note"}
          </label>
          <Textarea
            id="new-note"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => isSubmitKey(e) && submit()}
            placeholder={clientView ? "Questions, site access updates, feedback..." : "Technical observation, site visit report, decision..."}
          />
          <div className="flex flex-wrap items-center gap-2">
            {!projectId && (
              <SelectField
                value={project}
                onChange={setProject}
                ariaLabel="Note project"
                className="w-auto min-w-44"
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
              />
            )}
            {!clientView && (
              <SelectField
                value={category}
                onChange={(v) => setCategory(v as NoteCategory)}
                ariaLabel="Note category"
                className="w-auto min-w-32"
                options={toOptions(NOTE_CATEGORIES)}
              />
            )}
            <span className="hidden text-xs text-muted-foreground sm:inline">⌘ + Enter to post</span>
            <Button className="ml-auto" onClick={submit} disabled={!draft.trim()}>
              <Send />
              Post note
            </Button>
          </div>
        </Card>

        <ol className="flex flex-col gap-3">
          {visible.map((n) => (
            <li key={n.id}>
              <NoteCard note={n} showProject={!projectId} />
            </li>
          ))}
        </ol>
        {visible.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No notes yet.</p>}
      </div>

      {!clientView && (
        <aside className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
          <Card className="gap-2 p-4">
            <h3 className="text-sm font-semibold">Categories</h3>
            <ul className="flex flex-col gap-0.5">
              {(["All", ...NOTE_CATEGORIES] as const).map((c) => {
                const count = notes.filter((n) => (!projectId || n.projectId === projectId) && (c === "All" || n.category === c)).length
                return (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => setFilter(c)}
                      aria-pressed={filter === c}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm hover:bg-muted",
                        filter === c && "bg-muted font-medium",
                      )}
                    >
                      {c}
                      <span className="font-mono text-xs text-muted-foreground">{count}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>
        </aside>
      )}
    </div>
  )
}

function NoteCard({ note, showProject }: { note: Note; showProject: boolean }) {
  const { getMember, getProject, currentUser, role, updateNote, deleteNote, addComment } = useStore()
  const author = getMember(note.authorId)
  const project = getProject(note.projectId)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content)
  const [showComments, setShowComments] = useState(note.comments.length > 0)
  const [comment, setComment] = useState("")
  const canEdit = note.authorId === currentUser.id || role === "Admin"

  const postComment = () => {
    if (!comment.trim()) return
    addComment(note.id, comment.trim())
    setComment("")
  }

  return (
    <Card className="gap-3 p-4">
      <div className="flex items-start gap-3">
        <MemberAvatar member={author} size="default" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium">{author?.name}</span>
            {author?.role === "Client" && <span className="text-xs text-muted-foreground">({author.company})</span>}
            <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", categoryTone[note.category])}>{note.category}</span>
            <time className="text-xs text-muted-foreground" dateTime={note.createdAt}>
              {formatDateTime(note.createdAt)}
            </time>
          </div>
          {showProject && project && (
            <Link href={`/projects/${project.id}?tab=notes`} className="font-mono text-[11px] text-muted-foreground hover:text-primary">
              {project.code} · {project.name}
            </Link>
          )}
        </div>
        {canEdit && !editing && (
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon-sm" aria-label="Edit note" onClick={() => setEditing(true)}>
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Delete note" onClick={() => deleteNote(note.id)}>
              <Trash2 />
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 pl-11">
          <Textarea aria-label="Edit note content" rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setContent(note.content)
                setEditing(false)
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!content.trim()}
              onClick={() => {
                updateNote(note.id, content.trim())
                setEditing(false)
              }}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="pl-11 text-sm leading-relaxed text-pretty">{note.content}</p>
      )}

      <div className="pl-11">
        <Button variant="ghost" size="xs" className="-ml-2 text-muted-foreground" onClick={() => setShowComments((s) => !s)} aria-expanded={showComments}>
          <MessageSquare />
          {note.comments.length > 0 ? `${note.comments.length} comment${note.comments.length > 1 ? "s" : ""}` : "Comment"}
        </Button>
        {showComments && (
          <div className="mt-2 flex flex-col gap-3 border-l-2 pl-4">
            {note.comments.map((c) => {
              const a = getMember(c.authorId)
              return (
                <div key={c.id} className="flex gap-2.5">
                  <MemberAvatar member={a} />
                  <div className="min-w-0">
                    <p className="text-xs">
                      <span className="font-medium">{a?.name}</span>{" "}
                      <span className="text-muted-foreground">{formatDateTime(c.createdAt)}</span>
                    </p>
                    <p className="text-sm">{c.content}</p>
                  </div>
                </div>
              )
            })}
            <div className="flex items-start gap-2">
              <Textarea
                aria-label="Write a comment"
                rows={1}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                    e.preventDefault()
                    postComment()
                  }
                }}
                placeholder="Write a comment..."
                className="min-h-8 py-1.5"
              />
              <Button size="icon" aria-label="Post comment" onClick={postComment} disabled={!comment.trim()}>
                <Send />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
