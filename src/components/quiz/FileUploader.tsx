// src\components\quiz\FileUploader.tsx
'use client';
import { useRef, useState } from 'react';
import Button from '../ui/Button';
import { processDocxFile } from '@/lib/fileProcessor';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function FileUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { status } = useSession(); // Removido session ya que no lo usamos directamente
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    // Verificar autenticación antes de permitir la selección de archivo
    if (status !== 'authenticated') {
      setError('Debes iniciar sesión para subir archivos');
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Archivo seleccionado:', file.name);

      // Verificar que el usuario esté autenticado
      if (status !== 'authenticated') {
        throw new Error('Debes iniciar sesión para crear quizzes');
      }

      const processedQuestions = await processDocxFile(file);
      console.log('Preguntas procesadas:', processedQuestions);

      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: file.name.replace('.docx', ''),
          questions: processedQuestions
        })
      });

      // Obtener los datos de la respuesta para ver el error específico
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Error al guardar en la base de datos';
        console.error('Error en la respuesta:', data);
        throw new Error(errorMessage);
      }

      // Recargar la página para mostrar el nuevo quiz en la lista
      router.refresh();
      router.push('/');

    } catch (error: unknown) { // Cambiado any por unknown para satisfacer ESLint
      console.error('Error en FileUploader:', error);
      // Manejar el error de forma segura
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al procesar el archivo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".docx"
        className="hidden"
        disabled={loading}
      />

      {error && (
        <div className="text-red-600 mb-2 text-sm">
          {error}
        </div>
      )}

      <Button
        onClick={handleClick}
        disabled={loading || status === 'loading'}
      >
        {loading ? 'Procesando...' : 'Seleccionar archivo DOCX'}
      </Button>

      {status === 'unauthenticated' && (
        <p className="text-sm text-gray-600 mt-2">
          Debes iniciar sesión para poder crear quizzes.
        </p>
      )}
    </div>
  );
}