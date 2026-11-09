import { Ban, CheckCircle, type LucideIcon, Truck } from 'lucide-react';
import { ORDER_STATUS } from '@/lib/consts';

type StatusId = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export type StatusPresentation = {
  id: StatusId;
  /** The seeded Status name, shown in the UI. */
  label: string;
  /** English, for `aria-label`s. */
  accessibleName: string;
  /** Badge background. */
  color: string;
  icon: LucideIcon;
  description: string;
};

/** How every view shows each Status, in id order. */
export const STATUS_PRESENTATIONS: readonly StatusPresentation[] = [
  {
    id: ORDER_STATUS.InProgress,
    label: 'w trakcie',
    accessibleName: 'In progress',
    color: 'bg-amber-600',
    icon: Truck,
    description: 'Zlecenie zostało rozpoczęte.',
  },
  {
    id: ORDER_STATUS.Cancelled,
    label: 'anulowane',
    accessibleName: 'Cancelled',
    color: 'bg-red-600',
    icon: Ban,
    description: 'Zlecenie zostało anulowane.',
  },
  {
    id: ORDER_STATUS.Delivered,
    label: 'zakończone',
    accessibleName: 'Delivered',
    color: 'bg-green-600',
    icon: CheckCircle,
    description: 'Zlecenie zostało zakończone.',
  },
];

export function statusPresentation(id: number): StatusPresentation {
  const presentation = STATUS_PRESENTATIONS.find((p) => p.id === id);
  if (!presentation) throw new Error(`Status ${id} has no presentation`);
  return presentation;
}
