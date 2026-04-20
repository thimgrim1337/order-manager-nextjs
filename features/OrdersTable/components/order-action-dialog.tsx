import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type ActionDialogProps = {
	modalIcon: ReactNode;
	modalTitle: string;
	description: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
	triggerIcon?: ReactNode;
	triggerTitle?: string;
	className?: string;
};

export default function OrderActionDialog(props: ActionDialogProps) {
	return (
		<Dialog onOpenChange={props.onOpenChange} open={props.isOpen}>
			<DialogTrigger asChild>
				<Button
					variant={"ghost"}
					className="w-full justify-start"
					aria-label={`order ${props.triggerTitle}`.toLowerCase()}
				>
					{props.modalIcon || props.triggerIcon}
					{props.triggerTitle}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{props.modalIcon}
						{props.modalTitle}
					</DialogTitle>
					<DialogDescription>{props.description}</DialogDescription>
				</DialogHeader>
				{props.children}
			</DialogContent>
		</Dialog>
	);
}
