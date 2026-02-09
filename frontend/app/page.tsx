import Link from 'next/link';

export default function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  const githubLoginUrl = `${backendUrl}/api/connect/github`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Social Auth
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Sign in with your GitHub account
        </p>
        
        <Link
          href={githubLoginUrl}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.19.092-.926.35-1.546.636-1.903-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.268.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.19 20 14.434 20 10.017 20 4.484 15.522 0 10 0z" clipRule="evenodd" />
          </svg>
          Sign in with GitHub
        </Link>
      </div>
    </main>
  );
}