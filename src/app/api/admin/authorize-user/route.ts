// src/app/api/admin/authorize-user/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { userId, authorize } = await request.json();

        const user = await prisma.user.update({
            where: { id: userId },
            data: { isAuthorized: authorize }
        });

        return NextResponse.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Error authorizing user:', error);
        return NextResponse.json(
            { error: 'Error al autorizar usuario' },
            { status: 500 }
        );
    }
}