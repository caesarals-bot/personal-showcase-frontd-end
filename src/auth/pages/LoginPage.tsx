import { LoginForm } from '../components/LoginForm';
import { DevQuickLogin } from '@/components/dev/DevQuickLogin';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4">
        <DevQuickLogin />
        <LoginForm />
      </div>
    </div>
  );
}