// src/middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// Lista de correos de administradores
const ADMIN_EMAILS = ['email@admin.com']; // Reemplaza con tu email de admin

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });

    // Verificar si el usuario está autenticado
    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Para rutas de admin, verificar si es admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!ADMIN_EMAILS.includes(token.email as string)) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/quiz/:path*",
        "/api/quiz/:path*",
        "/api/progress/:path*",
        "/api/wrong-answer/:path*",
        "/admin/:path*", // Proteger rutas admin
    ]
}