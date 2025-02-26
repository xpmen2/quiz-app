// src/app/admin/page.tsx
import AdminPanel from '@/components/admin/AdminPanel';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// Lista de correos de administradores (sincronizada con middleware y navbar)
const ADMIN_EMAILS = ['nelsonrosales@gmail.com'];

export default async function AdminPage() {
    // Verificar si el usuario es admin
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    // Verificar si el email está en la lista de administradores
    if (!ADMIN_EMAILS.includes(session.user.email)) {
        redirect('/'); // Redirigir si no es admin
    }

    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isAuthorized: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
                <AdminPanel users={users} />
            </div>
        </main>
    );
}