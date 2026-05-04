"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("director")
  const [organizationName, setOrganizationName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignup = async () => {
  if (!name || !email || !password || !organizationName) return
  setLoading(true)
  setError("")

  // 1. サインアップ
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    setError("登録に失敗しました。もう一度お試しください。")
    setLoading(false)
    return
  }

  // 2. すぐにログインしてセッションを取得
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    setError("ログインに失敗しました。")
    setLoading(false)
    return
  }

  // 3. 組織を作成
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert([{ name: organizationName }])
    .select()
    .single()

  if (orgError || !org) {
    console.error("organizations insert error:", orgError)
    setError("会社の登録に失敗しました。")
    setLoading(false)
    return
  }

  // 4. usersテーブルに登録
  const { error: userError } = await supabase.from("users").insert([{
    id: authData.user.id,
    name,
    email,
    role,
    organization_id: org.id,
  }])

  if (userError) {
    setError("ユーザー情報の登録に失敗しました。")
    setLoading(false)
    return
  }

  router.push("/")
}

  const isDisabled = loading || !name || !email || !password || !organizationName

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
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>新規登録</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>アカウントを作成してください</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

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
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>メールアドレス</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
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
              <option value="pm">PM</option>
              <option value="admin">管理者</option>
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>会社名</span>
            <input
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="例：株式会社〇〇"
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none" }}
            />
          </label>

          {error && (
            <p style={{ fontSize: 13, color: "#e11d48", margin: 0 }}>{error}</p>
          )}

          <button
            onClick={handleSignup}
            disabled={isDisabled}
            style={{
              marginTop: 8,
              padding: "11px 0",
              backgroundColor: isDisabled ? "#e5e7eb" : "#6366f1",
              color: isDisabled ? "#9ca3af" : "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "登録中..." : "登録する"}
          </button>

          <Link href="/login" style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>
            すでにアカウントをお持ちの方はこちら
          </Link>

        </div>
      </div>
    </div>
  )
}