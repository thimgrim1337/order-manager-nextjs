import { Plus } from "lucide-react";
import { ReactNode } from "react";
import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Dialog as DialogWrapper,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

export default function Dialog({
	titleIcon,
	title,
	description,
	isOpen,
	onOpenChange,
	className,
	children,
}: {
	titleIcon: ReactNode;
	title: string;
	description: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
	className?: string;
}) {
	return (
		<DialogWrapper open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button className="group" aria-label={title}>
					<Plus className="transition-transform group-hover:rotate-45 group-hover:scale-125" />
				</Button>
			</DialogTrigger>

			<DialogContent className={className}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{titleIcon} {title}
					</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</DialogWrapper>
	);
}
