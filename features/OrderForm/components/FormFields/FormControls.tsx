import { Button } from '@/components/ui/button';
import { useFormContext } from '../../context/form-context';

export default function FormControls({ id }: { id: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => (
        <div className='mt-5'>
          <Button
            type='submit'
            disabled={!canSubmit}
            form={id}
            onClick={form.handleSubmit}
          >
            {isSubmitting ? 'Wysyłanie' : 'Wyślij'}
          </Button>
          <Button
            type='reset'
            variant={'secondary'}
            onClick={(e) => {
              e.preventDefault();
              form.reset();
            }}
          >
            Reset
          </Button>
        </div>
      )}
    />
  );
}
