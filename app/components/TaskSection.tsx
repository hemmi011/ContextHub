"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Task = {
  id: string
  title: string
  status: string
  assignee_id: string | null
  deadline: string | null
  role: string
}

type User = {
  id: string
  name: string
  role: string
}

type Props = {
  projectId: string
  role: "director" | "designer" | "coder"
  currentUser: User
}


export default function TaskSection({ projectId, role, currentUser }: Props) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const canEdit = currentUser.role === role || currentUser.role === "pm" || currentUser.role === "director"

  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [projectId, role])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .eq("role", role)
      .order("created_at", { ascending: true })
    setTasks(data || [])
    setLoading(false)
  }

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("id, name, role")
    setUsers(data || [])
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return
    await supabase.from("tasks").insert([{
      project_id: projectId,
      title: newTaskTitle,
      status: "未着手",
      role: role,
    }])
    setNewTaskTitle("")
    fetchTasks()
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    await supabase.from("tasks").update(updates).eq("id", taskId)
    fetchTasks()
  }

  const saveTitle = async (taskId: string) => {
    if (!editingTitle.trim()) return
    await updateTask(taskId, { title: editingTitle })
    setEditingId(null)
  }

  const deleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId)
    fetchTasks()
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    "未着手": { bg: "#f3f4f6", text: "#6b7280" },
    "進行中": { bg: "#eef2ff", text: "#4f46e5" },
    "完了":   { bg: "#ecfdf5", text: "#059669" },
  }

  if (loading) return <p style={{ fontSize: 14, color: "#9ca3af" }}>読み込み中...</p>

  return (
    <div>
      {/* タスク追加 */}
      {canEdit && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
            placeholder="タスクを追加"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault()
                addTask()
                }
            }}
            style={{
                flex: 1, padding: "8px 12px", borderRadius: 8,
                border: "1px solid #e5e7eb", fontSize: 13, outline: "none",
            }}
            />
            <button
            onClick={addTask}
            style={{
                padding: "8px 14px", backgroundColor: "#6366f1", color: "#fff",
                border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer",
            }}
            >
            追加
            </button>
        </div>
        )}

      {/* タスク一覧 */}
      {tasks.length === 0 ? (
        <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "16px 0" }}>
          タスクがありません
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              {/* 1行目：タイトル・ステータス・削除 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                {editingId === task.id ? (
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => saveTitle(task.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveTitle(task.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    autoFocus
                    style={{
                      flex: 1, padding: "4px 8px", borderRadius: 6,
                      border: "1px solid #6366f1", fontSize: 13, outline: "none", marginRight: 8,
                    }}
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                    <p style={{ fontSize: 13, color: "#111827", margin: 0, fontWeight: 500 }}>
                        {task.title}
                    </p>
                    {canEdit && (
                        <button
                            onClick={() => { setEditingId(task.id); setEditingTitle(task.title) }}
                            style={{
                            padding: "2px 6px", backgroundColor: "transparent", color: "#9ca3af",
                            border: "1px solid #e5e7eb", borderRadius: 4, fontSize: 10, cursor: "pointer",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "#6366f1"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                        >
                            編集
                        </button>
                        )}
                    </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <select
                    value={task.status}
                    onChange={(e) => updateTask(task.id, { status: e.target.value })}
                    style={{
                      padding: "3px 6px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 500,
                      backgroundColor: statusColors[task.status]?.bg || "#f3f4f6",
                      color: statusColors[task.status]?.text || "#6b7280",
                      cursor: "pointer", outline: "none",
                    }}
                  >
                    <option value="未着手">未着手</option>
                    <option value="進行中">進行中</option>
                    <option value="完了">完了</option>
                  </select>
                  {canEdit && (
                    <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                        padding: "2px 5px", backgroundColor: "transparent", color: "#d1d5db",
                        border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#e11d48"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#d1d5db"}
                    >
                        ✕
                    </button>
                    )}
                </div>
              </div>

              {/* 2行目：担当者・期限 */}
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={task.assignee_id || ""}
                  onChange={(e) => updateTask(task.id, { assignee_id: e.target.value || null })}
                  style={{
                    flex: 1, padding: "4px 8px", borderRadius: 6,
                    border: "1px solid #e5e7eb", fontSize: 11, outline: "none",
                    backgroundColor: "#f8fafc", color: "#6b7280",
                  }}
                >
                  <option value="">担当者未設定</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={task.deadline || ""}
                  onChange={(e) => updateTask(task.id, { deadline: e.target.value || null })}
                  style={{
                    flex: 1, padding: "4px 8px", borderRadius: 6,
                    border: "1px solid #e5e7eb", fontSize: 11, outline: "none",
                    backgroundColor: "#f8fafc",
                    color: task.deadline && new Date(task.deadline) < new Date() && task.status !== "完了" ? "#e11d48" : "#6b7280",
                    boxSizing: "border-box" as const,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}