import { Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderDto } from "@/lib/dto/order.dto";
import OrderActionRemove from "./order-action-remove";
import OrderActionStatus from "./orders-action-status";

export default function OrdersTableRowActions({ order }: { order: OrderDto }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" role="menu" aria-label="order actions">
					<Pen />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem asChild>
					<OrderActionStatus order={order} />
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Pen />
					Edytuj
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<OrderActionRemove order={order} />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
