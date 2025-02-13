// src/app/api/progress/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Datos recibidos:', data);

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_quizId: {
          userId: 1,
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
        userId: 1,
        quizId: data.quizId,
        currentQuestion: data.currentQuestion,
        correctAnswers: data.correctAnswers,
        incorrectAnswers: data.incorrectAnswers,
        isFinished: data.isFinished,
        lastAccess: new Date()
      }
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json({ error: 'Error saving progress' }, { status: 500 });
  }
}