// src/app/api/quiz/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  context: { 
    params: Record<string, string | string[]> 
  }
) {
  try {
    const id = parseInt(context.params.id as string);

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