// src/app/api/quiz/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Obtener el ID del quiz
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'ID de quiz inválido'
      }, { status: 400 });
    }

    // Obtener la sesión del usuario actual
    const session = await getServerSession();

    // Verificar si el usuario está autenticado
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no autenticado'
      }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Verificar si el quiz existe y pertenece al usuario actual
    const quiz = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!quiz) {
      return NextResponse.json({
        success: false,
        error: 'Quiz no encontrado'
      }, { status: 404 });
    }

    // Verificar si el usuario es el creador del quiz
    if (quiz.creatorId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'No tienes permiso para eliminar este quiz'
      }, { status: 403 });
    }

    // Eliminar los registros relacionados
    await prisma.userProgress.deleteMany({
      where: { quizId: id }
    });

    // También eliminar respuestas incorrectas si existen
    if (prisma.wrongAnswer) {
      await prisma.wrongAnswer.deleteMany({
        where: { quizId: id }
      });
    }

    // Finalmente eliminar el quiz
    const deletedQuiz = await prisma.quiz.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      quiz: deletedQuiz
    });
  } catch (error) {
    console.error('Error al eliminar quiz:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al eliminar quiz'
    }, {
      status: 500
    });
  }
}