// src/app/quiz/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import QuizContainer from '@/components/quiz/QuizContainer';
import { getServerSession } from 'next-auth/next';

interface SavedProgress {
  currentQuestion: number;
  correctAnswers: number;
  incorrectAnswers: number;
  isFinished: boolean;
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ continue?: string; reset?: string }>;
}

export default async function QuizPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const quizId = Number(resolvedParams.id);
  const shouldReset = resolvedSearchParams.reset === 'true';
  const shouldContinue = resolvedSearchParams?.continue === 'true';

  // Obtener la sesión del usuario actual
  const session = await getServerSession();

  // Verificar si el usuario está autenticado
  if (!session?.user) {
    // Redirigir a inicio de sesión si no está autenticado
    redirect('/auth/login');
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
    redirect('/auth/login');
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: {
          options: true
        }
      }
    }
  });

  if (!quiz) {
    notFound();
  }

  // Verificar que el usuario sea el propietario del quiz o permitir acceso para todos los usuarios
  // Si solo los creadores pueden ver sus quizzes, descomentar esta sección
  /*
  if (quiz.creatorId !== userId) {
    redirect('/');
  }
  */

  let savedProgress: SavedProgress | undefined;

  if (shouldReset) {
    // Limpiar el progreso existente
    await prisma.userProgress.deleteMany({
      where: {
        userId: userId, // Usar ID del usuario de la sesión
        quizId: quizId
      }
    });

    // También limpiar las respuestas incorrectas
    await prisma.wrongAnswer.deleteMany({
      where: {
        userId: userId, // Usar ID del usuario de la sesión
        quizId: quizId
      }
    });

    // No cargar progreso si es reset
    savedProgress = undefined;
  }
  else if (shouldContinue) {
    // Cargar el progreso solo si no es reset
    const progress = await prisma.userProgress.findFirst({
      where: {
        userId: userId, // Usar ID del usuario de la sesión
        quizId: quizId
      }
    });

    if (progress) {
      savedProgress = {
        currentQuestion: progress.currentQuestion,
        correctAnswers: progress.correctAnswers,
        incorrectAnswers: progress.incorrectAnswers,
        isFinished: progress.isFinished
      };
    }
  }

  const formattedQuestions = quiz.questions.map(q => {
    const correctOption = q.options.find(opt => opt.isCorrect);
    return {
      id: q.id,
      text: q.text,
      options: q.options.map(opt => opt.text),
      correctAnswer: correctOption?.text || '',
      explanation: q.explanation || ''
    };
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Volver a la lista
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">{quiz.title}</h1>
        <QuizContainer
          initialQuestions={formattedQuestions}
          isExistingQuiz={true}
          quizId={quiz.id}
          savedProgress={savedProgress}
        />
      </div>
    </main>
  );
}