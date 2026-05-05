"use client";

import { useStore } from "@tanstack/react-form";
import { use, useEffect } from "react";
import { FieldGroup } from "@/components/ui/field";
import { useOrderData } from "@/features/shared/context/order-context";
import useFilters from "@/features/shared/hooks/useFilters";
import { updateOrder } from "@/lib/actions";
import { CURRENCIES } from "@/lib/consts";
import { Order } from "@/types/types";
import { useAppForm } from "../hooks/useAppForm";
import useCurrencyInfo from "../hooks/useCurrencyInfo";
import useFormSubmit from "../hooks/useFormSubmit";
import { orderFormOptions } from "../lib/order-form-options";
import CreateCity from "./CityForm/create-city";
import CreateCustomer from "./CustomerForm/create-customer";
import CustomersComboboxField from "./FormFields/customers-combobox";
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
			currency: order.currency,
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

	const { endDate, currency, currencyInfo } = useStore(
		form.store,
		(state) => state.values,
	);

	const { rate, isRateLoading, isRateError, rateError } =
		useCurrencyInfo(endDate);

	useEffect(() => {
		if (currency === "EUR" && rate?.rates[0])
			form.setFieldValue("currencyInfo", {
				date: rate.rates[0].effectiveDate,
				rate: rate.rates[0].mid.toString(),
				table: rate.rates[0].no,
			});
	}, [currency, rate, form]);

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
							{() => <CustomersComboboxField customers={[order.customer]} />}
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
							{(field) => {
								return (
									<field.PlaceField
										label="Miejsca załadunku"
										cities={cities}
										countries={countries}
										comboboxWidth="w-104"
									/>
								);
							}}
						</form.AppField>
						<CreateCity countries={countries} />
					</div>
					<form.AppField name="unloadingPlaces" mode="array">
						{(field) => {
							return (
								<field.PlaceField
									label="Miejsca rozładunku"
									cities={cities}
									countries={countries}
									comboboxWidth="w-115"
								/>
							);
						}}
					</form.AppField>
				</FieldGroup>
				<FieldGroup className={fieldGroupStyle}>
					<form.AppField name="priceCurrency">
						{(field) => (
							<field.InputField label="Cena w walucie" type="number" min={0} />
						)}
					</form.AppField>
					<form.AppField
						name="currency"
						validators={{
							onChangeAsync: async ({ value }) => {
								if (value !== "EUR") return null;

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
								data={CURRENCIES.map((currency) => ({
									value: currency,
								}))}
							>
								<CurrencyInfo
									isLoading={isRateLoading}
									selectedCurrency={currency}
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
									id: truck.id,
									value: truck.plate,
								}))}
								label="Pojazd"
								placeholder="Wybierz pojazd"
								comboboxWidth="w-115"
							/>
						)}
					</form.AppField>
					<form.AppField name="driverId">
						{(field) => (
							<field.ComboboxField
								data={drivers.map((driver) => ({
									id: driver.id,
									value: `${driver.firstName} ${driver.lastName}`,
								}))}
								label="Kierowca"
								placeholder="Wybierz kierowcę"
								comboboxWidth="w-115"
							/>
						)}
					</form.AppField>
				</FieldGroup>

				<form.FormControls id={form.formId} isEditButton />
			</form.AppForm>
		</form>
	);
}
