// src/app/api/quiz/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

type Props = {
  params: {
    id: string;
  };
};

export async function DELETE(
  req: NextRequest,
  props: Props
) {
  const id = parseInt(props.params.id);

  try {
    const prisma = (await import('@/lib/prisma')).default;

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