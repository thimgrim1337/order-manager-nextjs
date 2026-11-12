import type { ReactElement } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import EditOrderDialog from '@/features/OrderForm/components/edit-order-dialog';
import { useWriteDialog, type WriteDialog } from '@/features/shared/hooks/use-write-dialog';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import ContextMenuRemove from './context-menu-remove';
import ContextMenuStatus from './context-menu-status';

export type ContextMenuOptionProps = {
  order: OrderReadModel;
  dialog: WriteDialog;
};

export default function OrdersContextMenu({
  order,
  children,
}: {
  order: OrderReadModel;
  children: ReactElement;
}) {
  const editDialog = useWriteDialog();
  const statusDialog = useWriteDialog();
  const removeDialog = useWriteDialog();

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={children} />
        <ContextMenuContent>
          <ContextMenuItem onClick={statusDialog.open}>Status</ContextMenuItem>
          <ContextMenuItem onClick={editDialog.open}>Edycja</ContextMenuItem>
          <ContextMenuItem variant="destructive" onClick={removeDialog.open}>
            Usuń
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <EditOrderDialog order={order} dialog={editDialog} />
      <ContextMenuStatus order={order} dialog={statusDialog} />
      <ContextMenuRemove order={order} dialog={removeDialog} />
    </>
  );
}
