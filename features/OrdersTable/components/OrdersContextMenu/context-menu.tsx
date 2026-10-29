import type { ReactElement } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import useToggle from '@/features/shared/hooks/use-toggle';
import type { Order } from '@/types/types';
import ContextMenuOrderEdit from './context-menu-edit';
import ContextMenuRemove from './context-menu-remove';
import ContextMenuStatus from './context-menu-status';

export type ContextMenuOptionProps = {
  order: Order;
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function OrdersContextMenu({
  order,
  children,
}: {
  order: Order;
  children: ReactElement;
}) {
  const [isEditOpen, { setTrue: openEdit, setValue: setIsEditOpen }] = useToggle();

  const [isStatusOpen, { setTrue: openStatus, setValue: setIsStatusOpen }] = useToggle();

  const [isRemoveOpen, { setTrue: openRemove, setValue: setIsRemoveOpen }] = useToggle();

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={children} />
        <ContextMenuContent>
          <ContextMenuItem onClick={() => openStatus()}>Status</ContextMenuItem>
          <ContextMenuItem onClick={() => openEdit()}>Edycja</ContextMenuItem>
          <ContextMenuItem variant="destructive" onClick={() => openRemove()}>
            Usuń
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <ContextMenuOrderEdit order={order} isModalOpen={isEditOpen} onOpenChange={setIsEditOpen} />
      <ContextMenuStatus order={order} isModalOpen={isStatusOpen} onOpenChange={setIsStatusOpen} />
      <ContextMenuRemove order={order} isModalOpen={isRemoveOpen} onOpenChange={setIsRemoveOpen} />
    </>
  );
}
