'use client';
import { useSession, signOut } from 'next-auth/react';

export default function AuthStatus() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        return <div>No has iniciado sesión</div>;
    }

    return (
        <div className="flex items-center gap-4">
            <div>Sesión iniciada como: {session?.user?.email}</div>
            <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Cerrar Sesión
            </button>
        </div>
    );
}