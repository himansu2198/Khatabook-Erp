// middleware.ts

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Root always shows landing page — never redirect
  if (pathname === "/") {
    return NextResponse.next()
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  )

  const token = request.cookies.get("khatabook_access_token")?.value

  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/gateway", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}