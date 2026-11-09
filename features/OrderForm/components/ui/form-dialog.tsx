import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dialog, { DialogProps } from "@/features/shared/components/ui/dialog";

export type FormDialogProps = Omit<DialogProps, "trigger"> & {
	triggerTitle?: string;
	hideTriggerTitle?: boolean;
	/** The trigger's accessible name, in English; `title` stays the Polish heading. */
	triggerAriaLabel: string;
};

export default function FormDialog(props: FormDialogProps) {
	const triggerLabel = props.hideTriggerTitle
		? null
		: (props.triggerTitle ?? props.title);

	const trigger = (
		<Button className={"group font-medium flex"} aria-label={props.triggerAriaLabel}>
			{triggerLabel}

			<Plus className="transition-transform group-hover:rotate-45 group-hover:scale-125" />
		</Button>
	);
	return (
		<Dialog {...props} trigger={trigger}>
			{props.children}
		</Dialog>
	);
}
