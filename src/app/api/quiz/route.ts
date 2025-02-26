// src/app/api/quiz/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

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

// Método GET para obtener quizzes del usuario actual
export async function GET() {
  try {
    // Obtener la sesión del usuario actual
    const session = await getServerSession();

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    let userId: number | null = null;

    // Intentar obtener el ID del usuario
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
      return NextResponse.json({ error: 'No se pudo identificar la cuenta de usuario' }, { status: 401 });
    }

    // Obtener quizzes del usuario actual
    const quizzes = await prisma.quiz.findMany({
      where: {
        creatorId: userId
      },
      include: {
        _count: {
          select: { questions: true }
        },
        userProgress: {
          where: { userId: userId },
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

// Método POST para crear un nuevo quiz
export async function POST(request: Request) {
  try {
    // Obtener la sesión del usuario actual
    const session = await getServerSession();

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({
        error: 'Debes iniciar sesión para crear quizzes'
      }, { status: 401 });
    }

    // Depuración - ver qué hay en la sesión
    console.log("Datos de sesión:", JSON.stringify(session.user));

    // Intentar obtener el ID del usuario
    let userId: number | null = null;

    // Método 1: Directamente de session.user.id
    if (session.user.id) {
      userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : Number(session.user.id);
    }
    // Método 2: Buscar por email como respaldo
    else if (session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({
        error: 'No se pudo identificar tu cuenta de usuario',
        debug: JSON.stringify(session.user)
      }, { status: 401 });
    }

    // Procesar el cuerpo de la solicitud
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