"use client";

import { use } from "react";
import { OrderDto as Order } from "@/lib/dto/order.dto";
import useTable from "../hooks/useTable";
import { columns } from "../lib/columns";
import { OrdersTableBody } from "./orders-table-body";
import OrderTableFilter from "./orders-table-filter";
import { OrdersTablePagination } from "./orders-table-pagination";

interface OrdersTableProps {
	orders: Promise<Order[]>;
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
			<OrderTableFilter />
			<OrdersTableBody columns={columns} table={table} />
			<OrdersTablePagination table={table} />
		</>
	);
}
