"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("メールアドレスまたはパスワードが違います")
      setLoading(false)
    } else {
      router.push("/")
    }
  }

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
        maxWidth: 400,
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#6366f1" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#6366f1" }}>ContextHub</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 }}>ログイン</h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#e11d48", margin: 0 }}>{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "11px 0",
              backgroundColor: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </div>
      </div>
    </div>
  )
}