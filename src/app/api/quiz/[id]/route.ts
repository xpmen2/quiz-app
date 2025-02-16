// src/app/api/quiz/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

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