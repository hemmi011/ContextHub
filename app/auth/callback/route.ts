import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // usersテーブルに登録済みか確認
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()

      if (existingUser) {
        // 登録済み → ホームへ
        return NextResponse.redirect(new URL("/", requestUrl.origin))
      } else {
        // 初回 → プロフィール設定へ
        return NextResponse.redirect(new URL("/profile/setup", requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin))
}