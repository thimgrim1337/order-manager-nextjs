import { Button } from "@/components/ui/button";
import { FormDialogProps } from "@/features/OrderForm/components/ui/form-dialog";
import Dialog from "@/features/shared/components/ui/dialog";

type ActionDialogProps = FormDialogProps;

// TODO: Podmienić na nowy dialog

export default function OrderActionDialog(props: ActionDialogProps) {
	const trigger = (
		<Button
			variant={"ghost"}
			className="w-full justify-start"
			aria-label={`order ${props.triggerTitle}`.toLowerCase()}
		>
			{props.icon}
			{props.triggerTitle}
		</Button>
	);

	return (
		<Dialog {...props} trigger={trigger}>
			{props.children}
		</Dialog>
	);
}
