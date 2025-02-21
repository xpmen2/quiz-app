// src/app/api/wrong-answer/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Crear el registro de respuesta incorrecta
    const wrongAnswer = await prisma.wrongAnswer.create({
      data: {
        userId: 1, // Usuario por defecto
        quizId: data.quizId,
        questionId: data.questionId
      }
    });
	
    console.log('Wrong answer saved:', wrongAnswer);    
    return NextResponse.json(wrongAnswer);
  } catch (error) {
    console.error('Error saving wrong answer:', error);
    return NextResponse.json(
      { error: 'Error saving wrong answer' }, 
      { status: 500 }
    );
  }
}