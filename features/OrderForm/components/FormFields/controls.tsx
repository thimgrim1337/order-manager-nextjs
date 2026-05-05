import { Button } from "@/components/ui/button";
import { useFormContext } from "../../context/form-context";

export default function FormControls({
	id,
	isEditButton,
}: {
	id: string;
	isEditButton?: boolean;
}) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
			{([canSubmit, isSubmitting]) => (
				<div className="mt-5 flex gap-2">
					<Button
						type="submit"
						disabled={!canSubmit}
						form={id}
						onClick={form.handleSubmit}
					>
						{isSubmitting ? "Wysyłanie" : isEditButton ? "Edytuj" : "Dodaj"}
					</Button>
					<Button
						type="reset"
						variant={"secondary"}
						onClick={(e) => {
							e.preventDefault();
							form.reset();
						}}
					>
						Reset
					</Button>
				</div>
			)}
		</form.Subscribe>
	);
}
