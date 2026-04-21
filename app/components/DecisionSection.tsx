"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Decision = {
  id: string
  content: string
  created_at: string
  created_by: string
  users: { name: string } | null
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

export default function DecisionSection({ projectId, role, currentUser }: Props) {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [newContent, setNewContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")

  useEffect(() => {
    fetchDecisions()
  }, [projectId, role])

  const fetchDecisions = async () => {
    const { data } = await supabase
      .from("decisions")
      .select("id, content, created_at, created_by, users(name)")
      .eq("project_id", projectId)
      .eq("role", role)
      .order("created_at", { ascending: false })
    setDecisions((data as any) || [])
    setLoading(false)
  }

  const addDecision = async () => {
    if (!newContent.trim()) return
    await supabase.from("decisions").insert([{
      project_id: projectId,
      content: newContent,
      created_by: currentUser.id,
      task_id: null,
      role: role,
    }])
    setNewContent("")
    fetchDecisions()
  }

  const saveEdit = async (id: string) => {
    if (!editingContent.trim()) return
    await supabase.from("decisions").update({ content: editingContent }).eq("id", id)
    setEditingId(null)
    fetchDecisions()
  }

  const deleteDecision = async (id: string) => {
    await supabase.from("decisions").delete().eq("id", id)
    fetchDecisions()
  }

  if (loading) return <p style={{ fontSize: 14, color: "#9ca3af" }}>読み込み中...</p>

  return (
    <div style={{ marginTop: 24 }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af", letterSpacing: "0.06em", margin: "0 0 12px", textTransform: "uppercase" as const }}>
        思考ログ
      </p>

      {/* 入力欄 */}
      <div style={{ marginBottom: 16 }}>
        <textarea
          placeholder="意思決定の背景・判断理由を記録する"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={3}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8,
            border: "1px solid #e5e7eb", fontSize: 14, outline: "none",
            resize: "vertical", fontFamily: "inherit",
            boxSizing: "border-box" as const, marginBottom: 8,
          }}
        />
        <button
          onClick={addDecision}
          disabled={!newContent.trim()}
          style={{
            padding: "8px 16px",
            backgroundColor: !newContent.trim() ? "#e5e7eb" : "#6366f1",
            color: !newContent.trim() ? "#9ca3af" : "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: !newContent.trim() ? "not-allowed" : "pointer",
          }}
        >
          記録する
        </button>
      </div>

      {/* 思考ログ一覧 */}
      {decisions.length === 0 ? (
        <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: "16px 0" }}>
          思考ログがありません
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {decisions.map((decision) => (
            <div
              key={decision.id}
              style={{
                backgroundColor: "#ffffff", border: "1px solid #e5e7eb",
                borderRadius: 10, padding: "14px 16px",
              }}
            >
              {/* ヘッダー：名前・日時・編集・削除 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                    {decision.users?.name || "不明"}
                  </span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    {new Date(decision.created_at).toLocaleDateString("ja-JP", {
                      month: "numeric", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>

                {decision.created_by === currentUser.id && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => { setEditingId(decision.id); setEditingContent(decision.content) }}
                      style={{
                        padding: "2px 8px", backgroundColor: "transparent",
                        color: "#9ca3af", border: "1px solid #e5e7eb",
                        borderRadius: 4, fontSize: 11, cursor: "pointer",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#6366f1"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => deleteDecision(decision.id)}
                      style={{
                        padding: "2px 6px", backgroundColor: "transparent",
                        color: "#d1d5db", border: "none",
                        borderRadius: 4, fontSize: 13, cursor: "pointer",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#e11d48"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#d1d5db"}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* 本文 or 編集フォーム */}
              {editingId === decision.id ? (
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={3}
                    autoFocus
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 6,
                      border: "1px solid #6366f1", fontSize: 13, outline: "none",
                      resize: "vertical", fontFamily: "inherit",
                      boxSizing: "border-box" as const, marginBottom: 8,
                    }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => saveEdit(decision.id)}
                      style={{
                        padding: "6px 12px", backgroundColor: "#6366f1", color: "#fff",
                        border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer",
                      }}
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: "6px 12px", backgroundColor: "transparent", color: "#9ca3af",
                        border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer",
                      }}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                  {decision.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}