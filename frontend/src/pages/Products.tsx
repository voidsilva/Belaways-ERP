import {
  AlertTriangle,
  ArrowDownAZ,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  PackageCheck,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, type DataColumn } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductImage } from '@/components/ProductImage';
import { Select } from '@/components/ui/Select';
import { useProducts, useProductsSummary, useSyncProducts, type ProductFilters } from '@/hooks/use-data';
import { downloadApiFile } from '@/api/client';
import { formatCurrency, formatDate, formatNumber, formatRelativeTime } from '@/lib/utils';
import type { PaginationMeta, Product } from '@/types/domain';

const pageSize = 40;

const stockBadge = (product: Product) => {
  if (product.stock === null) return <Badge>Sem saldo</Badge>;
  if (product.stock <= 0) return <Badge tone="red">Zerado</Badge>;
  if (product.stock <= product.minimumStock) return <Badge tone="amber">Baixo</Badge>;
  return <Badge tone="green">Disponível</Badge>;
};

const statusBadge = (status: string | null) => {
  if (status === 'A') return <Badge tone="green">Ativo</Badge>;
  if (status === 'I') return <Badge tone="red">Inativo</Badge>;
  return <Badge>{status || 'Sem status'}</Badge>;
};

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const stock = (searchParams.get('stock') ?? 'all') as ProductFilters['stock'];
  const status = (searchParams.get('status') ?? 'active') as ProductFilters['status'];
  const sort = (searchParams.get('sort') ?? 'updated') as ProductFilters['sort'];
  const page = Math.max(Number(searchParams.get('page') ?? 1), 1);
  const search = searchParams.get('search') ?? '';
  const filters = useMemo<ProductFilters>(
    () => ({ search, page, pageSize, stock, status, sort, order: sort === 'name' ? 'asc' : 'desc' }),
    [page, search, sort, status, stock],
  );
  const productsQuery = useProducts(filters);
  const summaryQuery = useProductsSummary(status);
  const syncProducts = useSyncProducts();
  const rows = productsQuery.data?.data ?? [];
  const meta = productsQuery.data?.meta as PaginationMeta | undefined;
  const summary = summaryQuery.data;
  const isCatalogFresh = Boolean(
    summary?.lastSyncAt && Date.now() - new Date(summary.lastSyncAt).getTime() < 24 * 60 * 60 * 1000,
  );

  const updateParams = useCallback((updates: Record<string, string | null>, resetPage = true) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all' || (key === 'status' && value === 'active') || (key === 'sort' && value === 'updated')) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      if (resetPage) next.delete('page');
      return next;
    });
  }, [setSearchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput.trim() !== search) updateParams({ search: searchInput.trim() || null });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, searchInput, updateParams]);

  const handleSync = () => {
    syncProducts.reset();
    syncProducts.mutate('incremental');
  };

  const handleFullSync = () => {
    syncProducts.reset();
    syncProducts.mutate('full');
  };

  const columns: Array<DataColumn<Product>> = [
    {
      header: 'Produto',
      cell: (product) => (
        <div className="flex min-w-[20rem] items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-line bg-white">
            <ProductImage
              imageUrl={product.imageUrl}
              category={product.category}
              productName={product.name}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 font-semibold leading-5 text-ink">{product.name}</p>
            <p className="mt-1 truncate text-xs text-muted">
              SKU {product.sku || 'não informado'}{product.brand ? ` · ${product.brand}` : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Cadastro',
      cell: (product) => (
        <div className="space-y-1.5">
          {statusBadge(product.status)}
          <p className="max-w-44 truncate text-xs text-muted">
            {product.category || 'Sem categoria'}
          </p>
        </div>
      ),
    },
    {
      header: 'Estoque',
      cell: (product) => (
        <div className="space-y-1.5 tabular-nums">
          {stockBadge(product)}
          <p className="text-xs text-muted">
            {product.stock ?? 'n/i'} un. · mín. {product.minimumStock}
          </p>
        </div>
      ),
    },
    {
      header: 'Preço',
      cell: (product) => (
        <div className="tabular-nums">
          <p className="font-semibold text-ink">{formatCurrency(product.price)}</p>
          {product.promotionalPrice !== null ? (
            <p className="mt-1 text-xs text-pos">
              Promo {formatCurrency(product.promotionalPrice)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Sincronizado',
      cell: (product) => (
        <span className="whitespace-nowrap text-xs text-muted">
          {formatDate(product.syncedAt ?? product.updatedAt)}
        </span>
      ),
    },
    {
      header: '',
      cell: (product) => (
        <Link
          to={`/products/${product.id}`}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-chip hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`Abrir ${product.name}`}
          title="Abrir produto"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </Link>
      ),
    },
  ];

  const catalogStats = [
    { label: 'Ativos no catálogo', value: summary?.total ?? 0, icon: PackageCheck, tone: 'text-accent' },
    { label: 'Com imagem', value: summary?.withImage ?? 0, icon: Sparkles, tone: 'text-info' },
    { label: 'Com saldo lido', value: summary?.withStock ?? 0, icon: Boxes, tone: 'text-pos' },
    { label: 'Precisam de atenção', value: (summary?.lowStock ?? 0) + (summary?.outOfStock ?? 0), icon: AlertTriangle, tone: 'text-warn' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Catálogo de produtos"
        description="Consulta rápida do cadastro, preço e disponibilidade sincronizados com a Olist Tiny."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => void downloadApiFile('/api/products?format=csv', 'produtos-belaways.csv')}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Exportar
            </Button>
            <Button onClick={handleSync} disabled={syncProducts.isPending}>
              <RefreshCw className={`h-4 w-4 ${syncProducts.isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
              {syncProducts.isPending ? 'Atualizando' : 'Atualizar agora'}
            </Button>
          </>
        }
      />

      <section className="overflow-hidden glass" aria-label="Pulso do catálogo">
        <div className="flex flex-col gap-3 border-b border-line bg-chip px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${isCatalogFresh ? 'bg-pos' : 'bg-warn'}`} aria-hidden="true" />
            <span className="font-medium text-ink">Pulso do catálogo</span>
            <span className="text-muted">
              {summary?.lastSyncAt ? `última alteração recebida ${formatRelativeTime(summary.lastSyncAt)}` : 'sem sincronização registrada'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {syncProducts.isSuccess ? (
              <span className="text-xs font-medium text-pos">
                {syncProducts.data.unavailableSources?.length
                  ? 'Atualização parcial; extensão de tempo real indisponível'
                  : `${syncProducts.data.totalProducts} produto(s) recebido(s)`}
              </span>
            ) : null}
            {syncProducts.isError ? (
              <span className="text-xs font-medium text-neg">Não foi possível consultar a Olist agora.</span>
            ) : null}
            <button
              type="button"
              className="text-xs font-semibold text-accent underline-offset-4 hover:underline disabled:opacity-50"
              onClick={handleFullSync}
              disabled={syncProducts.isPending}
            >
              Recarregar catálogo completo
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-line lg:grid-cols-4 lg:divide-y-0">
          {catalogStats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex min-h-24 items-center gap-3 px-4 py-4 sm:px-5">
              <Icon className={`h-5 w-5 shrink-0 ${tone}`} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xl font-semibold tabular-nums text-ink">{formatNumber(value)}</p>
                <p className="truncate text-xs text-muted">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass" aria-label="Filtros do catálogo">
        <div className="grid gap-3 p-3 md:grid-cols-[minmax(16rem,1fr)_11rem_11rem_12rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar nome, SKU ou EAN"
              className="pl-9"
              aria-label="Buscar produtos"
            />
          </div>
          <Select value={stock} onChange={(event) => updateParams({ stock: event.target.value })} aria-label="Filtrar estoque">
            <option value="all">Todo estoque</option>
            <option value="low">Estoque baixo</option>
            <option value="out">Sem estoque</option>
          </Select>
          <Select value={status} onChange={(event) => updateParams({ status: event.target.value })} aria-label="Filtrar situação">
            <option value="active">Somente ativos</option>
            <option value="inactive">Inativos</option>
            <option value="all">Todos os status</option>
          </Select>
          <Select value={sort} onChange={(event) => updateParams({ sort: event.target.value })} aria-label="Ordenar produtos">
            <option value="updated">Mais recentes</option>
            <option value="name">Nome A–Z</option>
            <option value="stock">Maior estoque</option>
            <option value="price">Maior preço</option>
          </Select>
        </div>
        <div className="flex flex-col gap-2 border-t border-line px-4 py-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <ArrowDownAZ className="h-4 w-4" aria-hidden="true" />
            {meta ? `${formatNumber(meta.total)} resultado(s) · página ${meta.page} de ${meta.totalPages}` : 'Preparando catálogo'}
          </span>
          {productsQuery.isFetching && !productsQuery.isLoading ? <span>Atualizando esta página…</span> : null}
        </div>
      </section>

      <div className={productsQuery.isFetching && !productsQuery.isLoading ? 'opacity-70 transition-opacity' : ''} aria-busy={productsQuery.isFetching}>
        {productsQuery.isError ? (
          <div className="rounded-control border border-neg/30 bg-neg/10 px-4 py-10 text-center text-sm text-neg">
            Não foi possível carregar o catálogo. Tente novamente em alguns instantes.
          </div>
        ) : (
          <DataTable
            rows={productsQuery.isLoading ? [] : rows}
            columns={columns}
            empty={productsQuery.isLoading ? 'Carregando produtos…' : 'Nenhum produto localizado com estes filtros.'}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <p className="text-xs text-muted">Resultados da consulta atual</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" disabled={!meta || meta.page <= 1 || productsQuery.isFetching} onClick={() => updateParams({ page: String(page - 1) }, false)} aria-label="Página anterior" title="Página anterior">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className="min-w-20 text-center text-sm font-medium tabular-nums text-muted">
            {meta ? `${meta.page} / ${meta.totalPages}` : '—'}
          </span>
          <Button variant="secondary" size="icon" disabled={!meta || meta.page >= meta.totalPages || productsQuery.isFetching} onClick={() => updateParams({ page: String(page + 1) }, false)} aria-label="Próxima página" title="Próxima página">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
};
