"use client";
import {
	ChevronsLeftRight,
	ClipboardList,
	Columns2,
	Settings,
	TableOfContents,
	Truck,
	User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
	const currentPath = usePathname();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="flex-row items-center">
				<div className="w-15 flex justify-center bg-sidebar-accent rounded p-2">
					<Image
						src={"/v-logo.svg"}
						alt="DEVIL Express logo"
						width={50}
						height={50}
					/>
				</div>
				<span
					className={`text- text-xl font-semibold group-data-[collapsible=icon]:hidden`}
				>
					DevXFlow
				</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Moduły</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									className="font-medium"
									render={
										<Link
											href={"/orders"}
											className={`w-full ${currentPath === "/orders" ? "font-bold" : undefined}`}
										>
											<ClipboardList />
											Zlecenia
										</Link>
									}
								/>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									className="font-medium"
									render={
										<Link href={"/board"}>
											<TableOfContents />
											Tablica
										</Link>
									}
								/>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									className="font-medium"
									render={
										<Link href={"/drivers"}>
											<User />
											Kierowcy
										</Link>
									}
								/>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									className="font-medium"
									render={
										<Link href={"/trucks"}>
											<Truck />
											Pojazdy
										</Link>
									}
								/>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Opcje</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									className="font-medium"
									render={
										<Link href={"/settings"}>
											<Settings />
											Ustawienia
										</Link>
									}
								/>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}

export function SidebarTrigger() {
	const { toggleSidebar } = useSidebar();

	return (
		<Button
			onClick={toggleSidebar}
			variant={"ghost"}
			className={"min-h-screen"}
		>
			<ChevronsLeftRight />
		</Button>
	);
}
