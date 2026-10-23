export default function QCTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 transition-all">
      {children}
    </div>
  );
}