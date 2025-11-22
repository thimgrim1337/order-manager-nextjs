type PageHeaderProps = {
  title: string;
  subText: string;
};

export default function PageHeader({ title, subText }: PageHeaderProps) {
  return (
    <header>
      <h2 className='scroll-m-20 border-b pb-2 text-3xl tracking-tight first:mt-0'>
        {title}
      </h2>
      <p className='text-muted-foreground'>{subText}</p>
    </header>
  );
}
