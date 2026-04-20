"use client";

import { HousePlus } from "lucide-react";

import useToggle from "../../../shared/hooks/useToggle";
import FormDialog from "../ui/form-dialog";
import CreateCustomerForm from "./create-customer-form";

export default function CreateCustomer() {
	const [isModalOpen, { toggle: toggleModal, setFalse: closeModal }] =
		useToggle();

	return (
		<FormDialog
			isOpen={isModalOpen}
			onOpenChange={toggleModal}
			modalIcon={<HousePlus />}
			modalTitle={"Dodawanie nowego zleceniodawcy"}
			description="Wypełnij wszystkie pola aby dodać nowego zleceniodawcę."
			hideTriggerTitle
		>
			<CreateCustomerForm onDialogClose={closeModal} />
		</FormDialog>
	);
}
