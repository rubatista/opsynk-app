# Próximos passos

Estado em 25/11/2026. As alterações estão no ramo `feat/no-ref/new-funcionalities`.

## 1. Preparar o projeto num PC novo

```bash
git clone https://github.com/rubatista/opsynk-app.git
cd opsynk-app
git checkout feat/no-ref/new-funcionalities
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

**O que não vem com o git:**
- **A base de dados** (`.data/`): no PC novo, começa só com os dados do seed.
- **As imagens enviadas** (`public/uploads/`).
- **O ficheiro `.env`.**

Contas do seed, todas com a password `password123`:

| Conta | Para onde vai |
| --- | --- |
| `admin@opsynk.com` | `/admin`, o dono da plataforma |
| `demo@opsynk.com` | empresa "Opsynk Empilhadores", site em http://demo.localhost:3000 |
| `stand@opsynk.com` | empresa "Stand Exemplo", site em http://stand-exemplo.localhost:3000 |

## 2. Prompt para colar no Claude Code

Abre o Claude Code na pasta do projeto e cola isto:

```text
Estou a retomar este projeto noutro PC. Lê primeiro o README.md (secção "Multi-empresa") e este ficheiro (PROXIMOS-PASSOS.md) para teres o contexto. Responde-me sempre em português de Portugal.

## O produto
O Opsynk começou como site e backoffice de uma única empresa de empilhadores. Está a ser transformado num SaaS para stands de usados, oficinas, lojas de motas, vendedores de peças e de máquinas.
- Cada cliente é uma empresa (tenant), com login próprio, backoffice e site público. O site fica em <slug>.<domínio base> ou num domínio próprio.
- O que diferencia o produto é um feed B2B dentro do backoffice. Lá, os comerciantes publicam peças, veículos, máquinas e motas para venda ou troca, trocam mensagens e fecham negócio. Exemplo: um mecânico do Porto publica "2 para-choques Megane II" e um de Faro compra-os.
- Cada empresa tem tipos de negócio (tags stand_auto, motas, mecanica, pecas, maquinas), e o feed mostra-lhe só o que encaixa nessas tags.
- Ainda ninguém usa a aplicação em produção, por isso podemos fazer reset ao schema e às migrações sempre que for preciso.

## Stack
Nuxt 3 com Nitro, Drizzle ORM sobre SQLite (better-sqlite3), Pinia, Tailwind, JWT e pdfkit.

## Já feito
1. Fase 1, multi-empresa:
   - tenant_id em todas as tabelas; a empresa vem sempre do login, nunca do pedido.
   - Área /admin, só para o dono da plataforma: criar empresas, tags, módulos, subdomínio ou domínio, estado ativo/suspenso, utilizadores e reposição de passwords.
   - APIs separadas: backoffice com requireTenant, site público em /api/site/* com resolveSiteTenant, admin com requireSuperadmin.
2. Redesign do backoffice e do /admin ao estilo de um design de referência (dashboard de uma app de cursos online, tipo "Learnova"):
   - Fundo lilás-claro, cartões brancos arredondados com sombra suave, roxo #6C5CE7 como cor principal e chips de ícones em tons pastel.
   - Modo escuro em azul-noite.
   - Cores como tokens semânticos em assets/css/main.css e tailwind.config.js (bg-surface, text-ink, border-line, bg-primary…); não uses pares gray/zinc com dark: no backoffice.
   - Fonte Plus Jakarta Sans e, no telemóvel, uma barra de navegação em baixo.
   - O site público mantém o vermelho da marca.

## Próximos passos, por ordem
1. Nome do produto (ainda por decidir). O utilizador quer um nome com jogo de palavras, que fique na cabeça e que deixe perceber o setor automóvel. Pode ser em inglês ou uma palavra inventada, como "Opsynk" (ops + sync). Já rejeitou estes, por isso não os voltes a propor: Engrenar, Combinado, Do Ramo, Arranque, Torka, Garagio, Rodix, Dealpit, Motorly, Bem Oleado, Carro-Chefe, Em Máximos, Quinta Mudança, Afinado, WheelDeal, Motorhood, Let's Torque, SpareShare, Partsnership, Wheelhouse, Carpe Deal, KickStand, Dealer's Choice, Hubcap, Smileage, Revnue, Pitstock, Chassy, Brake Even, Nuts & Bolts, Gearhead, Motorsynk, Torqsynk, Gearlynk, Rodalynk, Mecalynk, Wheelynk, Autroca, Rodeal, Revendo, Motroca, Torqo, Motrade, Motorket, Motorcio, Motorede, Motorswap, Motorium, Motorade, Motormate, Motordeal, Motorlynk, Motorio, Motorique, Motorsquad, Carisma, Negocar, Caravana, Carvenda, Aceleradora, Ignição, Cilindrada, Motriz, Engata, Bólide, Trocadilho, Garagenda, Trocauto, Chaço. Antes de propor um nome, confirma se o domínio está livre (por exemplo com dig NS). Quando houver nome, troca "Opsynk" em todo o código: seed, slugs reservados, sidebar, README.
2. Fase 2:
   - Modelo de produto genérico: categoria + atributos em JSON, em vez das colunas de empilhador (capacityKg, energyType).
   - Conteúdo do site público por empresa: os textos do hero, "sobre nós" e serviços ainda falam de empilhadores e estão escritos diretamente no código.
   - Cor da marca por empresa no site público, através da variável CSS --c-primary.
3. Antes da fase 3: passar de SQLite para Postgres.
4. Fase 3, o feed B2B:
   - Publicações a partir do stock (com 1 clique) ou soltas, incluindo pedidos "Procuro".
   - Filtros por tags e região, e pesquisa por marca e modelo.
5. Fase 4: mensagens em cada publicação, mais notificações.
6. Fase 5: reputação dos comerciantes, verificação de NIF e negócio fechado que passa a venda ou documento. A faturação deve integrar o Moloni ou o InvoiceXpress, porque em Portugal uma fatura tem de sair de software certificado pela AT.

## Pendentes pequenos
- Os módulos (alugueres, equipamentos, manutenções) só escondem o menu; a API não os bloqueia. Falta validar no servidor.
- O topo do backoffice ainda não tem a pesquisa global do design.
- Antes de ir para produção:
  - mudar a password do admin;
  - definir NUXT_JWT_SECRET e NUXT_PUBLIC_SITE_BASE_DOMAIN;
  - configurar o DNS wildcard *.domínio para os subdomínios dos clientes.

## Como trabalhar comigo
- Faz commit e push só quando eu pedir.
- Código novo: segue as regras do README (tenantId em todas as queries, validar ids com ownedIdOrNull/requireOwned, tokens de cor no backoffice).
- Antes de dares uma tarefa como feita, testa: build + teste no browser (Playwright) em modo claro e escuro, em desktop e telemóvel.

Começa por me dizer em que ponto estamos e pergunta-me por qual dos próximos passos quero avançar.
```
