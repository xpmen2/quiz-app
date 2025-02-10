import { Question } from './types';
import mammoth from 'mammoth';

export async function processDocxFile(file: File): Promise<Question[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
 
    console.log('Texto extraído completo:', text); // Log del texto completo 
    // Dividir por asteriscos y filtrar bloques vacíos
    const blocks = text.split('*').filter(block => block.trim());
    
    const questions: Question[] = blocks.map(block => {
      console.log(`\nProcesando bloque :`, block); // Log de cada bloque
	  
      // Dividir el bloque en líneas y limpiar espacios
      const lines = block.trim().split('\n').map(line => line.trim()).filter(line => line);
      
      const text = lines[0]; // Primera línea es la pregunta
      const options: string[] = [];
      let correctAnswer = '';
      
      // Procesar las siguientes 4 líneas como opciones
      for (let i = 1; i <= 4; i++) {
        if (lines[i]) {
          const option = lines[i].trim();
          if (option.startsWith('^')) {
            // Si la opción comienza con ^, es la respuesta correcta
            correctAnswer = option.substring(1).trim();
            options.push(correctAnswer);
          } else {
            options.push(option);
          }
        }
      }

      // Encontrar la línea de explicación (comienza con "Incorrecta." o similar)
	// Crear un array con todas las posibles variantes
	const explanationStarters = [
	  'Incorrecta.',
	  'Incorrecto.',
	  'Correcta.',
	  'Correcto.',
	  'Es Correcto.',
	  'No es correcto.'
	];	  
	const explanationLine = lines.find(line => 
	  explanationStarters.some(starter => line.startsWith(starter))
	);
      // Extraer la explicación después del primer punto
      const explanation = explanationLine 
        ? explanationLine.split('.').slice(1).join('.').trim()
        : '';

      console.log('Pregunta procesada:', { text, options, correctAnswer, explanation });

      return {
        text,
        options,
        correctAnswer,
        explanation
      };
    });

    return questions;
  } catch (error) {
    console.error('Error detallado:', error);
    throw error;
  }
}