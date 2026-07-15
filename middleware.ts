import { getToken } from 'next-auth/jwt';
import {
  NextRequest,
  NextResponse,
} from 'next/server';

const VISITOR_COOKIE = 'tf_visitor_id';
const VISITOR_HEADER =
  'x-toggleflow-visitor-id';

const protectedRoutes = [
  '/grid',
  '/timeline',
  '/journal',
  '/stats',
  '/milestone',
  '/memory',
];

function attachVisitorCookie(
  response: NextResponse,
  visitorId: string,
  shouldSetCookie: boolean
): NextResponse {
  if (shouldSetCookie) {
    response.cookies.set(
      VISITOR_COOKIE,
      visitorId,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      }
    );
  }

  return response;
}

export async function middleware(
  request: NextRequest
) {
  const existingVisitorId =
    request.cookies.get(VISITOR_COOKIE)?.value;

  const visitorId =
    existingVisitorId ??
    crypto.randomUUID();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const rolloutSubject = token?.id
  ? `user:${String(token.id)}`
  : `visitor:${visitorId}`;

const requestHeaders = new Headers(
  request.headers
);

requestHeaders.set(
  VISITOR_HEADER,
  rolloutSubject
);

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

  if (isProtectedRoute && !token) {
    const response = NextResponse.redirect(
      new URL('/login', request.url)
    );

    return attachVisitorCookie(
      response,
      visitorId,
      !existingVisitorId
    );
  }

  const isAuthRoute = [
    '/login',
    '/register',
    '/signup',
  ].includes(pathname);

  if (isAuthRoute && token) {
    const response = NextResponse.redirect(
      new URL('/grid', request.url)
    );

    return attachVisitorCookie(
      response,
      visitorId,
      !existingVisitorId
    );
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return attachVisitorCookie(
    response,
    visitorId,
    !existingVisitorId
  );
}

export const config = {
  matcher: [
    '/',
    '/grid/:path*',
    '/timeline/:path*',
    '/journal/:path*',
    '/stats/:path*',
    '/milestone/:path*',
    '/memory/:path*',
    '/login',
    '/register',
    '/signup',
  ],
};