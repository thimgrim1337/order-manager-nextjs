import { ReactNode } from "react";
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	Dialog as DialogPrimitive,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type DialogProps = {
	icon: ReactNode;
	title: string;
	description: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	trigger: ReactNode;
	children: ReactNode;
	className?: string;
};

export default function Dialog(props: DialogProps) {
	return (
		<DialogPrimitive open={props.isOpen} onOpenChange={props.onOpenChange}>
			<DialogTrigger asChild>{props.trigger}</DialogTrigger>
			<DialogContent
				className={cn(props.className)}
				onInteractOutside={(e) => {
					e.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{props.icon} {props.title}
					</DialogTitle>
					<DialogDescription>{props.description}</DialogDescription>
				</DialogHeader>
				{props.children}
			</DialogContent>
		</DialogPrimitive>
	);
}
