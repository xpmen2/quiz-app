import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;

        // Verificar rutas admin
        if (req.nextUrl.pathname.startsWith("/admin")) {
            if (token?.email !== "nelsonrosales@gmail.com") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        }
    }
);

export const config = {
    matcher: [
        "/quiz/:path*",  // Protege todas las rutas /quiz/...
        "/api/quiz/:path*", // Protege el API de quiz
        "/api/progress/:path*", // Protege el API de progreso
        "/api/wrong-answer/:path*", // Protege el API de respuestas incorrectas
        "/admin/:path*",
    ]
}