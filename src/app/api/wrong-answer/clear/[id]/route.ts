// src/app/api/wrong-answer/clear/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

export async function DELETE(request: Request) {
  try {
    // Obtener la sesión del usuario actual
    const session = await getServerSession();

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Obtener el ID del usuario
    let userId: number | null = null;

    if (session.user.id) {
      userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : Number(session.user.id);
    } else if (session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'No se pudo identificar tu cuenta de usuario' }, { status: 401 });
    }

    // Extraer el ID de la URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const quizId = parseInt(id || '0');

    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea el propietario del quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz no encontrado' }, { status: 404 });
    }

    if (quiz.creatorId !== userId) {
      return NextResponse.json({
        error: 'No tienes permiso para limpiar las respuestas incorrectas de este quiz'
      }, { status: 403 });
    }

    // Eliminar solo las respuestas incorrectas del usuario actual
    await prisma.wrongAnswer.deleteMany({
      where: {
        userId: userId,
        quizId: quizId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Wrong answers cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing wrong answers:', error);
    return NextResponse.json(
      { error: 'Error clearing wrong answers' },
      { status: 500 }
    );
  }
}