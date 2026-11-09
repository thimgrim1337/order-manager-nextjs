import { cn } from 'cn';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { STATUS_PRESENTATIONS } from '@/features/shared/lib/status-presentation';
import type { OrderReadModel } from '@/lib/dal/order.dal';

type OrderStatusMenu = {
  order: OrderReadModel;
  /** The Status whose change is running; every button is disabled while one is. */
  sendingStatusId: number | undefined;
  onStatusChange: (statusId: number, label: string) => void;
};

export default function OrderStatusMenu({
  order,
  sendingStatusId,
  onStatusChange,
}: OrderStatusMenu) {
  const id = useId();
  return (
    <div className="space-y-3">
      {STATUS_PRESENTATIONS.map((status) => {
        const Icon = status.icon;
        const labelId = `${id}-${status.id}-label`;
        const descriptionId = `${id}-${status.id}-description`;
        return (
          <Button
            key={status.id}
            variant={'outline'}
            className={cn(
              'w-full justify-start h-auto p-4 text-left',
              order.status.id === status.id ? 'font-bold' : undefined,
            )}
            disabled={sendingStatusId !== undefined}
            onClick={() => onStatusChange(status.id, status.label)}
            aria-labelledby={labelId}
            aria-describedby={descriptionId}
          >
            <div className="flex items-start gap-3">
              <Icon className="size-6 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <div
                  id={labelId}
                  className={cn(order.status.id === status.id ? 'font-extrabold' : 'font-medium')}
                >
                  {status.label}
                </div>
                <div id={descriptionId} className="text-sm text-muted-foreground">
                  {sendingStatusId === status.id ? 'Wysyłanie' : status.description}
                </div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
