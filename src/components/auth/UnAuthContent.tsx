'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function UnAuthContent() {
    const { status } = useSession();

    if (status === 'authenticated') return null;

    return (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">
                ¡Bienvenido a Quiz App!
            </h2>
            <p className="text-gray-600 mb-8">
                Inicia sesión para acceder a todos los quizzes disponibles.
            </p>
            <Link
                href="/auth/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Iniciar Sesión
            </Link>
        </div>
    );
}