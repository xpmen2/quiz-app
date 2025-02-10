'use client';
import { useRef } from 'react';
import Button from '../ui/Button';

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
        console.log('Archivo seleccionado:', file.name); // Log para diagnóstico
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