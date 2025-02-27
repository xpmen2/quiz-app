import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

export async function POST(request: Request) {
  try {
    // Obtener la sesión del usuario actual
    const session = await getServerSession();

    // Verificar si el usuario está autenticado
    if (!session?.user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Obtener el ID del usuario
    let userId: number | null = null;

    if (session.user.id) {
      userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : Number(session.user.id);
    } else if (session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'No se pudo identificar tu cuenta de usuario' }, { status: 401 });
    }

    const data = await request.json();

    // Crear el registro de respuesta incorrecta
    const wrongAnswer = await prisma.wrongAnswer.create({
      data: {
        userId: userId, // Usar el ID del usuario de la sesión
        quizId: data.quizId,
        questionId: data.questionId
      }
    });

    console.log('Wrong answer saved:', wrongAnswer);
    return NextResponse.json(wrongAnswer);
  } catch (error) {
    console.error('Error saving wrong answer:', error);
    return NextResponse.json(
      { error: 'Error saving wrong answer' },
      { status: 500 }
    );
  }
}






// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';

// export async function POST(request: Request) {
//   try {
//     const data = await request.json();

//     // Crear el registro de respuesta incorrecta
//     const wrongAnswer = await prisma.wrongAnswer.create({
//       data: {
//         userId: 1, // Usuario por defecto
//         quizId: data.quizId,
//         questionId: data.questionId
//       }
//     });

//     console.log('Wrong answer saved:', wrongAnswer);
//     return NextResponse.json(wrongAnswer);
//   } catch (error) {
//     console.error('Error saving wrong answer:', error);
//     return NextResponse.json(
//       { error: 'Error saving wrong answer' },
//       { status: 500 }
//     );
//   }
// }