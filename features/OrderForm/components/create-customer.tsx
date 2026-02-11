'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CreateCustomerForm from './create-customer-form';
import { HousePlus, Plus } from 'lucide-react';
import Dialog from '@/components/dialog';

export default function CreateCustomer() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      isOpen={open}
      onOpenChange={setOpen}
      title='Dodaj nowego zleceniodawcę'
      description='Wypełnij wszystkie pola aby dodać nowego zleceniodawcę.'
      trigger={
        <Button className='group'>
          <Plus className='transition-transform group-hover:rotate-45 group-hover:scale-125' />
        </Button>
      }
    >
      <div className='flex flex-col'>
        <HousePlus
          size={'8rem'}
          strokeWidth={'1.25px'}
          className='self-center'
        />
        <CreateCustomerForm onDialogOpenChange={setOpen} />
      </div>
    </Dialog>
  );
  1;
}
