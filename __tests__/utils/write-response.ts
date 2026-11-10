import { type ActionResponse, type FailureReason, toActionResponse } from '@/lib/action-response';

/**
 * What a write's Server Action returns, built through the action's own translator: `succeeded()`
 * for a write that went through, whose data the tests never read, or `refused(reason)` with that
 * failure's message.
 */
export const writeResponse = {
  succeeded: <T>(): ActionResponse<T> => toActionResponse<T>([null, {} as T]),
  refused: <T>(reason: FailureReason): ActionResponse<T> => toActionResponse<T>([{ reason }, null]),
};
