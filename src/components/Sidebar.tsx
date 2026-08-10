import {
  BarChart3,
  Bookmark,
  BookOpen,
  CalendarDays,
  GraduationCap,
  House,
  LogOut,
  Settings,
  MessageCircle,
  Target,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const items = [
  { to: '/workspace', label: 'Workspace', icon: House },
  { to: null, label: 'Syllabus', icon: BookOpen },
  { to: null, label: 'Calendar', icon: CalendarDays },
  { to: null, label: 'Messages', icon: MessageCircle },
  { to: '/practice', label: 'Practice', icon: Target },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const initials = user?.displayName?.slice(0, 1).toUpperCase() || 'S';

  return (
    <aside className="fixed bottom-4 left-4 top-4 z-20 flex w-[82px] flex-col items-center rounded-[28px] bg-white py-5 shadow-soft max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:top-auto max-md:h-[72px] max-md:w-auto max-md:flex-row max-md:justify-around max-md:rounded-none max-md:py-2">
      <div className="mb-7 rounded-[18px] bg-primary p-3 text-white shadow-soft-purple max-md:mb-0">
        <GraduationCap size={21} />
      </div>
      <nav className="flex flex-1 flex-col gap-3 max-md:flex-row max-md:flex-none">
        {items.map(({ to, label, icon: Icon }) =>
          to ? (
            <NavLink
              key={label}
              to={to}
              aria-label={label}
              className={({ isActive }) =>
                `rounded-[15px] p-3 transition ${
                  isActive
                    ? 'bg-white text-primary shadow-soft'
                    : 'text-slate-400 hover:bg-violet-50'
                }`
              }
            >
              <Icon size={20} />
              <span className="sr-only">{label}</span>
            </NavLink>
          ) : (
            <button
              key={label}
              type="button"
              aria-label={`${label} coming soon`}
              title="Coming in the next step"
              className="cursor-not-allowed rounded-[15px] p-3 text-slate-300"
            >
              <Icon size={20} />
              <span className="sr-only">{label}</span>
            </button>
          ),
        )}
      </nav>
      <div className="group relative max-md:hidden">
        <button
          aria-label={user ? `Sign out ${user.displayName ?? 'user'}` : 'Local-only mode'}
          onClick={() => user && void signOut()}
          className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-violet-300 to-primary text-sm font-bold text-white shadow-soft"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
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
