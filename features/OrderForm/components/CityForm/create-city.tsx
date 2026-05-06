"use client";

import { MapPinPlus } from "lucide-react";
import { Country } from "@/types/types";
import useToggle from "../../../shared/hooks/useToggle";
import FormDialog from "../ui/form-dialog";
import CreateCityForm from "./create-city-form";

export default function CreateCity({ countries }: { countries: Country[] }) {
	const [isModalOpen, { toggle: toggleModal, setFalse: closeModal }] =
		useToggle();

	return (
		<FormDialog
			isOpen={isModalOpen}
			onOpenChange={toggleModal}
			icon={<MapPinPlus />}
			title={"	Dodawanie nowego miejsca"}
			description="Wypełnij wszystkie pola aby dodać nowe miejsce."
			hideTriggerTitle
		>
			<div className="flex flex-col">
				<CreateCityForm countries={countries} onDialogClose={closeModal} />
			</div>
		</FormDialog>
	);
}
