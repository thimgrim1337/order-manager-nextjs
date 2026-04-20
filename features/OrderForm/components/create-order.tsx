"use client";

import { FilePlus } from "lucide-react";
import { use } from "react";
import { City, Country, Customer, Driver, Truck } from "@/types/types";
import useToggle from "../../shared/hooks/useToggle";
import CreateOrderForm from "./create-order-form";
import FormDialog from "./ui/form-dialog";

export default function CreateOrder({
	customers,
	cities,
	drivers,
	trucks,
	countries,
}: {
	customers: Promise<Customer[]>;
	cities: Promise<City[]>;
	drivers: Promise<Driver[]>;
	trucks: Promise<Truck[]>;
	countries: Promise<Country[]>;
}) {
	const [isModalOpen, { toggle: toggleModal, setFalse: closeModal }] =
		useToggle();
	const customersData = use(customers);
	const citiesData = use(cities);
	const driversData = use(drivers);
	const trucksData = use(trucks);
	const countryData = use(countries);

	return (
		<FormDialog
			isOpen={isModalOpen}
			onOpenChange={toggleModal}
			modalIcon={<FilePlus />}
			modalTitle={"Dodaj nowe zlecenie"}
			description="Wypełnij wszystkie pola aby dodać nowe zlecenie."
		>
			<CreateOrderForm
				customers={customersData}
				cities={citiesData}
				drivers={driversData}
				trucks={trucksData}
				countries={countryData}
				onDialogClose={closeModal}
			/>
		</FormDialog>
	);
}
