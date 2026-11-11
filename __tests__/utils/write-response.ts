import { type ActionResponse, type FailureReason, toActionResponse } from '@/lib/action-response';

/**
 * What a write's Server Action returns, built through the action's own translator: `succeeded()`
 * for a write that went through, with the written `data` for a test that reads it, or
 * `refused(reason)` with that failure's message.
 */
export const writeResponse = {
  succeeded: <T>(data = {} as T): ActionResponse<T> => toActionResponse<T>([null, data]),
  refused: <T>(reason: FailureReason): ActionResponse<T> => toActionResponse<T>([{ reason }, null]),
};
