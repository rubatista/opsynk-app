# 📦 Opsynk App

## 🏢 Multi-empresa

Cada cliente (stand, oficina, loja de motas…) é uma **empresa** (`tenants`). Todas as tabelas têm `tenant_id` e todas as queries filtram por ele.

| Quem | Onde | O quê |
| --- | --- | --- |
| Dono da plataforma (`role: superadmin`) | `/admin` | Cria empresas, tipos de negócio, módulos, estado (ativo/suspenso), utilizadores e reposição de passwords |
| Utilizadores da empresa | `/backoffice` | Só veem os dados da própria empresa (a empresa vem do login, nunca do pedido) |
| Público | `<slug>.<domínio base>` ou domínio próprio | Site da empresa: produtos, contactos (`/api/site/*`) |

### Arrancar em dev

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Contas do seed (password `password123`):

- `admin@opsynk.com` → `/admin`
- `demo@opsynk.com` → empresa "Opsynk Empilhadores", site em http://demo.localhost:3000 (e em `localhost`)
- `stand@opsynk.com` → empresa "Stand Exemplo", site em http://stand-exemplo.localhost:3000

### Configuração (env)

- `NUXT_JWT_SECRET`: obrigatório em produção.
- `NUXT_PUBLIC_SITE_BASE_DOMAIN`: domínio base dos sites, por exemplo `opsynk.pt`, o que dá `standx.opsynk.pt`. Por defeito é `localhost`.
- `NUXT_DEFAULT_SITE_SLUG`: empresa servida quando o host não corresponde a nenhuma. Por defeito é `demo` em dev e vazio em produção.

### Regras para código novo

- **Endpoint do backoffice:** usa `const { tenantId } = requireTenant(event)` e filtra todas as queries por `tenantId`.
- **Ids recebidos no body** (clientId, productId…): valida-os com `ownedIdOrNull` ou `requireOwned` (em `server/utils/tenant.ts`).
- **Endpoint público:** vai em `server/api/site/` e usa `resolveSiteTenant(event)`. No frontend chama-se com `useSiteFetch`.
- **Cores no backoffice e no admin:** usa as classes semânticas, que já trazem os valores para modo claro e escuro, em vez de pares `gray-*`/`zinc-*` com `dark:`:
  - Superfícies: `bg-canvas`, `bg-surface`, `bg-surface-muted`
  - Texto: `text-ink`, `text-ink-soft`, `text-muted`, `text-subtle`
  - Bordas: `border-line`, `border-line-strong`
  - Cor principal: `bg-primary`, `bg-primary-soft`, `text-primary-text`
  - Estados: `success`, `warning`, `danger` e `info`, cada um com a variante `-soft`

  Os valores estão em `assets/css/main.css`.

## 🧭 Plano: Estrutura Frontoffice / Backoffice + Backend

### 📌 Estado atual

- **Stack:** Nuxt 3, Tailwind CSS, Pinia, VueUse\
- **Autenticação:** Já implementada (store + middleware)\
- **Páginas existentes:**
  - `login.vue`
  - `dashboard.vue`
- **Backend:**
  - O ficheiro `stores/auth.ts` já chama:
    http://localhost:3000/auth/login
  - ⚠️ Ainda não existe API implementada em `server/`

---

## 📁 Estrutura de pastas

    opsynk-app/
    ├── components/
    │   ├── common/
    ├── pages/
    │   ├── index.vue
    │   ├── login.vue
    │   ├── produtos.vue
    │   └── backoffice/
    │       ├── dashboard.vue
    │       ├── produtos/
    │       └── paginas/
    ├── layouts/
    │   ├── default.vue
    │   └── backoffice.vue
    ├── server/
    │   ├── api/

---

## 🛣️ Rotas

- Frontoffice: `/`, `/produtos`
- Backoffice: `/backoffice/*`

---

## 🔐 Auth

- Middleware protege `/backoffice/*`
- Redireciona para `/login` se necessário

---

## ⚙️ Backend

- Usar Nitro (`server/api/`)
- ORM: Drizzle
- DB:
  - SQLite (dev)
  - PostgreSQL (prod)

---

## 🔌 APIs

### Auth

- POST `/api/auth/login`

### Produtos

- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/products`
- PUT `/api/products/:id`
- DELETE `/api/products/:id`

### CMS

- GET `/api/pages/:slug`
- PUT `/api/pages/:slug`

---

## 🚀 Próximos passos

- Implementar backend
- Criar modelos DB
- Construir CRUD no backoffice
- Integrar frontend com API



proximos passos:
Notificações reais — o sino no topo do backoffice já lá está mas é só decorativo; dava para ligá-lo a eventos reais (manutenção a vencer, stock baixo, novo pedido de contacto).
Fotos nas manutenções — tal como os produtos têm imagens, podia anexar fotos do trabalho feito a cada manutenção (útil para mostrar ao cliente ou para o próprio histórico).

feito:
Formulário de contacto funcional — pedidos ficam guardados como "leads" em /backoffice/leads, com estado Novo/Contactado.
