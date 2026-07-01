
# Plano — Coastal Stays (gestão de temporada)

Entrega inicial de layout e navegação para um app com duas áreas: site público (`/`, `/imovel/:slug`) e painel interno protegido (`/app/*`). Backend em Lovable Cloud (Supabase), Auth com e-mail/senha + Google, shadcn/ui, tema "Praiano claro & acolhedor" (turquesa + terracota).

## Escopo desta entrega

Incluso agora:
- Estilo visual definitivo (tokens semânticos em `src/styles.css`).
- Site público navegável com vitrine e página do imóvel + formulário de solicitação de reserva.
- Painel interno protegido por login, com dashboard (métricas), cadastro de imóveis (com upload de fotos), calendário de ocupação e gestão de reservas.
- Supabase Auth (e-mail/senha + Google via broker Lovable), gate `_authenticated` gerenciado.
- Bucket de storage `property-photos` (público) para as fotos.

Adiado (a pedido):
- Módulo de Tarefas (limpeza/manutenção) — apenas item de menu com placeholder "em breve".

Fora do escopo até você definir o schema:
- Tabelas do banco (properties, bookings, booking_requests, photos, profiles, user_roles) — deixo TODO no código com mocks tipados e um lugar único para plugar as queries reais depois.

## Arquitetura de rotas

```
src/routes/
  __root.tsx                 head/meta, QueryClient, onAuthStateChange
  index.tsx                  / vitrine pública
  imovel.$slug.tsx           /imovel/:slug (página + form reserva)
  auth.tsx                   /auth (login/cadastro + Google)
  _authenticated/
    route.tsx                gate gerenciado (ssr:false, redirect /auth)
    app.tsx                  layout do painel (SidebarProvider + Sidebar)
    app.index.tsx            /app dashboard com métricas
    app.imoveis.tsx          /app/imoveis lista
    app.imoveis.novo.tsx     /app/imoveis/novo cadastro + upload
    app.imoveis.$id.tsx      /app/imoveis/:id editar
    app.calendario.tsx       /app/calendario ocupação
    app.reservas.tsx         /app/reservas gestão + aprovação de pré-reservas
    app.tarefas.tsx          /app/tarefas placeholder "em breve"
  api/
    (vazio nesta entrega)
```

Cada rota pública define `head()` próprio (title, description, og:title/description). `og:image` só no leaf, quando houver foto de capa do imóvel.

## Componentes-chave

- `PublicHeader` / `PublicFooter` — header com logo, links (Início, Imóveis, Contato) e CTA "Área do gestor".
- `PropertyCard`, `PropertyGallery`, `AvailabilityCalendar` (leitura no público, edição no interno), `BookingRequestForm` (com validação zod).
- `AppSidebar` — sidebar colapsável do painel com ícones lucide (Dashboard, Imóveis, Calendário, Reservas, Tarefas, Sair).
- `MetricCard`, `RecentBookingsTable`, `UpcomingCheckinsList` no dashboard.
- `PhotoUploader` — múltiplas fotos → bucket `property-photos`.

Formulário de reserva pública cria uma solicitação (status `pending`) sem bloquear datas; o gestor aprova em `/app/reservas`, o que então gera a reserva confirmada. Toda essa lógica fica isolada em `src/lib/bookings.functions.ts` como stubs `createServerFn` prontos para receber a query real quando o schema chegar.

## Design system

Paleta escolhida (Praiano claro & acolhedor), definida como tokens `oklch` em `src/styles.css`:
- `--background` areia clara (#FFF8F0 aprox.)
- `--foreground` grafite (#1F2937)
- `--primary` turquesa (#0EA5A4) + `--primary-foreground` branco
- `--accent` terracota (#F4A261)
- Gradiente `--gradient-hero` (turquesa → terracota suave), sombra `--shadow-warm`.

Tipografia: display **Fraunces** (headings, leve serifado acolhedor) + corpo **Inter Tight**, ambas via `@fontsource`. Radius 0.75rem. Sem gradientes roxos genéricos, sem cards azuis padrão.

## Autenticação

- Página `/auth` com abas Entrar / Criar conta (e-mail+senha) e botão "Continuar com Google" via `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`.
- Gate `_authenticated/route.tsx` já gerenciado pela integração — redireciona para `/auth`.
- Sign-out via `handleSignOut` correto (cancel queries → clear cache → signOut → navigate `/auth`).
- Após schema, adicionamos tabela `user_roles` + `has_role()` seguindo o padrão seguro (nunca role no profile).

## Backend agora

- Habilitar Lovable Cloud.
- Habilitar provider Google (`supabase--configure_social_auth`).
- Criar bucket `property-photos` (público) via tool de storage.
- **Nenhuma tabela criada** — aguardando seu schema. Código usa mocks em `src/lib/mock-data.ts` com tipos que espelham a estrutura provável, para trocar por queries reais depois com o mínimo de atrito.

## Detalhes técnicos

- Server functions em `src/lib/*.functions.ts` (fora de `src/server/`), handlers vazios prontos para as queries reais.
- TanStack Query como padrão de leitura (`ensureQueryData` no loader + `useSuspenseQuery` no componente); rotas públicas usam apenas mock por enquanto.
- `errorComponent` e `notFoundComponent` em toda rota com loader.
- Formulários com `react-hook-form` + `zod` (nome, e-mail, telefone, datas, mensagem — limites de tamanho e sanitização).
- Sem `dangerouslySetInnerHTML`, sem hardcode de cores.

## O que preciso de você depois deste build

1. Schema do banco (ou aprovação para eu propor um).
2. Nome do negócio + tagline para title/description reais (uso placeholder "Coastal Stays" até lá).

Ao final, você terá um app navegável ponta a ponta com dados mockados, pronto para eu ligar às tabelas reais assim que o schema for definido.
