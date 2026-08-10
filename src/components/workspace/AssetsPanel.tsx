import { FileStack, Filter } from 'lucide-react';
import { Card, IconButton } from '../ui';

export function AssetsPanel({ icon }: { icon?: React.ReactNode }) {
  return (
    <Card className="flex min-h-[270px] min-w-0 flex-col p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-violet-50 p-2 text-primary">
            {icon ?? <FileStack size={17} />}
          </span>
          <h3 className="font-bold text-slate-700">My Assets</h3>
        </div>
        <IconButton label="Asset options">
          <Filter size={15} />
        </IconButton>
      </div>
      <div className="mt-4 flex gap-1 rounded-xl bg-slate-50 p-1 text-[10px] font-semibold text-slate-400">
        <span className="rounded-lg bg-primary px-3 py-1.5 text-white">All</span>
        <span className="px-2 py-1.5">Videos</span>
        <span className="px-2 py-1.5">PDFs</span>
        <span className="px-2 py-1.5">Audio</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <FileStack size={26} className="text-slate-200" />
        <p className="mt-2 text-sm font-semibold text-slate-500">No assets yet</p>
        <p className="mt-1 text-xs text-slate-400">
          Your saved videos, PDFs, and audio will appear here.
        </p>
      </div>
      <button className="self-end text-xs font-bold text-primary">View All&nbsp; →</button>
    </Card>
  );
}
