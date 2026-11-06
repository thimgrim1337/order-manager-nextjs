import { cn } from 'cn';
import { Ban, CheckCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { settleWrite } from '@/features/shared/lib/settle-write';
import { changeOrderStatus } from '@/lib/actions';
import { ORDER_STATUS } from '@/lib/consts';
import type { OrderReadModel } from '@/lib/dal/order.dal';

const statusConfig = {
  pending: {
    id: ORDER_STATUS.InProgress,
    label: 'w trakcie',
    icon: Truck,
    description: 'Zlecenie zostało rozpoczęte.',
  },
  cancelled: {
    id: ORDER_STATUS.Cancelled,
    label: 'anulowane',
    icon: Ban,
    description: 'Zlecenie zostało anulowane.',
  },
  delivered: {
    id: ORDER_STATUS.Delivered,
    label: 'zakończone',
    icon: CheckCircle,
    description: 'Zlecenie zostało zakończone.',
  },
};

type OrderStatusMenu = {
  order: OrderReadModel;
  onDialogClose: () => void;
};

export default function OrderStatusMenu({ order, onDialogClose }: OrderStatusMenu) {
  async function handleStatusChange(statusId: number, label: string) {
    await settleWrite(() => changeOrderStatus(order.id, statusId), {
      closeDialog: onDialogClose,
      successDescription: `Zlecenie ${order.orderNr} ma teraz status: ${label}.`,
    });
  }

  return (
    <div className="space-y-3">
      {Object.entries(statusConfig).map(([status, config]) => {
        const Icon = config.icon;
        return (
          <Button
            key={status}
            variant={'outline'}
            className={cn(
              'w-full justify-start h-auto p-4 text-left',
              order.status.id === config.id ? 'font-bold' : undefined,
            )}
            onClick={() => handleStatusChange(config.id, config.label)}
            aria-label={`status-${status}`}
          >
            <div className="flex items-start gap-3">
              <Icon className="size-6 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <div
                  className={cn(order.status.id === config.id ? 'font-extrabold' : 'font-medium')}
                >
                  {config.label}
                </div>
                <div className="text-sm text-muted-foreground">{config.description}</div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
