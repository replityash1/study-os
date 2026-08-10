import { useState } from 'react';
import { FileStack, Filter } from 'lucide-react';
import { Card, IconButton } from '../ui';

export function AssetsPanel({ icon }: { icon?: React.ReactNode }) {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Videos', 'PDFs', 'Audio'];

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
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === item ? 'bg-primary text-white' : 'hover:bg-white hover:text-slate-600'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <FileStack size={26} className="text-slate-200" />
        <p className="mt-2 text-sm font-semibold text-slate-500">No assets yet</p>
        <p className="mt-1 text-xs text-slate-400">
          Your saved videos, PDFs, and audio will appear here.
        </p>
      </div>
    </Card>
  );
}
