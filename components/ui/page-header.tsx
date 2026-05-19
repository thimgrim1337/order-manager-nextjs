type PageHeaderProps = {
	title: string;
	subText: string;
};

export default function PageHeader({ title, subText }: PageHeaderProps) {
	return (
		<header>
			<h2 className="pb-2 text-3xl tracking-tight font-medium border-b ">
				{title}
			</h2>
			<p className="text-muted-foreground tracking-tight">{subText}</p>
		</header>
	);
}
