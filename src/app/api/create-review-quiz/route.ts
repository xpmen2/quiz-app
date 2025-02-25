// src/app/api/create-review-quiz/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

export async function POST(request: Request) {
  try {
    // Obtener la sesión del usuario actual
    const session = await getServerSession();

    // Verificar si el usuario está autenticado
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const data = await request.json();
    const originalQuizId = data.originalQuizId;

    // 1. Obtener el quiz original para su título
    const originalQuiz = await prisma.quiz.findUnique({
      where: { id: originalQuizId }
    });

    if (!originalQuiz) {
      return NextResponse.json(
        { error: 'Quiz original no encontrado' },
        { status: 404 }
      );
    }

    // 2. Buscar las respuestas incorrectas para este quiz
    const wrongAnswers = await prisma.wrongAnswer.findMany({
      where: {
        userId: userId, // Usar el ID del usuario de la sesión
        quizId: originalQuizId
      },
      distinct: ['questionId'], // Evitar preguntas duplicadas
    });

    if (wrongAnswers.length === 0) {
      return NextResponse.json(
        { error: 'No hay respuestas incorrectas para crear un quiz de repaso' },
        { status: 404 }
      );
    }

    // 3. Obtener los IDs de las preguntas incorrectas
    const questionIds = wrongAnswers.map(wa => wa.questionId);

    // 4. Obtener los detalles completos de esas preguntas
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds }
      },
      include: {
        options: true
      }
    });

    // 5. Crear el nuevo quiz con las preguntas incorrectas
    const reviewQuiz = await prisma.quiz.create({
      data: {
        title: `${originalQuiz.title} - Repaso`,
        creatorId: userId, // Añadir el ID del creador
        questions: {
          create: questions.map(q => ({
            text: q.text,
            explanation: q.explanation,
            options: {
              create: q.options.map(opt => ({
                text: opt.text,
                isCorrect: opt.isCorrect
              }))
            }
          }))
        }
      }
    });

    // 6. Opcional: Limpiar el registro de respuestas incorrectas
    await prisma.wrongAnswer.deleteMany({
      where: {
        userId: userId, // Usar el ID del usuario de la sesión
        quizId: originalQuizId
      }
    });

    return NextResponse.json({
      success: true,
      quizId: reviewQuiz.id,
      message: 'Quiz de repaso creado exitosamente'
    });

  } catch (error) {
    console.error('Error creating review quiz:', error);
    return NextResponse.json(
      { error: 'Error al crear el quiz de repaso' },
      { status: 500 }
    );
  }
}