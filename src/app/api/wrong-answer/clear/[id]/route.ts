// src/app/api/wrong-answer/clear/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
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

    await prisma.wrongAnswer.deleteMany({
      where: {
        userId: 1,
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
