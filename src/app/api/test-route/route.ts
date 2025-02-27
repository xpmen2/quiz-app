// src/app/api/test-route/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: 'La ruta funciona correctamente' });
}

export async function POST(request: Request) {
    return NextResponse.json({ message: 'POST funciona correctamente' });
}