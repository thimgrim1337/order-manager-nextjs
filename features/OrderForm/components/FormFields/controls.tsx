import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '../../context/form-context';

export default function FormControls({
  id,
  isEditButton,
  isEditable = true,
  isBlocked = false,
  onEditBtnClick,
}: {
  id: string;
  isEditButton?: boolean;
  isEditable?: boolean;
  /** Keeps a valid form from saving, for what its fields don't validate. */
  isBlocked?: boolean;
  onEditBtnClick?: Dispatch<SetStateAction<boolean>>;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <div className="mt-5 flex gap-2">
          <Button
            type="submit"
            disabled={(!canSubmit || isBlocked) && isEditable}
            form={id}
            onClick={() => {
              onEditBtnClick?.(true);
              if (canSubmit && !isBlocked && isEditable) form.handleSubmit();
            }}
          >
            {isSubmitting ? 'Wysyłanie' : isEditButton && !isEditable ? 'Edytuj' : 'Zapisz'}
          </Button>
          <Button
            type="reset"
            variant={'secondary'}
            onClick={(e) => {
              e.preventDefault();
              onEditBtnClick?.(false);
              form.reset();
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </form.Subscribe>
  );
}
