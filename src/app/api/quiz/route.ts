// src/app/api/quiz/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    console.log('Request body raw:', bodyText);

    let data;
    try {
      data = JSON.parse(bodyText);
      console.log('Datos parseados:', data);
    } catch (parseError) {
      console.error('Error parseando JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 });
    }

    if (!data.title || !Array.isArray(data.questions)) {
      console.error('Datos inválidos:', data);
      return NextResponse.json({ 
        error: 'Invalid data structure',
        received: data
      }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        questions: {
          create: data.questions.map((q: any) => ({
            text: q.text,
            explanation: q.explanation || '',
            options: {
              create: q.options.map((optionText: string) => ({
                text: optionText,
                isCorrect: optionText === q.correctAnswer
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, quiz });

  } catch (error) {
    console.error('Error en servidor:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}