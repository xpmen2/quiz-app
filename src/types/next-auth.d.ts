// src/types/next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
    interface User {
        firstName: string;
        lastName: string;
        isAuthorized: boolean;
    }

    interface Session {
        user: User & {
            firstName: string;
            lastName: string;
            isAuthorized: boolean;
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        firstName: string;
        lastName: string;
        isAuthorized: boolean;
    }
}