export function Table({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-background sticky top-12 z-[1] h-4" />
      <div className="bg-card text-card-foreground @container rounded-xl border @4xl:rounded-t-none @4xl:border-t-0">
        {children}
      </div>
    </>
  );
}
