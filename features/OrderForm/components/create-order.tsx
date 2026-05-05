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
			modalIcon={<FilePlus />}
			modalTitle={"Dodaj nowe zlecenie"}
			description="Wypełnij wszystkie pola aby dodać nowe zlecenie."
		>
			<CreateOrderForm onDialogClose={closeModal} />
		</FormDialog>
	);
}
