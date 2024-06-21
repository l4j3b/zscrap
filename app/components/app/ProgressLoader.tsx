import { useEffect, useState } from 'react';

import { Progress } from '~/components/ui/progress';
import { cn } from '~/lib/utils';

interface ProgressLoaderProps {
  loading: boolean;
  relative?: boolean;
  background?: boolean;
  blocking?: boolean;
  className?: string;
  steps: {
    id: string;
    text: string;
    value: number;
    time: number;
  }[];
}

export function ProgressLoader({
  loading,
  relative,
  background,
  blocking = false,
  className,
  steps,
}: ProgressLoaderProps) {
  const [currentStep, setCurrentStep] = useState(steps[0].id);

  useEffect(() => {
    if (loading) {
      // We start how long since loading started
      const startTime = Date.now();

      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const step = steps.find((step) => elapsedTime <= step.time);

        if (step) {
          setCurrentStep(step.id);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCurrentStep(steps[0].id);
    }
  }, [loading, steps]);

  const { text, value } = steps.find((step) => step.id === currentStep) || {};

  return (
    <div
      className={'inset-0 z-40 flex items-center justify-center transition-all'}
      style={{
        position: relative ? 'absolute' : 'fixed',
        opacity: loading ? 1 : 0,
        pointerEvents: loading && blocking ? 'auto' : 'none',
        backgroundColor: background ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
      }}
    >
      <div
        className={`
          flex w-full max-w-xs flex-col gap-4 rounded-xl border p-6 opacity-[100] backdrop-blur
          md:max-w-md md:gap-6 md:p-8
        `}
      >
        {text && <p className="text-foreground">{text}</p>}
        <Progress value={value} className={cn('border', className)} />
      </div>
    </div>
  );
}
