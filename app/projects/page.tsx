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

type TabType = "進行中" | "完了"

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("進行中")

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push("/login")
        return
      }
      await fetchProjects()
      setLoading(false)
    }
    init()
  }, [])

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("id, name, client_name, status, end_date")
      .order("created_at", { ascending: false })
    setProjects(data || [])
  }

  const filtered = projects
    .filter((p) => p.status === activeTab)
    .filter((p) =>
      p.name.includes(search) || p.client_name?.includes(search)
    )

  const activeCount = projects.filter((p) => p.status === "進行中").length
  const doneCount = projects.filter((p) => p.status === "完了").length

  if (loading) return <p style={{ padding: 40 }}>読み込み中...</p>

  return (
    <div style={{ padding: 40, fontFamily: "'DM Sans', sans-serif", maxWidth: 900 }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>案件一覧</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>{filtered.length} 件</p>
        </div>
        <button
          onClick={() => router.push("/projects/new")}
          style={{
            padding: "10px 20px", backgroundColor: "#6366f1", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}
        >
          + 新規案件
        </button>
      </div>

      {/* タブ */}
      <div style={{ borderBottom: "1px solid #e5e7eb", display: "flex", marginBottom: 24 }}>
        {([
          { key: "進行中", count: activeCount },
          { key: "完了", count: doneCount },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px", fontSize: 13,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? "#4f46e5" : "#6b7280",
              borderTop: "none", borderLeft: "none", borderRight: "none",
              borderBottom: activeTab === tab.key ? "2px solid #4f46e5" : "2px solid transparent",
              background: "none", cursor: "pointer", outline: "none",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {tab.key}
            <span style={{
              fontSize: 11, padding: "1px 6px", borderRadius: 10,
              backgroundColor: activeTab === tab.key ? "#eef2ff" : "#f3f4f6",
              color: activeTab === tab.key ? "#4f46e5" : "#9ca3af",
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 検索 */}
      <div style={{ marginBottom: 24 }}>
        <input
          placeholder="案件名・会社名で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 12px", borderRadius: 8,
            border: "1px solid #e5e7eb", fontSize: 14,
            width: 280, outline: "none",
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
          <p style={{ fontSize: 14 }}>案件がありません</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  backgroundColor: "#ffffff", border: "1px solid #e5e7eb",
                  borderRadius: 12, padding: "18px 22px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "border-color 0.15s", cursor: "pointer",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#6366f1"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>{project.name}</p>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{project.client_name}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {project.end_date && (
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                      {new Date(project.end_date).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                  <span style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 500,
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
  )
}