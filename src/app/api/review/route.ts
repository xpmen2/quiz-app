// src/app/api/review/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

export async function POST(request: Request) {
    try {
        // Código simplificado para pruebas
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
        }

        const data = await request.json();

        return NextResponse.json({
            success: true,
            message: 'Endpoint funciona',
            received: data
        });
    } catch (error) {
        return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
    }
}