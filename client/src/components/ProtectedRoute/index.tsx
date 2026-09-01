import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check local hydration
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated && !token) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, token, router]);

  if (!hydrated || (!isAuthenticated && !token)) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
