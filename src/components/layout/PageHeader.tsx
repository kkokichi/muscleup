interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-end justify-between gap-3">
      <div>
        {subtitle && (
          <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground">
            {subtitle}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {action}
    </header>
  );
}
