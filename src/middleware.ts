export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        "/quiz/:path*",  // Protege todas las rutas /quiz/...
        "/api/quiz/:path*", // Protege el API de quiz
        "/api/progress/:path*", // Protege el API de progreso
        "/api/wrong-answer/:path*", // Protege el API de respuestas incorrectas
    ]
}