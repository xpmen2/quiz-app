'use client';
import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { Question as QuestionType } from '@/lib/types';

type QuestionProps = {
  question: QuestionType;
  onAnswer: (isCorrect: boolean) => void;
};

export default function Question({ question, onAnswer }: QuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Resetear el estado cuando cambia la pregunta
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, [question]);

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    const isCorrect = selectedAnswer === question.correctAnswer;
    setIsAnswered(true);
    onAnswer(isCorrect);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{question.text}</h2>
      
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center p-3 border rounded-lg cursor-pointer 
                       hover:bg-gray-50 ${
                         selectedAnswer === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                       }`}
          >
            <input
              type="radio"
              name="answer"
              value={option}
              checked={selectedAnswer === option}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={isAnswered}
              className="mr-2"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      {isAnswered ? (
        <div className="mt-4 p-4 rounded-lg bg-gray-50">
          <p className={`font-semibold ${
            selectedAnswer === question.correctAnswer ? 'text-green-600' : 'text-red-600'
          }`}>
            {selectedAnswer === question.correctAnswer ? '¡Correcto!' : 'Incorrecto'}
          </p>
          <p className="mt-2">{question.explanation}</p>
        </div>
      ) : (
        <Button 
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="mt-4"
        >
          Verificar Respuesta
        </Button>
      )}
    </div>
  );
}