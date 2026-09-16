import { ReactElement, ReactNode } from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  Dialog as DialogPrimitive,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type DialogProps = {
  icon: ReactNode;
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  description?: string;
  className?: string;
  trigger?: ReactElement;
};

export default function Dialog(props: DialogProps) {
  return (
    <DialogPrimitive
      open={props.isOpen}
      onOpenChange={props.onOpenChange}
      disablePointerDismissal
    >
      {props.trigger && <DialogTrigger render={props.trigger} />}

      <DialogContent className={cn(props.className)}>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {props.icon} {props.title}
          </DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        {props.children}
      </DialogContent>
    </DialogPrimitive>
  );
}
