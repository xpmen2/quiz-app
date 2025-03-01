// src/components/quiz/QuizContainer.tsx
'use client';
import { useState, useEffect } from 'react';
import { Question as QuestionType } from '@/lib/types';
import Question from './Question';
import Button from '../ui/Button';
import { useRouter } from 'next/navigation';

interface SavedProgress {
  currentQuestion: number;
  correctAnswers: number;
  incorrectAnswers: number;
  isFinished: boolean;
}

type QuizContainerProps = {
  initialQuestions?: QuestionType[];
  isExistingQuiz?: boolean;
  quizId?: number;
  savedProgress?: SavedProgress;
};

export default function QuizContainer({
  initialQuestions,
  isExistingQuiz = false,
  quizId,
  savedProgress
}: QuizContainerProps) {
  const [questions, setQuestions] = useState<QuestionType[]>(initialQuestions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [currentQuestionAnswered, setCurrentQuestionAnswered] = useState(false);

  const router = useRouter();

  // Cargar progreso guardado
  useEffect(() => {
    const loadProgress = async () => {
      if (quizId) {
        try {
          const response = await fetch(`/api/progress?quizId=${quizId}`);

          if (response.ok) {
            const data = await response.json();
            console.log('Progreso cargado:', data);

            if (data) {
              setCurrentIndex(data.currentQuestion);
              setCorrectAnswers(data.correctAnswers);
              setIncorrectAnswers(data.incorrectAnswers);
              setIsFinished(data.isFinished);
            }
          }
        } catch (error) {
          console.error('Error loading progress:', error);
        }
      }
    };

    loadProgress();
  }, [quizId]);

  useEffect(() => {
    if (savedProgress) {
      console.log('Cargando progreso guardado:', savedProgress);
      setCurrentIndex(savedProgress.currentQuestion);
      setCorrectAnswers(savedProgress.correctAnswers);
      setIncorrectAnswers(savedProgress.incorrectAnswers);
      setCurrentQuestionAnswered(false);
    }
  }, [savedProgress]);

  // const handleFileSelect = async (file: File) => {
  // try {
  // const processedQuestions = await processDocxFile(file);
  // setQuestions(processedQuestions);
  // } catch (error) {
  // const errorMessage = error instanceof Error 
  // ? error.message 
  // : 'Error desconocido al procesar el archivo';

  // alert('Error al procesar el archivo: ' + errorMessage);
  // }
  // };

  const handleAnswer = async (isCorrect: boolean) => {
    // Actualizamos el estado local
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setIncorrectAnswers(prev => prev + 1);


      // Si la respuesta es incorrecta, guardar en WrongAnswers
      if (quizId) {
        try {
          const currentQuestion = questions[currentIndex];

          // Verificar si tenemos el ID de la pregunta
          if (currentQuestion.id) {
            await fetch('/api/wrong-answer', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                quizId,
                questionId: currentQuestion.id
              }),
            });
          } else {
            console.error('Pregunta sin ID:', currentQuestion);
          }
        } catch (error) {
          console.error('Error saving wrong answer:', error);
        }
      }
    }


    setCurrentQuestionAnswered(true);

    // Guardamos el progreso al verificar la respuesta
    if (quizId) {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizId,
            currentQuestion: currentIndex + 1, // La siguiente pregunta será la actual + 1
            correctAnswers: isCorrect ? correctAnswers + 1 : correctAnswers,
            incorrectAnswers: isCorrect ? incorrectAnswers : incorrectAnswers + 1,
            isFinished: currentIndex === questions.length - 1
          }),
        });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  };

  const createReviewQuiz = async () => {
    if (!quizId) return;

    try {
      // Llamar al endpoint para crear el quiz de repaso
      const response = await fetch('/api/create-review-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalQuizId: quizId
        })
      });

      // const response = await fetch('/api/review', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     originalQuizId: quizId
      //   })
      // });

      if (!response.ok) {
        throw new Error('Error creating review quiz');
      }

      const data = await response.json();

      // Redirigir al nuevo quiz de repaso
      if (data.quizId) {
        router.push(`/quiz/${data.quizId}`);
      }
    } catch (error) {
      console.error('Error creating review quiz:', error);
      alert('Error al crear el quiz de repaso. Inténtalo de nuevo.');
    }
  };

  const restartQuiz = async () => {
    // Actualizar el estado local
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setIsFinished(false);
    setCurrentQuestionAnswered(false);
    setQuestions([...questions].sort(() => Math.random() - 0.5));

    // Si es un quiz existente
    if (quizId) {
      try {
        // 1. Llamar al endpoint para limpiar las respuestas incorrectas
        await fetch(`/api/wrong-answer/clear/${quizId}`, {
          method: 'DELETE'
        });

        // 2. Reiniciar el progreso en la base de datos usando la API existente
        await fetch(`/api/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizId: quizId,
            currentQuestion: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            isFinished: false
          })
        });

      } catch (error) {
        console.error('Error reiniciando quiz:', error);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionAnswered) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setCurrentQuestionAnswered(false);
      } else {
        setIsFinished(true);
      }
    }
  };

  // Verificar que estamos en un quiz existente
  if (!isExistingQuiz || questions.length === 0) {
    return null; // No mostrar nada si no es un quiz existente
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">¡Quiz Completado!</h2>
        <div className="space-y-2">
          <p>Total de preguntas: {questions.length}</p>
          <p className="text-green-600">Respuestas correctas: {correctAnswers}</p>
          <p className="text-red-600">Respuestas incorrectas: {incorrectAnswers}</p>
          <p className="font-semibold">
            Porcentaje de aciertos: {((correctAnswers / questions.length) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={restartQuiz}>
            Reiniciar Quiz
          </Button>

          {/* Mostrar botón de crear quiz de repaso solo si hay respuestas incorrectas */}
          {incorrectAnswers > 0 && quizId && (
            <Button
              onClick={createReviewQuiz}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Crear Quiz de Repaso
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <div className="mb-4 text-sm text-gray-600">
        Pregunta {currentIndex + 1} de {questions.length} |
        Correctas: {correctAnswers} | Incorrectas: {incorrectAnswers}
      </div>

      <Question
        question={questions[currentIndex]}
        onAnswer={handleAnswer}
      />

      <Button
        onClick={handleNext}
        className="mt-4"
        disabled={!currentQuestionAnswered}
      >
        {currentIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Quiz'}
      </Button>
    </div>
  );
}