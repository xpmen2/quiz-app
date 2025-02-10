import QuizContainer from '@/components/quiz/QuizContainer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Quiz App</h1>
        <QuizContainer />
      </div>
    </main>
  );
}