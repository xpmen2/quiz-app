// src/app/api/admin/authorize-user/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// Lista de correos de administradores (sincronizada)
const ADMIN_EMAILS = ['nelsonrosales@gmail.com'];

export async function POST(request: Request) {
    try {
        // Verificar si el usuario es admin
        const session = await getServerSession(authOptions);

        if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        // Obtener datos del cuerpo
        const data = await request.json();
        const { userId, authorize } = data;

        if (!userId) {
            return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
        }

        // Actualizar estado de autorización
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isAuthorized: authorize },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error al autorizar usuario:', error);
        return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
    }
}