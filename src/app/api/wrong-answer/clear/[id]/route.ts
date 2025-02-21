// src/app/api/wrong-answer/clear/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = parseInt(await params.id);

    await prisma.wrongAnswer.deleteMany({
      where: {
        userId: 1, // Usuario por defecto
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