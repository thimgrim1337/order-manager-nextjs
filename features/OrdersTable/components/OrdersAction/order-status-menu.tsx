import { Ban, CheckCircle, ClockCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import useToggle from "@/features/shared/hooks/useToggle";
import { patchOrder } from "@/lib/actions";
import { OrderWithDetailsDto } from "@/lib/dto/order.dto";
import { cn } from "@/lib/utils";
import OrderActionDialog from "./order-action-dialog";

const statusConfig = {
	pending: {
		id: 1,
		label: "w trakcie",
		icon: Truck,
		description: "Zlecenie zostało rozpoczęte.",
	},
	cannceled: {
		id: 2,
		label: "anulowane",
		icon: Ban,
		description: "Zlecenie zostało anulowane.",
	},
	delivered: {
		id: 3,
		label: "zakończone",
		icon: CheckCircle,
		description: "Zlecenie zostało zakończone.",
	},
};

export default function OrderStatusMenu({
	order,
}: {
	order: OrderWithDetailsDto;
}) {
	const [isModalOpen, { toggle: toggleModal, setFalse: closeModal }] =
		useToggle();

	async function handleClick(orderId: number, statusId: number) {
		await patchOrder(orderId, { statusId: statusId });
		closeModal();
	}

	return (
		<OrderActionDialog
			isOpen={isModalOpen}
			onOpenChange={toggleModal}
			modalIcon={<ClockCheck />}
			modalTitle="Zmiana statusu zlecenia"
			description={`Wybierz status dla zlecenia nr ${order?.orderNr}`}
			triggerTitle="Status"
		>
			<div className="space-y-3">
				{Object.entries(statusConfig).map(([status, config]) => {
					const Icon = config.icon;
					return (
						<Button
							key={status}
							variant={"outline"}
							className={cn(
								"w-full justify-start h-auto p-4 text-left",
								order.statusId === config.id ? "font-bold" : undefined,
							)}
							onClick={async () => handleClick(order.id, config.id)}
							aria-label={`status-${status}`}
						>
							<div className="flex items-start gap-3">
								<Icon className="size-6 mt-0.5 shrink-0" />
								<div className="space-y-1">
									<div
										className={cn(
											order.statusId === config.id
												? "font-extrabold"
												: "font-medium",
										)}
									>
										{config.label}
									</div>
									<div className="text-sm text-muted-foreground">
										{config.description}
									</div>
								</div>
							</div>
						</Button>
					);
				})}
			</div>
		</OrderActionDialog>
	);
}
