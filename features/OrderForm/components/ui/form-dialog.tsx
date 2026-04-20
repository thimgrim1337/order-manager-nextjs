import { Plus } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Dialog as DialogWrapper,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type FormDialogProps = {
	modalIcon: ReactNode;
	modalTitle: string;
	description: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
	triggerIcon?: ReactNode;
	triggerTitle?: string;
	hideTriggerTitle?: boolean;
	className?: string;
};

export default function FormDialog(props: FormDialogProps) {
	return (
		<DialogWrapper open={props.isOpen} onOpenChange={props.onOpenChange}>
			<DialogTrigger asChild>
				<Button
					className={"group font-medium flex"}
					aria-label={props.modalTitle}
				>
					{props.hideTriggerTitle
						? undefined
						: props.triggerTitle || props.modalTitle}
					{props.triggerIcon || (
						<Plus className="transition-transform group-hover:rotate-45 group-hover:scale-125" />
					)}
				</Button>
			</DialogTrigger>

			<DialogContent className={cn("min-w-250 max-w-1/2", props.className)}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{props.modalIcon} {props.modalTitle}
					</DialogTitle>
					<DialogDescription>{props.description}</DialogDescription>
				</DialogHeader>
				{props.children}
			</DialogContent>
		</DialogWrapper>
	);
}
