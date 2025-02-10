'use client';
import { useState } from 'react';
import { Question as QuestionType } from '@/lib/types';
import { processDocxFile } from '@/lib/fileProcessor';
import Question from './Question';
import FileUploader from './FileUploader';
import Button from '../ui/Button';

export default function QuizContainer() {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [currentQuestionAnswered, setCurrentQuestionAnswered] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      const processedQuestions = await processDocxFile(file);
      setQuestions(processedQuestions);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido al procesar el archivo';
      
      alert('Error al procesar el archivo: ' + errorMessage);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setIncorrectAnswers(prev => prev + 1);
    }
    setCurrentQuestionAnswered(true);
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

  const restartQuiz = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setIsFinished(false);
    setCurrentQuestionAnswered(false);
    setQuestions([...questions].sort(() => Math.random() - 0.5));
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <FileUploader onFileSelect={handleFileSelect} />
      </div>
    );
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
        <Button onClick={restartQuiz} className="mt-4">
          Reiniciar Quiz
        </Button>
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