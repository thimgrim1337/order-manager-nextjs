"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/dates";
import { OrderWithDetailsDto as Order } from "@/lib/dto/order.dto";
import OrderActionMenu from "../components/OrdersAction/order-action-menu";
import StatusBadge from "../components/ui/status-bagde";

export const columns: ColumnDef<Order>[] = [
	{
		accessorKey: "orderNr",
		header: "Nr zlecenia",
	},
	{
		accessorKey: "startDate",
		accessorFn: (order) => formatDate(order.startDate),
		header: "Data załadunku",
	},
	{
		accessorKey: "endDate",
		accessorFn: (order) => formatDate(order.endDate),
		header: "Data rozładunku",
	},
	{
		accessorKey: "loadingCity",
		header: " Miejsce załadunku",
	},
	{
		accessorKey: "unloadingCity",
		header: "Miejsce rozładunku",
	},
	{
		accessorKey: "statusId",
		cell: ({ row }) => {
			const statusId = row.getValue("statusId") as number;

			return (
				<StatusBadge statusId={statusId}>
					{row.original.status_name}
				</StatusBadge>
			);
		},
		header: "Status",
	},
	{
		accessorKey: "truckId",
		accessorFn: (order) => order.truck_plate,
		header: "Pojazd",
	},
	{
		accessorKey: "driverId",
		accessorFn: (order) => order.driver_fullname,
		header: "Kierowca",
	},
	{
		accessorKey: "customerId",
		cell: ({ row }) => (
			<div className="w-40 truncate">{row.original.customer_name}</div>
		),
		header: "Klient",
	},
	{
		accessorKey: "priceCurrency",
		header: "Cena",
		cell: ({ row }) => {
			const price = parseFloat(row.getValue("priceCurrency"));
			const formatted = new Intl.NumberFormat("pl-PL").format(price);
			return <div className="text-right font-medium">{formatted}</div>;
		},
	},

	{
		accessorKey: "currency_code",
		header: "Waluta",
		cell: ({ row }) => (
			<div className="text-right">{row.original.currency_code}</div>
		),
	},
	{
		accessorKey: "pricePLN",
		header: "Cena (PLN)",
		cell: ({ row }) => {
			const price = parseFloat(row.getValue("pricePLN"));

			const formatted = new Intl.NumberFormat("pl-PL", {
				style: "currency",
				currency: "PLN",
			}).format(price);
			return (
				<div className="text-right font-medium text-red-600 ">{formatted}</div>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return (
				<div className="opacity-0 transition-opacity group-hover:opacity-100">
					<OrderActionMenu order={row.original} />
				</div>
			);
		},
	},
];
