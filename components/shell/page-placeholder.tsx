export function PagePlaceholder({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <div className="space-y-3 text-center">
        <div className="text-5xl">{icon}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </div>
  );
}
