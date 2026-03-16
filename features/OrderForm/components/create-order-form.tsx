"use client";

import { useStore } from "@tanstack/react-form";
import { useEffect } from "react";
import { FieldGroup } from "@/components/ui/field";
import { useFilters } from "@/features/OrdersTable/hooks/useFilters";
import { createOrder } from "@/lib/actions";
import { CURRENCIES } from "@/lib/consts";
import { City, Country, Customer, Driver, Truck } from "@/types/types";
import { useAppForm } from "../hooks/useAppForm";
import useCurrencyInfo from "../hooks/useCurrencyInfo";
import useFormSubmit from "../hooks/useFormSubmit";
import { orderFormOptions } from "../lib/order-form-options";
import CreateCity from "./CityForm/create-city";
import CreateCustomer from "./CustomerForm/create-customer";
import CurrencyInfo from "./currency-info";

export default function CreateOrderForm({
	customers,
	cities,
	drivers,
	trucks,
	countries,
	onDialogClose,
}: {
	customers: Customer[];
	cities: City[];
	drivers: Driver[];
	trucks: Truck[];
	countries: Country[];
	onDialogClose: () => void;
}) {
	const { setFilters, resetFilters } = useFilters();
	const { submitForm } = useFormSubmit({ action: createOrder, onDialogClose });

	const form = useAppForm({
		...orderFormOptions,
		onSubmit: async ({ value }) => {
			submitForm(value, {
				errorTitle: "Nie udało się utworzyć zlecenia",
				successTitle: "Pomyślnie utworzono nowe zlecenie",
				successDescription: `Pomyślnie utworzono zlecenie o numerze ${value.orderNr}.`,
			});
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

	const fieldGroupStyle = "grid grid-cols-2 pt-5";

	return (
		<form
			id="create-order-form"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppForm>
				<FieldGroup className="grid grid-cols-2">
					<div className="flex gap-2 items-end">
						<form.AppField name="customerId">
							{(field) => (
								<field.ComboboxField
									data={customers?.map((customer) => ({
										id: customer.id,
										value: customer.name,
									}))}
									onSearch={(value) => setFilters({ customer: value })}
									label="Zleceniodawca"
									placeholder="Wybierz zleceniodawcę"
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
					<div className="flex gap-2 items-end">
						<form.AppField name="loadingPlaces" mode="array">
							{(field) => {
								return (
									<field.PlaceField
										label="Miejsca załadunku"
										cities={cities}
										countries={countries}
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
							/>
						)}
					</form.AppField>
				</FieldGroup>

				<form.FormControls id={form.formId} />
			</form.AppForm>
		</form>
	);
}
