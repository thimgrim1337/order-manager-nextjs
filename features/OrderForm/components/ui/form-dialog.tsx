import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dialog, { DialogProps } from "@/features/shared/components/ui/dialog";

export type FormDialogProps = Omit<DialogProps, "trigger"> &
	(
		| {
				/** The trigger's visible text, and so its accessible name; defaults to `title`. */
				triggerTitle?: string;
				hideTriggerTitle?: false;
		  }
		| {
				hideTriggerTitle: true;
				/** The icon-only trigger's accessible name, in Polish. */
				triggerAriaLabel: string;
		  }
	);

export default function FormDialog(props: FormDialogProps) {
	const trigger = (
		<Button
			className={"group font-medium flex"}
			aria-label={props.hideTriggerTitle ? props.triggerAriaLabel : undefined}
		>
			{props.hideTriggerTitle ? null : (props.triggerTitle ?? props.title)}
			<Plus className="transition-transform group-hover:rotate-45 group-hover:scale-125" />
		</Button>
	);
	return (
		<Dialog {...props} trigger={trigger}>
			{props.children}
		</Dialog>
	);
}
