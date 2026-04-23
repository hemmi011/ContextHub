"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const menuItems = [
  {
    href: "/",
    label: "ホーム",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "案件一覧",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    href: "/tasks",
    label: "タスク管理",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <polyline points="3 6 4 7 6 5" />
        <polyline points="3 12 4 13 6 11" />
        <polyline points="3 18 4 19 6 17" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div style={{
      width: 80,
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      borderRight: "1px solid #e5e7eb",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 16,
      paddingBottom: 16,
      gap: 4,
      position: "fixed",
      top: 0,
      left: 0,
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "#6366f1",
        marginBottom: 24,
      }} />

      {menuItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              width: 60,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "8px 0",
              borderRadius: 10,
              color: isActive ? "#6366f1" : "#9ca3af",
              backgroundColor: isActive ? "#eef2ff" : "transparent",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            {item.icon}
            <span style={{ fontSize: 9, fontWeight: 500 }}>{item.label}</span>
          </Link>
        )
      })}

      {/* ログアウトボタン */}
      <button
        onClick={async () => {
          await supabase.auth.signOut()
          router.push("/login")
        }}
        title="ログアウト"
        style={{
          marginTop: "auto",
          width: 60,
          height: 44,
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          color: "#9ca3af",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span style={{ fontSize: 9, fontWeight: 500 }}>ログアウト</span>
      </button>

    </div>
  )
}