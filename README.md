# 📦 Opsynk App

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
Formulário de contacto funcional — a página /contactos hoje só mostra o telefone/email; um formulário que grava pedidos no backoffice (tipo "leads") evitava perder contactos de clientes interessados.
Notificações reais — o sino no topo do backoffice já lá está mas é só decorativo; dava para ligá-lo a eventos reais (manutenção a vencer, stock baixo, novo pedido de contacto).
Fotos nas manutenções — tal como os produtos têm imagens, podia anexar fotos do trabalho feito a cada manutenção (útil para mostrar ao cliente ou para o próprio histórico).
