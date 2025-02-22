// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from '@/lib/prisma'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Por ahora, solo logging
        console.log('Intento de login:', credentials);
        return null; // Por ahora retornamos null
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    // signUp: '/auth/register',  // Lo añadiremos después
  },
})

export { handler as GET, handler as POST }