import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin))
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
    },
    body: JSON.stringify({ auth_code: code }),
  })

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin))
  }

  const { access_token } = await tokenResponse.json()

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      "Authorization": `Bearer ${access_token}`,
      "apikey": supabaseKey,
    },
  })

  const userData = await userResponse.json()

  const existingUserResponse = await fetch(
    `${supabaseUrl}/rest/v1/users?id=eq.${userData.id}&select=id`,
    {
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "apikey": supabaseKey,
      },
    }
  )

  const existingUsers = await existingUserResponse.json()

  const response = existingUsers.length > 0
    ? NextResponse.redirect(new URL("/", requestUrl.origin))
    : NextResponse.redirect(new URL("/profile/setup", requestUrl.origin))

  response.cookies.set("sb-access-token", access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  })

  return response
}