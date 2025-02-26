// src/app/api/quiz/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Extraer el ID de la URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = parseInt(pathSegments[pathSegments.length - 1]);

    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'ID de quiz inválido'
      }, { status: 400 });
    }

    // Obtener la sesión del usuario actual
    const session = await getServerSession();

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no autenticado'
      }, { status: 401 });
    }

    // Intentar obtener el ID del usuario
    let userId: number | null = null;

    // Método 1: Directamente de session.user.id
    if (session.user.id) {
      userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : Number(session.user.id);
    }
    // Método 2: Buscar por email como respaldo
    else if (session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'No se pudo identificar tu cuenta de usuario'
      }, { status: 401 });
    }

    // Buscar el quiz para verificar que existe y pertenece al usuario
    const quiz = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!quiz) {
      return NextResponse.json({
        success: false,
        error: 'Quiz no encontrado'
      }, { status: 404 });
    }

    // Verificar que el usuario sea el creador del quiz
    if (quiz.creatorId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'No tienes permiso para eliminar este quiz'
      }, { status: 403 });
    }

    // Eliminar registros relacionados
    await prisma.userProgress.deleteMany({
      where: { quizId: id }
    });

    // Intentar eliminar respuestas incorrectas si existen
    try {
      await prisma.wrongAnswer.deleteMany({
        where: { quizId: id }
      });
    } catch {
      // Ignorar si la tabla no existe
      console.log('Nota: No se pudo eliminar respuestas incorrectas');
    }

    // Eliminar el quiz
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