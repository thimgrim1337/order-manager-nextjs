import { ReactNode } from 'react';
import {
  Dialog as DialogWrapper,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export default function Dialog({
  title,
  description,
  isOpen,
  onOpenChange,
  className,
  children,
}: {
  title: ReactNode;
  description: string;

  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <DialogWrapper open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className='group'>
          <Plus className='transition-transform group-hover:rotate-45 group-hover:scale-125' />
        </Button>
      </DialogTrigger>

      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </DialogWrapper>
  );
}
