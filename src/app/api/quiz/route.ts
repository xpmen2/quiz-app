// src/app/api/quiz/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface QuestionData {
  text: string;
  explanation: string;
  options: string[];
  correctAnswer: string;
}

interface QuizData {
  title: string;
  questions: QuestionData[];
}

export async function POST(request: Request) {
  try {
    // Obtener la sesión del usuario actual
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Obtener el ID del usuario
    const userId = session.user.id ? parseInt(session.user.id) : null;
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario no disponible' }, { status: 401 });
    }

    const bodyText = await request.text();
    console.log('Request body raw:', bodyText);

    let data: QuizData;
    try {
      data = JSON.parse(bodyText);
      console.log('Datos parseados:', data);
    } catch (parseError) {
      console.error('Error parseando JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 });
    }

    if (!data.title || !Array.isArray(data.questions)) {
      console.error('Datos inválidos:', data);
      return NextResponse.json({
        error: 'Invalid data structure',
        received: data
      }, { status: 400 });
    }

    // Crear el quiz asociado al usuario actual
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        creatorId: userId, // Asociar con el creador
        questions: {
          create: data.questions.map((q: QuestionData) => ({
            text: q.text,
            explanation: q.explanation || '',
            options: {
              create: q.options.map((optionText: string) => ({
                text: optionText,
                isCorrect: optionText === q.correctAnswer
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, quiz });

  } catch (error) {
    console.error('Error en servidor:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Añadir método GET para obtener quizzes del usuario actual
export async function GET() {
  try {
    // Obtener la sesión del usuario actual
    const session = await getServerSession(authOptions);

    // Verificar si el usuario está autenticado
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Obtener quizzes del usuario actual
    const quizzes = await prisma.quiz.findMany({
      where: {
        creatorId: parseInt(session.user.id as string)
      },
      include: {
        _count: {
          select: { questions: true }
        },
        userProgress: {
          where: { userId: parseInt(session.user.id as string) },
          orderBy: { lastAccess: 'desc' },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error al obtener quizzes:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}