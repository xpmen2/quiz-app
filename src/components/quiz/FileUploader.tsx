'use client';
import { useRef } from 'react';
import Button from '../ui/Button';
import { processDocxFile } from '@/lib/fileProcessor';

type FileUploaderProps = {
  onFileSelect: (file: File) => void;
};

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        console.log('Status:', response.status);
        const responseText = await response.text();
        console.log('Respuesta del servidor:', responseText);

        if (!response.ok) {
          throw new Error(responseText);
        }

        // Ya no almacenamos el resultado en una variable data que no usamos
        if (responseText) {
          JSON.parse(responseText); // Solo validamos que sea JSON válido
        }
        
        onFileSelect(file);
        
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