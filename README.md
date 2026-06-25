# QA Report Builder

Plataforma web para **criar, salvar, gerenciar e exportar relatórios de validação de sites** (checklists de QA: bugs, responsividade, erros ortográficos, etc.). Substitui os documentos estáticos do Word por um **editor baseado em blocos**, com histórico de relatórios, compartilhamento por grupos e exportação para PDF e Word.

---

## ✨ Funcionalidades

**Autoria de relatórios**
- Editor por blocos com **15 tipos de blocos** (ver abaixo).
- Painel de blocos em destaque na barra lateral (busca + catálogo agrupado) e atalho **`/`**.
- Reordenar (arrastar e soltar), duplicar e excluir blocos.
- **Autosave** (salva sozinho ~1s após parar de editar) e salvamento manual.
- **Dashboard automático** por relatório: conta itens por status (Problema/Êxito/Não testado…) conforme a legenda, com barra proporcional e contadores.

**Gestão e histórico**
- Histórico na barra lateral agrupado por data (Hoje / Ontem / Últimos 7 dias / Mais antigos).
- Busca por nome do relatório ou cliente.
- CRUD completo de relatórios.

**Usuários, grupos e permissões**
- Cadastro/login por e-mail e senha (Supabase Auth).
- Papéis **admin** e **member**.
- **Grupos**: um relatório pode ser compartilhado com um grupo; todos os membros **visualizam** (somente leitura).
- **Painel de administração**: gestão de usuários (papéis), grupos (membros) e relatórios (reatribuir grupo / excluir).

**Visualização diferenciada**
- O **dono** vê o editor por blocos.
- O **visualizador** (membro do grupo) vê o relatório **formatado** como documento — sem controles de edição — em modo somente leitura, com segurança garantida no banco (RLS).

**Exportação e importação**
- **Exportar PDF** (impressão formatada) e **Word `.docx` nativo** (texto selecionável, imagens embutidas, cores de status).
- **Importar Word**: converte um `.docx` em blocos editáveis (títulos, parágrafos, listas, tabelas, imagens).

**Experiência**
- Responsivo: barra lateral vira **drawer com hambúrguer** no mobile; header do relatório se reorganiza sem quebrar.
- Interface limpa em React + Tailwind.

---

## 🧱 Tipos de bloco

| Bloco | Descrição |
|---|---|
| Cabeçalho do relatório | Cliente, URL, datas, versão do site, navegador, técnico |
| Legenda de status | Cores e significados (Problema/Êxito/Não testado/Parcial) |
| Título de seção | H1 / H2 / H3 |
| Etapa numerada | Passo numerado (Etapa 1, 2, 3…) |
| Divisor | Linha separadora |
| Item de verificação | Item testado com status colorido |
| Página/menu testado | Página com URL + vários itens verificados |
| Parágrafo | Texto livre (com cor opcional pela legenda) |
| Checklist | Lista de tarefas com caixas de seleção |
| Teste multi-dispositivo | Mesma página em vários aparelhos, status por dispositivo |
| Imagem / print | Upload, arrastar ou colar (Ctrl+V), armazenado no Storage |
| Link | URL testada |
| Vídeo | Link de vídeo demonstrando o bug |
| Nota / callout | Caixa de nota, atenção ou conclusão |
| Tabela | Tabela genérica de URLs e status |

O conteúdo de cada relatório é salvo como um **array de blocos em JSON** (coluna `reports.blocks`). O contrato de dados está em `src/types/blocks.ts`.

---

## 🛠️ Stack

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** (plugin do Vite)
- **Supabase** (Auth + PostgreSQL + Storage)
- **Zustand** (estado) e **React Router 7** (rotas)
- **dnd-kit** (arrastar e soltar)
- **lucide-react** (ícones)
- **docx** (exportação Word) e **mammoth** (importação Word)

---

## 📁 Estrutura

```
src/
  lib/
    supabase.ts        Cliente Supabase (singleton)
    storage.ts         Upload / URL assinada / remoção de imagens
    dateGroups.ts      Agrupamento por data + tempo relativo
    statusSummary.ts   Cálculo do dashboard (contagem por status)
    exportDocx.ts      Exportação para Word (.docx)
    importDocx.ts      Importação de Word -> blocos
  types/
    blocks.ts          Modelo/contrato de todos os blocos
  store/
    authStore.ts       Sessão, perfil e papel (admin/member)
    reportsStore.ts    CRUD de relatórios e operações de bloco
    adminStore.ts      Usuários, grupos, membros e relatórios (admin)
    uiStore.ts         Estado de UI (painel de blocos, sidebar mobile)
  components/
    AppLayout.tsx      Shell (sidebar + área central, responsivo)
    Sidebar.tsx        Histórico, busca, importar, painel de blocos
    BlocksPanel.tsx    Painel "Inserir bloco" (catálogo)
    Editor.tsx         Motor do editor (DnD + autosave)
    ReportRender.tsx   Renderização formatada (visualizador + export)
    ReportSummary.tsx  Dashboard do relatório
    ProtectedRoute.tsx / AdminRoute.tsx / Spinner.tsx
    blocks/            BlockRow, BlockBody, blockCatalog, editores
    ui/Inputs.tsx      Inputs e seletor/badge de status
  pages/
    LoginPage / SignupPage
    EmptyState         Tela inicial ("nenhum relatório aberto")
    ReportView         Editor (dono) ou visão formatada (visualizador)
    AdminPage + admin/ AdminUsers / AdminGroups / AdminReports
  App.tsx              Rotas
  main.tsx             Bootstrap + Router
```

> O schema do banco fica em `01_schema.sql` (entregue à parte).

---

## 🚀 Configuração e execução

### Pré-requisitos
- Node.js 18+ e npm
- Um projeto no [Supabase](https://supabase.com)

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar o Supabase
Crie um projeto no Supabase e copie as credenciais (Project Settings → API):
```bash
cp .env.example .env
```
Preencha o `.env`:
```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

### 3. Criar o banco
No **SQL Editor** do Supabase, cole e execute o arquivo `01_schema.sql`.
Ele cria as tabelas (`profiles`, `groups`, `group_members`, `reports`), as políticas de segurança (RLS), os gatilhos e o bucket de Storage `report-images`.

### 4. Rodar
```bash
npm run dev
```
Acesse o app, crie sua conta em `/signup` e faça login.

### 5. Tornar sua conta admin
No SQL Editor, troque pelo seu e-mail:
```sql
update public.profiles set role = 'admin'
where email = 'seu-email@empresa.com';
```

> Em desenvolvimento, você pode desligar a confirmação de e-mail em
> **Authentication → Sign In / Providers → Email → Confirm email** para entrar direto.

---

## 📜 Scripts

```bash
npm run dev       # ambiente de desenvolvimento
npm run build     # build de produção (tsc + vite)
npm run preview   # pré-visualiza o build
```

---

## 🔐 Segurança e permissões

A segurança é garantida no banco via **Row Level Security (RLS)** — a interface apenas reflete as regras:

- **Ver** um relatório: o dono, um admin, ou um membro do grupo do relatório.
- **Editar / excluir**: apenas o dono ou um admin.
- **Grupos e papéis**: gerenciados apenas por admins.
- **Storage** (`report-images`): leitura para usuários autenticados; cada usuário só remove seus próprios arquivos.

---

## 🖼️ Exportação / Importação

- **PDF**: usa a visão de impressão formatada (`ReportRender`) — alta qualidade, texto vetorial.
- **Word (.docx)**: gerado nativamente com a lib `docx`, com cores de status e imagens embutidas.
- **Importar Word**: o conteúdo é convertido em blocos editáveis (mapeamento aproximado: títulos, parágrafos, listas, tabelas e imagens).

---

## 🗺️ Possíveis evoluções

Inspiradas em ferramentas profissionais (Marker.io, BugHerd, TestRail/Qase):
- Status de ciclo do relatório (Rascunho / Em revisão / Aprovado).
- Comentários por bloco e responsáveis/prazo em itens.
- Templates de relatório reutilizáveis.
- Anotações sobre os prints (setas/retângulos).
- Link público somente-leitura, notificações e integrações (Jira/Trello/GitHub).
- Captura de metadados técnicos (navegador/SO/tela) e extensão de navegador.

---

## 📄 Licença

Projeto interno. Defina a licença conforme a necessidade da sua empresa.