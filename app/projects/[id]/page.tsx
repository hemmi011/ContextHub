"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import TaskSection from "@/app/components/TaskSection"
import DecisionSection from "@/app/components/DecisionSection"

type Project = {
  id: string
  name: string
  client_name: string
  status: string
  budget: number | null
  start_date: string | null
  end_date: string | null
  requirements: string | null
  created_by: string
}

type User = {
  id: string
  name: string
  role: string
}

type Task = {
  id: string
  status: string
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"director" | "designer" | "coder">("director")
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ 
    name: "", 
    client_name: "", 
    status: "", 
    requirements: "" ,
    budget: "",
  })

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push("/login"); return }

      const { data: userProfile } = await supabase.from("users").select("*").eq("id", userData.user.id).single()
      setCurrentUser(userProfile)

      const { data: projectData } = await supabase.from("projects").select("*").eq("id", id).single()
      setProject(projectData)
      if (projectData) {
        setEditForm({
          name: projectData.name,
          client_name: projectData.client_name || "",
          status: projectData.status,
          requirements: projectData.requirements || "",
          budget: projectData.budget ? String(projectData.budget),
        })
      }

      const { data: taskData } = await supabase.from("tasks").select("id, status").eq("project_id", id)
      setTasks(taskData || [])

      setLoading(false)
    }
    init()
  }, [id])

      const handleSave = async () => {
      await supabase.from("projects").update({
        ...editForm,
        budget: editForm.budget ? Number(editForm.budget) : null,
      }).eq("id", id)
      setProject((p) => p ? {
        ...p,
        ...editForm,
        budget: editForm.budget ? Number(editForm.budget) : null,
      } : p)
      setEditing(false)
    }

  if (loading) return <p style={{ padding: 40 }}>読み込み中...</p>
  if (!project) return <p style={{ padding: 40 }}>案件が見つかりません</p>

  const tabs = [
    { key: "director", label: "ディレクター" },
    { key: "designer", label: "デザイナー" },
    { key: "coder", label: "コーダー" },
  ] as const

  const isDirectorOrPM = currentUser?.role === "director" || currentUser?.role === "pm"
  const completedTasks = tasks.filter((t) => t.status === "完了").length
  const progressRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div style={{ padding: 40, fontFamily: "'DM Sans', sans-serif" }}>

      <button
        onClick={() => router.push("/projects")}
        style={{ fontSize: 13, color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 24 }}
      >
        ← 案件一覧
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>

        {/* 左側メイン */}
        <div>
          {/* ヘッダー */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>{project.name}</h1>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>{project.client_name}</p>
            </div>
            <span style={{
              fontSize: 12, padding: "5px 12px", borderRadius: 20, fontWeight: 500,
              backgroundColor: project.status === "進行中" ? "#eef2ff" : "#ecfdf5",
              color: project.status === "進行中" ? "#4f46e5" : "#059669",
            }}>
              {project.status}
            </span>
          </div>

          {/* 基本情報 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
            {project.start_date && (
              <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, padding: "12px 14px" }}>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px" }}>開始日</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", margin: 0 }}>{new Date(project.start_date).toLocaleDateString("ja-JP")}</p>
              </div>
            )}
            {project.end_date && (
              <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, padding: "12px 14px" }}>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px" }}>終了日</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", margin: 0 }}>{new Date(project.end_date).toLocaleDateString("ja-JP")}</p>
              </div>
            )}
            {isDirectorOrPM && project.budget && (
              <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, padding: "12px 14px" }}>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px" }}>金額</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", margin: 0 }}>¥{Number(project.budget).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* 要件メモ */}
          {project.requirements && (
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 8px" }}>要件メモ</p>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>{project.requirements}</p>
            </div>
          )}

          {/* タブ */}
          <div style={{ borderBottom: "1px solid #e5e7eb", display: "flex", marginBottom: 24 }}>
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: "10px 20px", fontSize: 13,
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? "#4f46e5" : "#6b7280",
                borderTop: "none", borderLeft: "none", borderRight: "none",
                borderBottom: activeTab === tab.key ? "2px solid #4f46e5" : "2px solid transparent",
                background: "none", cursor: "pointer", outline: "none",
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* タブの中身 */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: 12, padding: 24 }}>
            {currentUser && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af", letterSpacing: "0.06em", margin: "0 0 12px", textTransform: "uppercase" }}>タスク</p>
                  <TaskSection projectId={id as string} role={activeTab} currentUser={currentUser} />
                </div>
                <div>
                  <DecisionSection projectId={id as string} role={activeTab} currentUser={currentUser} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右側サイドバー */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* 進捗サマリー */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af", margin: "0 0 16px", letterSpacing: "0.06em" }}>進捗</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{completedTasks} / {tasks.length} タスク完了</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#111827", margin: 0 }}>{progressRate}%</p>
            </div>
            <div style={{ backgroundColor: "#f3f4f6", borderRadius: 100, height: 8, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${progressRate}%`,
                backgroundColor: progressRate === 100 ? "#059669" : "#6366f1",
                borderRadius: 100,
                transition: "width 0.3s",
              }} />
            </div>
          </div>

          {/* 編集フォーム */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af", margin: 0, letterSpacing: "0.06em" }}>案件情報</p>
              {isDirectorOrPM && (
                <button
                    onClick={() => editing ? handleSave() : setEditing(true)}
                    style={{
                    fontSize: 12, padding: "4px 10px", borderRadius: 6,
                    backgroundColor: editing ? "#6366f1" : "transparent",
                    color: editing ? "#fff" : "#6366f1",
                    border: editing ? "none" : "1px solid #6366f1",
                    cursor: "pointer",
                    }}
                >
                    {editing ? "保存" : "編集"}
                </button>
                )}
            </div>

            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="案件名" style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, outline: "none" }} />
                <input value={editForm.client_name} onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                  placeholder="会社名" style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, outline: "none" }} />
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, outline: "none" }}>
                  <option value="進行中">進行中</option>
                  <option value="完了">完了</option>
                </select>
                <textarea value={editForm.requirements} onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
                  placeholder="要件メモ" rows={3}
                  
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                  <input
                      value={editForm.budget}
                      onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                      placeholder="金額"
                      type="number"
                      style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, outline: "none" }}
                    />
                <button onClick={() => setEditing(false)}
                  style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>
                  キャンセル
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                
                {[
                  { label: "案件名", value: project.name },
                  { label: "会社名", value: project.client_name },
                  { label: "ステータス", value: project.status },
                  { label: "金額", value: project.budget },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 2px" }}>{item.label}</p>
                    <p style={{ fontSize: 13, color: "#111827", margin: 0, fontWeight: 500 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          
          
            {/* 案件操作 */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginTop:10 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af", margin: "0 0 12px", letterSpacing: "0.06em" }}>操作</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                    {project.status === "進行中" && (
                    <button
                        onClick={async () => {
                        await supabase.from("projects").update({ status: "完了" }).eq("id", id)
                        setProject((p) => p ? { ...p, status: "完了" } : p)
                        }}
                        style={{
                        padding: "10px 0", backgroundColor: "#ecfdf5", color: "#059669",
                        border: "1px solid #a7f3d0", borderRadius: 8, fontSize: 13,
                        fontWeight: 600, cursor: "pointer", width: "100%",
                        }}
                    >
                        ✓ 完了にする
                    </button>
                    )}

                    {project.status === "完了" && (
                    <button
                        onClick={async () => {
                        await supabase.from("projects").update({ status: "進行中" }).eq("id", id)
                        setProject((p) => p ? { ...p, status: "進行中" } : p)
                        }}
                        style={{
                        padding: "10px 0", backgroundColor: "#eef2ff", color: "#4f46e5",
                        border: "1px solid #c7d2fe", borderRadius: 8, fontSize: 13,
                        fontWeight: 600, cursor: "pointer", width: "100%",
                        }}
                    >
                        ↩ 進行中に戻す
                    </button>
                    )}

                    {isDirectorOrPM && (
                        <button
                            onClick={async () => {
                            if (!confirm("この案件を削除しますか？\nタスクと思考ログも全て削除されます。")) return
                            await supabase.from("projects").delete().eq("id", id)
                            router.push("/projects")
                            }}
                            style={{
                            padding: "10px 0", backgroundColor: "transparent", color: "#9ca3af",
                            border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13,
                            fontWeight: 500, cursor: "pointer", width: "100%",
                            }}
                            onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fef2f2"
                            e.currentTarget.style.color = "#e11d48"
                            e.currentTarget.style.borderColor = "#fecdd3"
                            }}
                            onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent"
                            e.currentTarget.style.color = "#9ca3af"
                            e.currentTarget.style.borderColor = "#e5e7eb"
                            }}
                        >
                            削除する
                        </button>
                        )}

                </div>
                </div>

          </div>

        </div>
      </div>
    </div>
  )
}