// src/app/api/quiz/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Esperar a que los params estén disponibles
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Primero eliminar el progreso
    await prisma.userProgress.deleteMany({
      where: { quizId: id }
    });

    // Luego eliminar el quiz
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