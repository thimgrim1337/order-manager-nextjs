"use client";

import { HousePlus } from "lucide-react";
import Dialog from "@/components/dialog";
import useToggle from "../../../shared/hooks/useToggle";
import CreateCustomerForm from "./create-customer-form";

export default function CreateCustomer() {
	const [isModalOpen, { toggle: toggleModal, setFalse: closeModal }] =
		useToggle();

	return (
		<Dialog
			isOpen={isModalOpen}
			onOpenChange={toggleModal}
			titleIcon={<HousePlus />}
			title={"Dodawanie nowego zleceniodawcy"}
			description="Wypełnij wszystkie pola aby dodać nowego zleceniodawcę."
		>
			<CreateCustomerForm onDialogClose={closeModal} />
		</Dialog>
	);
}
