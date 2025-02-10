import './globals.css'

export const metadata = {
  title: 'Quiz App',
  description: 'Aplicación de preguntas y respuestas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}