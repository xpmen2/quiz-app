'use client';
import { useSession } from 'next-auth/react';
import FileUploader from '../quiz/FileUploader';
import Link from 'next/link';
import DeleteQuizButton from '../quiz/DeleteQuizButton';

interface Quiz {
    id: number;
    title: string;
    createdAt: Date;
    _count: {
        questions: number;
    };
    userProgress: Array<{
        currentQuestion: number;
        isFinished: boolean;
    }>;
}

interface AuthContentProps {
    quizzes: Quiz[];
}

export default function AuthContent({ quizzes }: AuthContentProps) {
    const { data: session, status } = useSession(); // Agregamos data para acceder a session

    if (status !== 'authenticated') return null;

    // Si el usuario no está autorizado, mostrar mensaje de espera
    if (!session?.user?.isAuthorized) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">
                    Cuenta Pendiente de Autorización
                </h2>
                <p className="text-gray-600">
                    Tu cuenta está en proceso de revisión. Una vez que sea autorizada,
                    podrás acceder a todos los quizzes disponibles.
                </p>
            </div>
        );
    }

    // Solo mostrar el contenido si el usuario está autorizado
    return (
        <>
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
                                                href={`/quiz/${quiz.id}?reset=true`}
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
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Crear Nuevo Quiz</h2>
                <FileUploader />
            </div>
        </>
    );
}