'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';
import { ENV } from '@/env';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);
  // const isDev = ENV.NODE_ENV !== 'production';
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <main className='flex h-full flex-col items-center justify-center'>
      <div className='w-full max-w-xl'>
        <div>
          <h2>Oops! Something went wrong</h2>
          <p>We&apos;re sorry, but we encountered an unexpected error.</p>
        </div>

        <div className='mt-4 space-y-4'>
          <Button className='w-full' onClick={reset}>
            Try again
          </Button>
          <Button asChild className='w-full' variant='outline'>
            <Link href={'/'}>Return to homepage</Link>
          </Button>
          {isDev ? (
            <div className='rounded-md bg-muted p-4'>
              <h3 className='mb-2 font-semibold'>Error Message:</h3>
              <p className='mb-4 text-sm'>{error.message}</p>
              <h3 className='mb-2 font-semibold'>Stack Trace:</h3>
              <pre className='overflow-x-auto whitespace-pre-wrap text-xs'>
                {error.stack}
              </pre>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
