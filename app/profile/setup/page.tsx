"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"


export default function ProfileSetupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [role, setRole] = useState("director")
  const [organizationName, setOrganizationName] = useState("")
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState("")
  const [email, setEmail] = useState("")
  

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push("/login")
        return
      }
      setUserId(data.user.id)
      setEmail(data.user.email || "")
      setName(data.user.user_metadata?.full_name || "")
    }
    getUser()
  }, [])



    const handleSubmit = async () => {
    if (!name || !organizationName) return
    setLoading(true)

    const { data: org } = await supabase
        .from("organizations")
        .insert([{ name: organizationName }])
        .select()
        .single()

    if (!org) {
        setLoading(false)
        return
    }

    await supabase.from("users").upsert([{
        id: userId,
        name: name,
        email: email,
        role: role,
        organization_id: org.id,
    }])

    router.push("/")
    }

    const isDisabled = loading || !name || !organizationName

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 440,
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#6366f1" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#6366f1" }}>ContextHub</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>プロフィール設定</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>はじめに情報を入力してください</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>名前</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：田中 太郎"
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>役割</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none" }}
            >
              <option value="director">ディレクター</option>
              <option value="designer">デザイナー</option>
              <option value="coder">コーダー</option>
              <option value="pm">PM</option>
              <option value="admin">管理者</option>
            </select>
          </label>

          {/* ✅ 全員同じフォームを表示 */}
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>会社名</span>
            <input
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="例：株式会社〇〇"
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none" }}
            />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>
                既存の会社に参加する場合は管理者から招待してもらってください
            </span>
            </label>

          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            style={{
              marginTop: 8,
              padding: "12px 0",
              backgroundColor: isDisabled ? "#e5e7eb" : "#6366f1",
              color: isDisabled ? "#9ca3af" : "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "設定中..." : "はじめる"}
          </button>

        </div>
      </div>
    </div>
  )
}