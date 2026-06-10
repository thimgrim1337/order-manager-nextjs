import { Country } from "@/types/types";
import SelectField from "./select-field";
import "country-flag-icons/3x2/flags.css";
import useRecentValues from "../../hooks/useRecentValues";

export default function CountrySelectField({
	countries,
}: {
	countries: Country[];
}) {
	const data = countries.map((country) => ({
		label: `${country.code} ${country.name}`,
		value: country.id,
		icon: <span className={`flag:${country.code}`} />,
	}));

	const { recentValues, trackValue } = useRecentValues(data, "countryId");

	return (
		<SelectField
			label="Kod kraju"
			placeholder="Wybierz kraj"
			data={data}
			recentData={recentValues}
			onTrackValue={trackValue}
			showRecentList
		/>
	);
}
