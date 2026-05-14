import { Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderWithDetailsDto } from "@/lib/dto/order.dto";
import OrderActionEdit from "./order-action-edit";
import OrderActionRemove from "./order-action-remove";
import OrderStatusMenu from "./order-status-menu";

export default function OrderActionMenu({
	order,
}: {
	order: OrderWithDetailsDto;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="outline" role="menu" aria-label="order actions">
						<Pen />
					</Button>
				}
			></DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem
					render={<OrderStatusMenu order={order} />}
				></DropdownMenuItem>
				<DropdownMenuItem
					render={<OrderActionEdit order={order} />}
				></DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					render={<OrderActionRemove order={order} />}
				></DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
