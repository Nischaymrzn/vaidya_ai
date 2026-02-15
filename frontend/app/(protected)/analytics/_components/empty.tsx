export default function Empty({ label }: { label: string }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-sm text-slate-500">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">No data</span>
      <span>{label}</span>
    </div>
  );
}
