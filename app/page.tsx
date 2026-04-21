"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

type Project = {
  id: string
  name: string
  client_name: string
  status: string
  end_date: string | null
}

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projectStats, setProjectStats] = useState({ active: 0, done: 0 })
  const [taskStats, setTaskStats] = useState({ todo: 0, inProgress: 0 })
  const [userName, setUserName] = useState("")
  const [recentProjects, setRecentProjects] = useState<Project[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push("/login")
        return
      }

      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, client_name, status, end_date")
        .order("created_at", { ascending: false })

      if (projects) {
        setProjectStats({
          active: projects.filter((p) => p.status === "進行中").length,
          done: projects.filter((p) => p.status === "完了").length,
        })
        setRecentProjects(projects.slice(0, 5))
      }

      const { data: tasks } = await supabase.from("tasks").select("status")
      if (tasks) {
        setTaskStats({
          todo: tasks.filter((t) => t.status === "未着手").length,
          inProgress: tasks.filter((t) => t.status === "進行中").length,
        })
      }

      const { data: userProfile } = await supabase
        .from("users").select("name").eq("id", userData.user.id).single()
      if (userProfile) setUserName(userProfile.name)

      setLoading(false)
    }
    init()
  }, [])

  if (loading) return <p style={{ padding: 40 }}>読み込み中...</p>

  return (
    <div style={{ padding: 40, fontFamily: "'DM Sans', sans-serif", maxWidth: 1000 }}>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>
          {userName}さん、こんにちは
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>案件とタスクの概要</p>
      </div>

      {/* サマリーカード */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>

        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px", fontWeight: 500 }}>案件</p>
              <p style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 }}>{projectStats.active + projectStats.done} 件</p>
            </div>
            <Link href="/projects" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
              一覧へ →
            </Link>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, padding: "10px 14px", flex: 1 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px" }}>進行中</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#111827", margin: 0 }}>{projectStats.active}</p>
            </div>
            <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, padding: "10px 14px", flex: 1 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px" }}>完了</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#111827", margin: 0 }}>{projectStats.done}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px", fontWeight: 500 }}>タスク</p>
              <p style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 }}>{taskStats.todo + taskStats.inProgress} 件</p>
            </div>
            <Link href="/tasks" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
              一覧へ →
            </Link>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, padding: "10px 14px", flex: 1 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px" }}>未着手</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#111827", margin: 0 }}>{taskStats.todo}</p>
            </div>
            <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, padding: "10px 14px", flex: 1 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px" }}>進行中</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#111827", margin: 0 }}>{taskStats.inProgress}</p>
            </div>
          </div>
        </div>

      </div>

      {/* 直近の案件 */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>直近の案件</p>
          <Link href="/projects" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none" }}>
            すべて見る →
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
            <p style={{ fontSize: 14, margin: 0 }}>案件がありません</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
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
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 3px" }}>{project.name}</p>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{project.client_name}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {project.end_date && (
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                        {new Date(project.end_date).toLocaleDateString("ja-JP")}
                      </p>
                    )}
                    <span style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500,
                      backgroundColor: project.status === "進行中" ? "#eef2ff" : "#ecfdf5",
                      color: project.status === "進行中" ? "#4f46e5" : "#059669",
                    }}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}