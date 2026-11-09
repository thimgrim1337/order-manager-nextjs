import { Badge } from '@/components/ui/badge';
import { statusPresentation } from '@/features/shared/lib/status-presentation';

export default function StatusBadge({ statusId }: { statusId: number }) {
  const { color, label } = statusPresentation(statusId);

  return <Badge className={color}>{label}</Badge>;
}
