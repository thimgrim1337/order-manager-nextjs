import { Trash } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteOrder } from "@/lib/actions";
import { OrderWithDetailsDto } from "@/lib/dto/order.dto";

export default function OrderActionRemove({
	order,
}: {
	order: OrderWithDetailsDto;
}) {
	async function handleClick(orderId: number) {
		await deleteOrder(orderId);
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					className="w-full justify-start text-destructive"
					aria-label="order remove"
				>
					<Trash />
					Usuń
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Czy jesteś pewny ?</AlertDialogTitle>
					<AlertDialogDescription>
						Ta czynność jest nieodwracalna. Zlecenie zostanie usunięte z bazy.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Anuluj</AlertDialogCancel>
					<AlertDialogAction
						variant={"destructive"}
						onClick={() => handleClick(order.id)}
					>
						Usuń
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
