import {
  BarChart3,
  Bookmark,
  BookOpen,
  CheckCircle2,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const items = [
  { to: '/workspace', label: 'Workspace', icon: BookOpen },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/practice', label: 'Practice', icon: CheckCircle2 },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const initials = user?.displayName?.slice(0, 1).toUpperCase() || 'S';

  return (
    <aside className="fixed bottom-4 left-4 top-4 z-20 flex w-[82px] flex-col items-center rounded-[28px] bg-white py-5 shadow-soft max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:top-auto max-md:h-[72px] max-md:w-auto max-md:flex-row max-md:justify-around max-md:rounded-none max-md:py-2">
      <div className="mb-8 rounded-[18px] bg-primary p-3 text-white shadow-soft-purple max-md:mb-0">
        <Sparkles size={20} />
      </div>
      <nav className="flex flex-1 flex-col gap-3 max-md:flex-row max-md:flex-none">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `group rounded-[16px] p-3 transition hover:-translate-y-0.5 ${
                isActive
                  ? 'bg-violet-50 text-primary shadow-soft-purple'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`
            }
          >
            <Icon size={21} />
            <span className="sr-only">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="group relative max-md:hidden">
        <button
          aria-label={user ? `Sign out ${user.displayName ?? 'user'}` : 'Local-only mode'}
          onClick={() => user && void signOut()}
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-300 to-primary text-sm font-bold text-white"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </button>
        {user && (
          <span className="pointer-events-none absolute bottom-0 left-14 hidden whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-xs text-white group-hover:block">
            <LogOut size={12} className="mr-1 inline" />
            Sign out
          </span>
        )}
      </div>
    </aside>
  );
}
