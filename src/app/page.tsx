// src/app/page.tsx
//import QuizContainer from '@/components/quiz/QuizContainer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import DeleteQuizButton from '@/components/quiz/DeleteQuizButton';
import FileUploader from '@/components/quiz/FileUploader';

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
        <h1 className="text-3xl font-bold text-center mb-8">Quiz App</h1>

        {quizzes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Quizzes Disponibles</h2>
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <details 
                  key={quiz.id} 
                  className="bg-white rounded-lg shadow-sm"
                >
                  <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex justify-between">
                      <span className="font-medium">{quiz.title}</span>
                      <span className="text-gray-500">
                        {quiz._count.questions} preguntas
                      </span>
                    </div>
                  </summary>
                  <div className="px-6 py-4 border-t">
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Creado: {new Date(quiz.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-3">
						<Link 
						  href={`/quiz/${quiz.id}?reset=true`}  // Añadimos parámetro reset
						  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
						>
						  Comenzar Quiz
						</Link>						
                        {quiz.userProgress[0] && !quiz.userProgress[0].isFinished && (
                          <Link 
                            href={`/quiz/${quiz.id}?continue=true`}
                            className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Continuar Quiz (Pregunta {quiz.userProgress[0].currentQuestion + 1})
                          </Link>
                        )}
                        <DeleteQuizButton 
                          quizId={quiz.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Sección para crear nuevo quiz */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Crear Nuevo Quiz</h2>
          <FileUploader />
        </div>
      </div>
    </main>
  );
}