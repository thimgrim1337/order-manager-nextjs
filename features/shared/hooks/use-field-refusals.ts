import type { AnyFieldMetaBase, DeepKeys } from '@tanstack/react-form';
import { useEffect, useRef } from 'react';
import type { FailureReason, Refusal } from '@/lib/action-response';

/** A refusal a form shows on one of its fields instead of a toast. */
export type FieldRefusal<TValues> = {
  reason: FailureReason;
  /** The field showing the refusal's message. */
  field: DeepKeys<TValues>;
  /** The fields whose change, typed or set from code, makes the refusal stop applying. */
  clearedBy: DeepKeys<TValues>[];
};

/**
 * The part of a TanStack form the refusals write: `AnyFormApi` would lose the field names
 * `DeepKeys<TValues>` checks, and `FormApi` takes a dozen validator generics this hook never reads.
 */
type RefusalForm<TValues> = {
  setFieldMeta(
    field: DeepKeys<TValues>,
    updater: (meta: AnyFieldMetaBase) => AnyFieldMetaBase,
  ): void;
};

/**
 * Shows a form's declared refusals on their fields. `listeners` go in the form's options: a change
 * of a mounted `clearedBy` field, typed or through `setFieldValue`, drops the refusal from its
 * field's `errorMap.onServer`, which TanStack clears only on a field with its own validators.
 * `showOnField(form)` is `settleWrite`'s `showOnField`; once the form is gone, a refusal has no
 * field left to show on, so it gets the toast.
 */
export function useFieldRefusals<TValues>(refusals: readonly FieldRefusal<TValues>[]) {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    listeners: {
      onChange: ({
        formApi,
        fieldApi,
      }: {
        formApi: RefusalForm<TValues>;
        fieldApi: { name: string };
      }) => {
        for (const refusal of refusals) {
          if (refusal.clearedBy.some((field) => field === fieldApi.name)) {
            dropRefusal(formApi, refusal.field);
          }
        }
      },
    },
    showOnField:
      (form: RefusalForm<TValues>) =>
      ({ reason, message }: Refusal): boolean => {
        const declared = refusals.find((refusal) => refusal.reason === reason);
        if (!declared || !isMounted.current) return false;
        showRefusal(form, declared.field, message);
        return true;
      },
  };
}

const showRefusal = <TValues>(
  form: RefusalForm<TValues>,
  field: DeepKeys<TValues>,
  message: string,
) =>
  form.setFieldMeta(field, (meta) => ({
    ...meta,
    errorMap: { ...meta.errorMap, onServer: { message } },
  }));

const dropRefusal = <TValues>(form: RefusalForm<TValues>, field: DeepKeys<TValues>) =>
  form.setFieldMeta(field, (meta) => ({
    ...meta,
    errorMap: { ...meta.errorMap, onServer: undefined },
  }));
