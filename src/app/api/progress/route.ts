// src/app/api/progress/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Para cargar el progreso
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    const progress = await prisma.userProgress.findFirst({
      where: {
        userId: 1, // Temporal hasta implementar auth
        quizId: Number(quizId)
      }
    });

    return NextResponse.json(progress || {
      currentQuestion: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      isFinished: false
    });
  } catch (error) {
    console.error('Error loading progress:', error);
    return NextResponse.json({ error: 'Error loading progress' }, { status: 500 });
  }
}

// Para guardar el progreso
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Recibiendo datos de progreso:', data);

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_quizId: {
          userId: 1, // Temporal hasta implementar auth
          quizId: data.quizId
        }
      },
      update: {
        currentQuestion: data.currentQuestion,
        correctAnswers: data.correctAnswers,
        incorrectAnswers: data.incorrectAnswers,
        isFinished: data.isFinished,
        lastAccess: new Date()
      },
      create: {
        userId: 1, // Temporal hasta implementar auth
        quizId: data.quizId,
        currentQuestion: data.currentQuestion,
        correctAnswers: data.correctAnswers,
        incorrectAnswers: data.incorrectAnswers,
        isFinished: data.isFinished,
        lastAccess: new Date()
      }
    });

    console.log('Progreso guardado:', progress);
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json({ error: 'Error saving progress' }, { status: 500 });
  }
}