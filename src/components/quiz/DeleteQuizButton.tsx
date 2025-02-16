// src/components/quiz/DeleteQuizButton.tsx
'use client';
import { useState } from 'react';
import Button from '../ui/Button';

interface DeleteQuizButtonProps {
  quizId: number;
  className?: string;
}

export default function DeleteQuizButton({ quizId, className }: DeleteQuizButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este quiz?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/quiz/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar quiz');
      }

      // Recargar la página para mostrar la lista actualizada
      window.location.reload();
    } catch (error) {
      alert('Error al eliminar el quiz');
      console.error('Error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      className={`${className} ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={isDeleting}
    >
      {isDeleting ? 'Eliminando...' : 'Eliminar Quiz'}
    </Button>
  );
}