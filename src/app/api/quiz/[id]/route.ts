// src/app/api/quiz/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  try {
    // Primero eliminamos todo el progreso relacionado
    await prisma.userProgress.deleteMany({
      where: { quizId: id }
    });

    // Luego eliminamos el quiz y sus relaciones
    const deletedQuiz = await prisma.quiz.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, deletedQuiz });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Error deleting quiz' }, 
      { status: 500 }
    );
  }
}