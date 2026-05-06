"use client";

import { FilePlus } from "lucide-react";
import useToggle from "../../shared/hooks/useToggle";
import CreateOrderForm from "./create-order-form";
import FormDialog from "./ui/form-dialog";

export default function CreateOrder() {
	const [isModalOpen, { toggle: toggleModal, setFalse: closeModal }] =
		useToggle();

	return (
		<FormDialog
			isOpen={isModalOpen}
			onOpenChange={toggleModal}
			icon={<FilePlus />}
			title={"Dodaj nowe zlecenie"}
			description="Wypełnij wszystkie pola aby dodać nowe zlecenie."
			className="min-w-5xl"
		>
			<CreateOrderForm onDialogClose={closeModal} />
		</FormDialog>
	);
}
