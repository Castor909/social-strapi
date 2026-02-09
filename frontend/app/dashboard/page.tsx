import { LogoutButton } from '../components/LogoutButton';

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-300">You are logged in.</p>
        <LogoutButton />
      </div>
    </main>
  );
}