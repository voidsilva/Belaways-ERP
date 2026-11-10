import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, Search, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import logo from '@/assets/belaways-logo.png';
import { Ambient } from '@/components/ui/Ambient';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { navigation } from '@/constants/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useCatalogLive } from '@/hooks/use-catalog-live';
import { cn } from '@/lib/utils';

type NavItem = (typeof navigation)[number];

const NavItemLink = ({
  item,
  pillId,
  onNavigate,
}: {
  item: NavItem;
  pillId: string;
  onNavigate?: () => void;
}) => (
  <NavLink
    to={item.href}
    onClick={onNavigate}
    className={({ isActive }) =>
      cn(
        'group relative flex h-11 items-center gap-3 rounded-[16px] px-3.5 text-sm font-semibold transition-colors duration-300',
        isActive ? 'text-white' : 'text-muted hover:bg-chip hover:text-ink',
      )
    }
  >
    {({ isActive }) => (
      <>
        {isActive ? (
          <motion.span
            layoutId={pillId}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="absolute inset-0 rounded-[16px] bg-pink shadow-[0_8px_20px_-10px_rgb(224_57_159/.8),inset_0_1px_0_rgb(255_255_255/.3)]"
          />
        ) : null}
        <item.icon
          className="relative h-[18px] w-[18px] shrink-0"
          strokeWidth={2.1}
          aria-hidden="true"
        />
        <span className="relative">{item.label}</span>
      </>
    )}
  </NavLink>
);

const groups = [
  { title: 'Operação', items: navigation.slice(0, 5) },
  { title: 'Administração', items: navigation.slice(5) },
];

const Sidebar = ({ pillId, onNavigate }: { pillId: string; onNavigate?: () => void }) => (
  <aside className="glass flex h-full flex-col rounded-glass-xl p-3">
    <div className="flex h-16 items-center gap-3 px-3">
      <img src={logo} alt="Belaways" className="h-9 w-auto max-w-32 object-contain" />
      <span className="border-l border-line pl-3 text-[10px] font-bold uppercase tracking-[0.12em] text-faint">
        Intelligence
      </span>
    </div>
    <nav aria-label="Principal" className="flex-1 overflow-y-auto">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3.5 pb-2 pt-4 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => (
              <NavItemLink key={item.href} item={item} pillId={pillId} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
    <div className="mt-3 border-t border-line px-3.5 pb-1 pt-3">
      <div className="flex items-center gap-2.5 text-xs font-medium text-muted">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-pink" />
        </span>
        Monitor do catálogo ativo
      </div>
    </div>
  </aside>
);

const initials = (name?: string | null) =>
  (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'BW';

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useCatalogLive();

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="relative min-h-screen text-ink">
      <Ambient />

      <div className="fixed inset-y-4 left-4 z-30 hidden w-[264px] lg:block">
        <Sidebar pillId="nav-pill" />
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              aria-label="Fechar navegação"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="absolute inset-y-3 left-3 w-[270px]"
            >
              <Sidebar pillId="nav-pill-mobile" onNavigate={() => setMobileOpen(false)} />
              <button
                type="button"
                className="glass absolute -right-14 top-2 grid h-11 w-11 place-items-center rounded-full"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 lg:pl-[296px]">
        <header className="sticky top-0 z-20 px-3 pt-3 sm:px-6 sm:pt-4 lg:pl-0 lg:pr-8">
          <div className="glass flex h-16 items-center gap-2 rounded-full px-2.5 sm:gap-3">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full text-muted transition hover:bg-chip hover:text-ink lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir navegação"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <form onSubmit={submitSearch} className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar produto ou SKU"
                aria-label="Pesquisar"
                className="h-11 w-full rounded-full border-0 bg-chip pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-faint focus:bg-[var(--field)] focus:ring-4 focus:ring-accent/15"
              />
            </form>
            <ThemeToggle />
            <div className="hidden min-w-0 items-center gap-3 sm:flex">
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-bold text-ink">{user?.fullName}</p>
                <p className="truncate text-xs capitalize text-muted">{user?.role}</p>
              </div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-[1.5px] border-white/40 bg-pink text-sm font-bold text-white">
                {initials(user?.fullName)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="grid h-11 w-11 place-items-center rounded-full text-muted transition hover:bg-neg/10 hover:text-neg"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main
          key={location.pathname}
          className="mx-auto w-full max-w-[1500px] px-3 py-6 sm:px-6 lg:pl-0 lg:pr-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
