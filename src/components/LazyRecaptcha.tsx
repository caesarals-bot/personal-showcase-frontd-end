import { lazy, Suspense, forwardRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy loading del componente reCAPTCHA
const RecaptchaWrapper = lazy(() => 
  import('./RecaptchaWrapper').then(module => ({ 
    default: module.RecaptchaWrapper 
  }))
);

interface LazyRecaptchaProps {
  onChange: (token: string | null) => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  className?: string;
}

// Componente de loading para reCAPTCHA
const RecaptchaLoading = () => (
  <div className="flex justify-center">
    <Skeleton className="h-[78px] w-[304px] rounded-md" />
  </div>
);

export const LazyRecaptcha = forwardRef<any, LazyRecaptchaProps>(
  (props, ref) => {
    return (
      <Suspense fallback={<RecaptchaLoading />}>
        <RecaptchaWrapper {...props} ref={ref} />
      </Suspense>
    );
  }
);

LazyRecaptcha.displayName = 'LazyRecaptcha';