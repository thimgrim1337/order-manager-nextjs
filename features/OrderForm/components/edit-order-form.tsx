"use client";

import { useStore } from "@tanstack/react-form";
import { use, useEffect } from "react";
import { FieldGroup } from "@/components/ui/field";
import { useOrderData } from "@/features/shared/context/order-context";
import useFilters from "@/features/shared/hooks/useFilters";
import { updateOrder } from "@/lib/actions";

import { Order } from "@/types/types";
import { useAppForm } from "../hooks/useAppForm";
import useCurrencyInfo from "../hooks/useCurrencyInfo";
import useFormSubmit from "../hooks/useFormSubmit";
import { orderFormOptions } from "../lib/order-form-options";
import CreateCity from "./CityForm/create-city";
import CreateCustomer from "./CustomerForm/create-customer";
import CurrencyInfo from "./ui/currency-info";

export default function EditOrderForm({
	order,
	onDialogClose,
}: {
	order: Order;
	onDialogClose: () => void;
}) {
	const data = useOrderData();
	const cities = use(data.cities);
	const drivers = use(data.drivers);
	const trucks = use(data.trucks);
	const countries = use(data.countries);
	const currencies = use(data.currencies);

	const { resetFilters } = useFilters();
	const { submitForm } = useFormSubmit(updateOrder, onDialogClose);

	const form = useAppForm({
		...orderFormOptions,
		defaultValues: {
			orderNr: order.orderNr,
			startDate: order.startDate,
			endDate: order.endDate,
			customerId: order.customerId,
			driverId: order.driverId,
			truckId: order.truckId,
			statusId: order.statusId,
			priceCurrency: order.priceCurrency,
			currencyId: order.currencyId,
			loadingPlaces: order.loadingPlaces,
			unloadingPlaces: order.unloadingPlaces,
			currencyInfo: {
				table: "",
				rate: "",
				date: "",
			},
		},
		onSubmit: async ({ value }) => {
			submitForm(
				value,
				{
					successDescription: `Pomyślnie zaktualizowano zlecenie o numerze ${value.orderNr}.`,
				},
				order.id,
			);
			resetFilters();
		},
	});

	const { endDate, currencyId, currencyInfo } = useStore(
		form.store,
		(state) => state.values,
	);

	const {
		rate,
		isLoading: isRateLoading,
		isRateError,
		rateError,
	} = useCurrencyInfo(endDate);

	useEffect(() => {
		if (currencyId === 2 && rate?.rates[0])
			form.setFieldValue("currencyInfo", {
				date: rate.rates[0].effectiveDate,
				rate: rate.rates[0].mid.toString(),
				table: rate.rates[0].no,
			});
	}, [currencyId, rate, form]);

	const fieldGroupStyle = "flex-row pt-5";

	return (
		<form
			id="create-order-form"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppForm>
				<FieldGroup className="flex-row justify-between">
					<div className="flex-1 flex gap-2 items-end min-w-0">
						<form.AppField name="customerId">
							{(field) => (
								<field.CustomersComboboxField
									customers={[order.customer]}
									label="Zleceniodawca"
								/>
							)}
						</form.AppField>
						<CreateCustomer />
					</div>

					<form.AppField name="orderNr">
						{(field) => <field.InputField label="Numer zlecenia" />}
					</form.AppField>
				</FieldGroup>
				<FieldGroup className={fieldGroupStyle}>
					<form.AppField name="startDate">
						{(field) => <field.DateField label="Data załadunku" />}
					</form.AppField>

					<form.AppField name="endDate">
						{(field) => <field.DateField label="Data rozładunku" />}
					</form.AppField>
				</FieldGroup>

				<FieldGroup className={fieldGroupStyle}>
					<div className="flex-1 flex gap-2 items-end">
						<form.AppField name="loadingPlaces" mode="array">
							{(field) => (
								<field.PlacesComboboxField
									cities={cities}
									countries={countries}
									label="Miejsca załadunku"
								/>
							)}
						</form.AppField>
						<CreateCity countries={countries} />
					</div>
					<form.AppField name="unloadingPlaces" mode="array">
						{(field) => (
							<field.PlacesComboboxField
								cities={cities}
								countries={countries}
								label="Miejsca rozaładunku"
							/>
						)}
					</form.AppField>
				</FieldGroup>
				<FieldGroup className={fieldGroupStyle}>
					<form.AppField name="priceCurrency">
						{(field) => (
							<field.InputField label="Cena w walucie" type="number" min={0} />
						)}
					</form.AppField>
					<form.AppField
						name="currencyId"
						validators={{
							onChangeAsync: async ({ value }) => {
								if (value !== 2) return null;

								if (isRateError)
									return {
										message:
											rateError?.message ||
											"Wystąpił błąd podczas pobierania kursu.",
									};
								return null;
							},
						}}
					>
						{(field) => (
							<field.SelectField
								label="Waluta"
								placeholder="Wybierz walutę"
								data={currencies.map((currency) => ({
									label: currency.code,
									value: currency.id,
								}))}
							>
								<CurrencyInfo
									isLoading={isRateLoading}
									selectedCurrency={currencyId}
									currencyInfo={currencyInfo}
								/>
							</field.SelectField>
						)}
					</form.AppField>
				</FieldGroup>
				<FieldGroup className={fieldGroupStyle}>
					<form.AppField
						name="truckId"
						listeners={{
							onChange: ({ value }) => {
								const assignedDriver = trucks.filter(
									(truck) => truck.id === value,
								)[0]?.driverId;

								if (assignedDriver)
									form.setFieldValue("driverId", assignedDriver);
							},
						}}
					>
						{(field) => (
							<field.ComboboxField
								data={trucks.map((truck) => ({
									value: truck.id,
									label: truck.plate,
								}))}
								label="Pojazd"
								placeholder="Wybierz pojazd"
							/>
						)}
					</form.AppField>
					<form.AppField name="driverId">
						{(field) => (
							<field.ComboboxField
								data={drivers.map((driver) => ({
									value: driver.id,
									label: `${driver.firstName} ${driver.lastName}`,
								}))}
								label="Kierowca"
								placeholder="Wybierz kierowcę"
							/>
						)}
					</form.AppField>
				</FieldGroup>

				<form.FormControls id={form.formId} isEditButton />
			</form.AppForm>
		</form>
	);
}
