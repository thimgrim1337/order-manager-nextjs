import { ReactNode } from 'react';
import {
  Dialog as DialogWrapper,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Dialog({
  trigger,
  title,
  description,
  isOpen,
  onOpenChange,
  className,
  children,
}: {
  title: string;
  description: string;
  trigger: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <DialogWrapper open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </DialogWrapper>
  );
}
