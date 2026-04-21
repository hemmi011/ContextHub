"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    client_name: "",
    status: "進行中",
    budget: "",
    start_date: "",
    end_date: "",
    requirements: "",
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: userProfile } = await supabase
        .from("users")
        .select("organization_id")
        .eq("id", userData.user.id)
        .single()

      await supabase.from("projects").insert([{
        ...form,
        budget: form.budget ? Number(form.budget) : null,
        created_by: userData.user.id,
        organization_id: userProfile?.organization_id,
      }])

      router.push("/projects")
    }

  return (
    <div style={{ padding: 40, fontFamily: "'DM Sans', sans-serif", maxWidth: 600 }}>

      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => router.back()}
          style={{ fontSize: 13, color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16 }}
        >
          ← 戻る
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 }}>新規案件</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {[
          { key: "name", label: "案件名", placeholder: "案件名を入力", required: true },
          { key: "client_name", label: "会社名", placeholder: "会社名を入力" },
          { key: "budget", label: "予算", placeholder: "0" },
          { key: "start_date", label: "開始日", placeholder: "", type: "date" },
          { key: "end_date", label: "終了日", placeholder: "", type: "date" },
        ].map((field) => (
          <label key={field.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>
              {field.label}{field.required && <span style={{ color: "#e11d48" }}> *</span>}
            </span>
            <input
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={(form as any)[field.key]}
              onChange={set(field.key)}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
            />
          </label>
        ))}

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>ステータス</span>
          <select
            value={form.status}
            onChange={set("status")}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
            }}
          >
            <option value="進行中">進行中</option>
            <option value="完了">完了</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>要件メモ</span>
          <textarea
            placeholder="案件の要件・メモを入力"
            value={form.requirements}
            onChange={set("requirements")}
            rows={4}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading || !form.name}
          style={{
            marginTop: 8,
            padding: "12px 0",
            backgroundColor: loading || !form.name ? "#e5e7eb" : "#6366f1",
            color: loading || !form.name ? "#9ca3af" : "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading || !form.name ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "作成中..." : "案件を作成"}
        </button>

      </div>
    </div>
  )
}