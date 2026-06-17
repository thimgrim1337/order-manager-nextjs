"use client";

import { use } from "react";
import { OrderTable } from "@/types/types";
import useTable from "../hooks/useTable";
import { columns } from "../lib/columns";
import { OrdersTableBody } from "./orders-table-body";
import { OrdersTablePagination } from "./orders-table-pagination";

interface OrdersTableProps {
	orders: Promise<OrderTable[]>;
	rowCount: number;
}

export default function OrdersTable({ orders, rowCount }: OrdersTableProps) {
	const ordersData = use(orders);

	const table = useTable({
		columns,
		data: ordersData,
		rowCount,
	});

	return (
		<>
			<OrdersTableBody columns={columns} table={table} />
			<OrdersTablePagination table={table} />
		</>
	);
}
