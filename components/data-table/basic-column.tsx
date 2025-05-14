export function BasicColumn({ header, children }: { header: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-sm @4xl:hidden">{header}</p>
      <p className="@4xl:text-muted-foreground">{children}</p>
    </div>
  );
}
