'use client';
'use client';
import { useState, useEffect } from 'react';
import { Question as QuestionType } from '@/lib/types';
import { processDocxFile } from '@/lib/fileProcessor';
import Question from './Question';
import FileUploader from './FileUploader';
import Button from '../ui/Button';

type QuizContainerProps = {
 initialQuestions?: QuestionType[];
 isExistingQuiz?: boolean;
 quizId?: number;
 savedProgress?: any;
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

 const handleAnswer = async (isCorrect: boolean) => {
   // Actualizamos el estado local
   if (isCorrect) {
     setCorrectAnswers(prev => prev + 1);
   } else {
     setIncorrectAnswers(prev => prev + 1);
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

 if (questions.length === 0 && !isExistingQuiz) {
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