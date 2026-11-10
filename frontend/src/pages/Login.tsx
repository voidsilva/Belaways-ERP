import { AlertCircle, ArrowRight, LockKeyhole } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import loginStudio from '@/assets/belaways-login-studio.webp';
import logo from '@/assets/belaways-logo.png';
import { Ambient } from '@/components/ui/Ambient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/use-auth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const target = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  if (user) return <Navigate to={target} replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await signIn(email, password);
      navigate(target, { replace: true });
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Não foi possível autenticar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative grid min-h-screen text-ink lg:grid-cols-[minmax(30rem,0.9fr)_minmax(0,1.1fr)]">
      <Ambient />

      <section className="relative z-10 order-2 flex items-center justify-center px-5 py-10 lg:order-1 lg:min-h-screen">
        <div className="glass w-full max-w-md animate-rise rounded-glass-xl p-7 sm:p-9">
          <img src={logo} alt="Belaways" className="mb-9 h-11 w-auto object-contain" />
          <div className="mb-7">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-[16px] bg-accent/12 text-accent">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="eyebrow">Acesso interno</span>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-[-0.035em]">
              Entre na sua conta
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Gestão operacional, estoque, pedidos, auditoria e indicadores em uma única camada.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-muted">E-mail</span>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@belaways.com.br"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-muted">Senha</span>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </label>

            {error ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-control bg-neg/10 px-3.5 py-2.5 text-sm text-neg shadow-[inset_0_0_0_1px_rgb(var(--neg)/.3)]"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando…' : 'Entrar'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </section>

      <section className="relative z-10 order-1 p-3 pb-0 lg:order-2 lg:min-h-screen lg:p-4 lg:pl-0">
        <div className="relative h-56 overflow-hidden rounded-glass-xl bg-[#6d153f] shadow-soft lg:h-full">
          <img
            src={loginStudio}
            alt="Composição de produtos das categorias cabelo, perfume e skincare"
            className="absolute inset-0 h-full w-full object-cover object-[62%_58%] lg:object-center"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white lg:p-10 xl:p-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">Belaways Intelligence</p>
            <h2 className="mt-2 max-w-xl font-display text-xl font-extrabold leading-[1.05] tracking-[-0.035em] lg:mt-3 lg:text-[clamp(32px,3.4vw,48px)]">
              Cabelo, perfume e skincare em uma operação que acompanha o ritmo da loja.
            </h2>
            <div className="mt-6 hidden flex-wrap gap-2 sm:flex">
              {['Catálogo ativo', 'Pedidos recentes', 'Estoque monitorado'].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-md"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
