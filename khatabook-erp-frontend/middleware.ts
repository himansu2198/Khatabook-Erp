import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token    = request.cookies.get("khatabook_access_token")?.value
  const pathname = request.nextUrl.pathname

  // Auth pages — redirect to gateway if logged in
  if (["/login", "/register"].includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/gateway", request.url))
    }
  }

  // Protected pages — redirect to login if not logged in
  const protectedPaths = [
    "/gateway",
    "/masters",
    "/vouchers",
    "/reports",
  ]

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/gateway/:path*",
    "/masters/:path*",
    "/vouchers/:path*",
    "/reports/:path*",
    "/login",
    "/register",
  ],
}
