import { SquarePen } from "lucide-react";
import EditOrderForm from "@/features/OrderForm/components/edit-order-form";
import useToggle from "@/features/shared/hooks/useToggle";
import { Order } from "@/types/types";
import OrderActionDialog from "./order-action-dialog";

export default function OrderActionEdit({ order }: { order: Order }) {
	const [isModalOpen, { toggle: toggleModal, setFalse: closeModal }] =
		useToggle();

	return (
		<OrderActionDialog
			isOpen={isModalOpen}
			onOpenChange={toggleModal}
			icon={<SquarePen />}
			title="Edycja danych zlecenia"
			description={`Wprowadź dane aby edytować zlecenie nr ${order.orderNr}`}
			triggerTitle="Edycja"
			className="min-w-5xl"
		>
			<EditOrderForm order={order} onDialogClose={closeModal} />
		</OrderActionDialog>
	);
}
