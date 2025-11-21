import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user has valid access token in cookies
  const accessToken = request.cookies.get('access_token')
  
  // Public pages that don't require auth
  const publicPages = ['/', '/login', '/signup', '/forgot-password', '/reset-password']
  
  // Protected pages that require auth
  const protectedPages = ['/services', '/library', '/admin', '/payment']
  
  // If on protected page and no token, redirect to login
  if (protectedPages.some(page => pathname.startsWith(page)) && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If on login/signup and has token, redirect to services
  if ((pathname === '/login' || pathname === '/signup') && accessToken) {
    return NextResponse.redirect(new URL('/services', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
