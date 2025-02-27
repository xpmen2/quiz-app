// src/app/api/progress/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

// Para cargar el progreso
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Obtener la sesión del usuario actual
    const session = await getServerSession();

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Obtener el ID del usuario
    let userId: number | null = null;

    if (session.user.id) {
      userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : Number(session.user.id);
    } else if (session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'No se pudo identificar tu cuenta de usuario' }, { status: 401 });
    }

    const progress = await prisma.userProgress.findFirst({
      where: {
        userId: userId, // Usar el ID del usuario de la sesión
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
    // Obtener la sesión del usuario actual
    const session = await getServerSession();

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Obtener el ID del usuario
    let userId: number | null = null;

    if (session.user.id) {
      userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : Number(session.user.id);
    } else if (session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'No se pudo identificar tu cuenta de usuario' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Recibiendo datos de progreso:', data);

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_quizId: {
          userId: userId, // Usar el ID del usuario de la sesión
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
        userId: userId, // Usar el ID del usuario de la sesión
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