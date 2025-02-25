// src/components/navigation/Navbar.tsx
'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession();

  // Si quieres tener una lista de emails admin
  const isAdmin = session?.user?.email === "nelsonrosales@gmail.com"; // Reemplaza con tu email de admin

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Quiz App</span>
            </Link>

            {/* Menú de admin */}
            {isAdmin && (
              <div className="ml-6">
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Panel Admin
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {status === 'authenticated' ? (
              <div className="flex items-center gap-4">
                <div className="text-gray-700">
                  {session.user?.firstName} {session.user?.lastName}
                </div>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}