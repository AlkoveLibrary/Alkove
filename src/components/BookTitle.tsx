type BookTitleProps = {
  title: string;
  subtitle?: string | null;
};

export function BookTitle({ title, subtitle }: BookTitleProps) {
  return (
    <>
      {title}
      {subtitle && (
        <>
          : <em>{subtitle}</em>
        </>
      )}
    </>
  );
}
