// src/app/quiz/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import QuizContainer from '@/components/quiz/QuizContainer';

// Importar los tipos correctos de Next.js
import { Metadata } from 'next';

// No necesitamos definir Props, usaremos los parámetros directamente
export default async function QuizPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const quizId = Number(params.id);
  const shouldContinue = searchParams.continue === 'true';

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

  let savedProgress = null;
  if (shouldContinue) {
    savedProgress = await prisma.userProgress.findFirst({
      where: {
        userId: 1,
        quizId: quizId
      }
    });
  }

  const formattedQuestions = quiz.questions.map(q => {
    const correctOption = q.options.find(opt => opt.isCorrect);
    return {
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