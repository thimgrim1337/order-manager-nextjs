"use client";
import {
	ClipboardList,
	Columns2,
	Settings,
	TableOfContents,
	Truck,
	User,
} from "lucide-react";
import Image from "next/image";
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
	return (
		<Sidebar>
			<SidebarHeader className="flex-row items-center">
				<div className="w-15 flex justify-center bg-sidebar-accent rounded p-2">
					<Image
						src={"/v-logo.svg"}
						alt="DEVIL Express logo"
						width={50}
						height={50}
					/>
				</div>
				<span className="text- text-xl font-semibold">DevXFlow</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Moduły</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton className="font-medium">
									<ClipboardList />
									Zlecenia
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton className="font-medium">
									<TableOfContents />
									Tablica
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton className="font-medium">
									<User />
									Kierowcy
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton className="font-medium">
									<Truck />
									Pojazdy
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Opcje</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton className="font-medium">
									<Settings />
									Ustawienia
								</SidebarMenuButton>
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
		<Button onClick={toggleSidebar} variant={"ghost"}>
			<Columns2 />
		</Button>
	);
}
