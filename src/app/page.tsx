// src/app/page.tsx
//import QuizContainer from '@/components/quiz/QuizContainer';
import prisma from '@/lib/prisma';
import UnAuthContent from '@/components/auth/UnAuthContent';
import AuthContent from '@/components/auth/AuthContent';

export const revalidate = 0;

export default async function Home() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      _count: {
        select: { questions: true }
      },
      userProgress: {
        where: { userId: 1 },
        orderBy: { lastAccess: 'desc' },
        take: 1
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header con estado de autenticación */}
        {/* <h1 className="text-3xl font-bold text-center mb-8">Quiz App</h1> */}

        {/* Contenido basado en autenticación */}
        <UnAuthContent />
        <AuthContent quizzes={quizzes} />
      </div>
    </main>
  );
}