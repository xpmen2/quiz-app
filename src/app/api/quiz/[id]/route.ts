// src/app/api/quiz/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  context: {
    params: {
      id: string;
    }
  }
) {
  try {
    const id = parseInt(await context.params.id);

    await prisma.userProgress.deleteMany({
      where: { quizId: id }
    });

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