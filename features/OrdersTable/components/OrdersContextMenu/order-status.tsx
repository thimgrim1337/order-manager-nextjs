import { cn } from 'cn';
import { Ban, CheckCircle, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { changeOrderStatus } from '@/lib/actions';
import type { Order } from '@/types/types';

const statusConfig = {
  pending: {
    id: 1,
    label: 'w trakcie',
    icon: Truck,
    description: 'Zlecenie zostało rozpoczęte.',
  },
  cannceled: {
    id: 2,
    label: 'anulowane',
    icon: Ban,
    description: 'Zlecenie zostało anulowane.',
  },
  delivered: {
    id: 3,
    label: 'zakończone',
    icon: CheckCircle,
    description: 'Zlecenie zostało zakończone.',
  },
};

type OrderStatusMenu = {
  order: Order;
  onDialogClose: () => void;
};

export default function OrderStatusMenu({ order, onDialogClose }: OrderStatusMenu) {
  async function handleStatusChange(orderId: number, statusId: number) {
    try {
      const response = await changeOrderStatus(orderId, statusId);
      if (!response.success)
        toast.error('Niepowodzenie', { description: response.message, richColors: true });
    } catch (error) {
      toast.error('Niepowodzenie', {
        description: `Nieoczekiwany błąd ${error}`,
        richColors: true,
      });
    }
    onDialogClose();
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
            onClick={async () => handleStatusChange(order.id, config.id)}
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
