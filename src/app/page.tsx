// src/app/page.tsx
import prisma from '@/lib/prisma';
import UnAuthContent from '@/components/auth/UnAuthContent';
import AuthContent from '@/components/auth/AuthContent';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const revalidate = 0;

export default async function Home() {
  // Obtener la sesión del usuario actual
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  // Obtener quizzes filtrando por usuario
  const quizzes = await prisma.quiz.findMany({
    where: userId ? {
      creatorId: userId
    } : undefined,
    include: {
      _count: {
        select: { questions: true }
      },
      userProgress: {
        where: userId ? { userId } : undefined,
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
        <UnAuthContent />
        <AuthContent quizzes={quizzes} />
      </div>
    </main>
  );
}