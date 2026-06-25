export default function TimelinePlaceCell({
	cityName,
	countryCode,
}: {
	cityName: string;
	countryCode: string | undefined;
}) {
	return (
		<div className="flex gap-2 items-center">
			<span className={`flag:${countryCode}`} />
			<span>{cityName}</span>
		</div>
	);
}
