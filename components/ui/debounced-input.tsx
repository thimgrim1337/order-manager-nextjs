import { InputHTMLAttributes, ReactNode, useEffect, useState } from "react";
import { Input } from "./input";

type DebouncedInputProps = {
	value: string;
	onChange: (value: string | number) => void;
	debounce?: number;
	children?: ReactNode;
};

export default function DebouncedInput({
	value: initialValue,
	onChange,
	debounce = 200,
	children,
	...props
}: DebouncedInputProps &
	Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
	const [value, setValue] = useState<string | number>(initialValue);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <Only want to re-render when value is change>
	useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value);
		}, debounce);

		return () => clearTimeout(timeout);
		//biome
	}, [value]);

	return (
		<>
			<Input
				{...props}
				value={value ?? ""}
				onChange={(e) => {
					if (e.target.value === "") return setValue("");
					if (props.type === "number") {
						setValue(e.target.valueAsNumber);
					} else {
						setValue(e.target.value);
					}
				}}
			/>
			{children}
		</>
	);
}
