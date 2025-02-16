// src\components\quiz\FileUploader.tsx
'use client';
import { useRef } from 'react';
import Button from '../ui/Button';
import { processDocxFile } from '@/lib/fileProcessor';
import { useRouter } from 'next/navigation';

export default function FileUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        console.log('Archivo seleccionado:', file.name);
        
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

        if (!response.ok) {
          throw new Error('Error al guardar en la base de datos');
        }

        // Recargar la página para mostrar el nuevo quiz en la lista
        router.refresh();
        
      } catch (error) {
        console.error('Error en FileUploader:', error);
        alert('Error al procesar el archivo: ' + error);
      }
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
      />
      <Button onClick={handleClick}>
        Seleccionar archivo DOCX
      </Button>
    </div>
  );
}