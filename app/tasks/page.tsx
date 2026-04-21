"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

type Task = {
  id: string
  title: string
  status: string
  deadline: string | null
  role: string
  project_id: string
  assignee_id: string | null
  created_at: string
  projects: { name: string; client_name: string } | null
  users: { name: string } | null
}

type TabType = "all" | "mine" | "deadline"

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"created_at" | "deadline" | "project">("created_at")

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push("/login")
        return
      }
      setCurrentUserId(userData.user.id)

      const { data } = await supabase
        .from("tasks")
        .select("*, projects(name, client_name), users(name)")
        .order("created_at", { ascending: false })

      setTasks((data as any) || [])
      setLoading(false)
    }
    init()
  }, [])

  const filteredTasks = () => {
  let result = tasks

  // タブフィルター
  switch (activeTab) {
    case "mine":
      result = result.filter((t) => t.assignee_id === currentUserId)
      break
    case "deadline":
      const today = new Date()
      const weekLater = new Date()
      weekLater.setDate(today.getDate() + 7)
      result = result
        .filter((t) => t.deadline && t.status !== "完了")
        .filter((t) => new Date(t.deadline!) <= weekLater)
      break
  }

  // 検索フィルター
  if (search) {
    result = result.filter((t) =>
      t.title.includes(search) ||
      t.projects?.name.includes(search) ||
      t.projects?.client_name.includes(search)
    )
  }

  // 並べ替え
  result = [...result].sort((a, b) => {
    if (sortBy === "deadline") {
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }
    if (sortBy === "project") {
      return (a.projects?.name || "").localeCompare(b.projects?.name || "")
    }
    return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
  })

  return result
}

  const statusColors: Record<string, { bg: string; text: string }> = {
    "未着手": { bg: "#f3f4f6", text: "#6b7280" },
    "進行中": { bg: "#eef2ff", text: "#4f46e5" },
    "完了":   { bg: "#ecfdf5", text: "#059669" },
  }

  const roleLabels: Record<string, string> = {
    director: "ディレクター",
    designer: "デザイナー",
    coder: "コーダー",
  }

  const tabs = [
    { key: "all", label: "全タスク" },
    { key: "mine", label: "自分のタスク" },
    { key: "deadline", label: "期限が近い" },
  ] as const

  if (loading) return <p style={{ padding: 40 }}>読み込み中...</p>

  const displayed = filteredTasks()

  return (
    <div style={{ padding: 40, fontFamily: "'DM Sans', sans-serif", maxWidth: 900 }}>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>タスク管理</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>{displayed.length} 件</p>
      </div>

      {/* 検索・並べ替え */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <input
            placeholder="タスク名・案件名で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: 8,
              border: "1px solid #e5e7eb", fontSize: 14, outline: "none",
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: "10px 12px", borderRadius: 8,
              border: "1px solid #e5e7eb", fontSize: 14, outline: "none",
            }}
          >
            <option value="created_at">作成日順</option>
            <option value="deadline">期限順</option>
            <option value="project">案件順</option>
          </select>
        </div>


      {/* タブ */}
      <div style={{ borderBottom: "1px solid #e5e7eb", display: "flex", marginBottom: 24 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? "#4f46e5" : "#6b7280",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom: activeTab === tab.key ? "2px solid #4f46e5" : "2px solid transparent",
              background: "none",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* タスク一覧 */}
      {displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
          <p style={{ fontSize: 14, margin: 0 }}>タスクがありません</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {displayed.map((task) => (
            <Link
              key={task.id}
              href={`/projects/${task.project_id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#6366f1"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 6px" }}>{task.title}</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{task.projects?.name}</p>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>·</span>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{roleLabels[task.role] || task.role}</p>
                    {task.assignee_id && (
                      <>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>·</span>
                        <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                          {(task as any).users?.name || "不明"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {task.deadline && (
                    <p style={{
                      fontSize: 12,
                      color: new Date(task.deadline) < new Date() && task.status !== "完了" ? "#e11d48" : "#9ca3af",
                      margin: 0,
                      fontWeight: new Date(task.deadline) < new Date() && task.status !== "完了" ? 600 : 400,
                    }}>
                      {new Date(task.deadline).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                  <span style={{
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontWeight: 500,
                    backgroundColor: statusColors[task.status]?.bg || "#f3f4f6",
                    color: statusColors[task.status]?.text || "#6b7280",
                  }}>
                    {task.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}