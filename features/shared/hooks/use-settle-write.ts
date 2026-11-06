import { useTransition } from 'react';
import type { ActionResponse } from '@/lib/action-response';
import { type SettleWriteOptions, settleWrite } from '../lib/settle-write';

/**
 * `settleWrite` for a dialog, with whether its write is still running, so the dialog can disable
 * its write buttons and ignore repeat clicks. Call it outside the dialog's content, which unmounts
 * on close, so a reopened dialog still knows its write runs.
 */
export function useSettleWrite() {
  const [isPending, startTransition] = useTransition();

  function settle<T>(action: () => Promise<ActionResponse<T>>, options: SettleWriteOptions) {
    startTransition(() => settleWrite(action, options));
  }

  return [isPending, settle] as const;
}
