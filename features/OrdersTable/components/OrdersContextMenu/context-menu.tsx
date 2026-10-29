import { type ReactElement, useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import type { Order } from '@/types/types';
import ContextMenuOrderEdit from './context-menu-edit';
import ContextMenuRemove from './context-menu-remove';
import ContextMenuStatus from './context-menu-status';

export type ContextMenuOptionProps = {
  order: Order;
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

type OpenDialog = 'edit' | 'status' | 'remove' | null;

export default function OrdersContextMenu({
  order,
  children,
}: {
  order: Order;
  children: ReactElement;
}) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);

  // A late close from one dialog must not close another that opened since.
  const dialogProps = (dialog: Exclude<OpenDialog, null>): ContextMenuOptionProps => ({
    order,
    isModalOpen: openDialog === dialog,
    onOpenChange: (open) =>
      setOpenDialog((current) => {
        if (open) return dialog;
        return current === dialog ? null : current;
      }),
  });

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={children} />
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setOpenDialog('status')}>Status</ContextMenuItem>
          <ContextMenuItem onClick={() => setOpenDialog('edit')}>Edycja</ContextMenuItem>
          <ContextMenuItem variant="destructive" onClick={() => setOpenDialog('remove')}>
            Usuń
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <ContextMenuOrderEdit {...dialogProps('edit')} />
      <ContextMenuStatus {...dialogProps('status')} />
      <ContextMenuRemove {...dialogProps('remove')} />
    </>
  );
}
