import { useForm } from '@tanstack/react-form';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { type FieldRefusal, useFieldRefusals } from '@/features/shared/hooks/use-field-refusals';
import type { FailureReason, Refusal } from '@/lib/action-response';
import { writeResponse } from '../utils/write-response';

const ORDER_NR_TAKEN = 'Zlecenie o tym numerze już istnieje.';

const refused = (reason: FailureReason) => writeResponse.refused(reason) as Refusal;

type Rendered = {
  showOnField: (refusal: Refusal) => boolean;
  setFieldValue: (name: keyof Values, value: string) => void;
};

type Values = { owner: string; code: string; note: string };

/** A taken code, shown on it and cleared once it or its owner changes. */
const REFUSALS: FieldRefusal<Values>[] = [
  { reason: 'OrderNrTaken', field: 'code', clearedBy: ['code', 'owner'] },
];

function TakenCodeForm({ expose }: { expose: (rendered: Rendered) => void }) {
  const refusals = useFieldRefusals(REFUSALS);
  const form = useForm({
    defaultValues: { owner: 'DEVIL', code: 'ZL-12', note: '' } satisfies Values,
    listeners: refusals.listeners,
  });
  const showOnField = refusals.showOnField(form);
  expose({ showOnField, setFieldValue: (name, value) => form.setFieldValue(name, value) });

  return (
    <>
      {(['owner', 'code', 'note'] as const).map((name) => (
        <form.Field key={name} name={name}>
          {(field) => (
            <label>
              {name}
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <span>
                {(field.state.meta.errorMap.onServer as { message: string } | undefined)?.message}
              </span>
            </label>
          )}
        </form.Field>
      ))}
    </>
  );
}

const setup = () => {
  let rendered: Rendered | undefined;
  const result = render(
    <TakenCodeForm
      expose={(r) => {
        rendered = r;
      }}
    />,
  );
  if (!rendered) throw new Error('The form never rendered');
  return { ...(rendered as Rendered), user: userEvent.setup(), unmount: result.unmount };
};

describe('useFieldRefusals', () => {
  it('shows a declared refusal on its field, saying it did', async () => {
    const { showOnField } = setup();

    let shown = false;
    act(() => {
      shown = showOnField(refused('OrderNrTaken'));
    });

    expect(shown).toBe(true);
    expect(await screen.findByText(ORDER_NR_TAKEN)).toBeVisible();
  });

  it('leaves an undeclared refusal for the toast', () => {
    const { showOnField } = setup();

    expect(showOnField(refused('NotFound'))).toBe(false);
  });

  it('clears the refusal once a field it concerns is typed into', async () => {
    const { showOnField, user } = setup();
    act(() => void showOnField(refused('OrderNrTaken')));

    await user.type(screen.getByLabelText('owner'), 'X');

    expect(screen.queryByText(ORDER_NR_TAKEN)).toBeNull();
  });

  it('clears the refusal once a field it concerns is set from code', async () => {
    const { showOnField, setFieldValue } = setup();
    act(() => void showOnField(refused('OrderNrTaken')));

    act(() => setFieldValue('owner', 'ANGEL'));

    expect(screen.queryByText(ORDER_NR_TAKEN)).toBeNull();
  });

  it('keeps the refusal while a field it does not concern changes', async () => {
    const { showOnField, user } = setup();
    act(() => void showOnField(refused('OrderNrTaken')));

    await user.type(screen.getByLabelText('note'), 'X');

    expect(screen.getByText(ORDER_NR_TAKEN)).toBeVisible();
  });

  it('shows nothing once the form is gone, leaving the refusal for the toast', () => {
    const { showOnField, unmount } = setup();

    unmount();

    expect(showOnField(refused('OrderNrTaken'))).toBe(false);
  });
});
