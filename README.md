# QA Report Builder

Plataforma web para criar, salvar e exportar checklists/relatórios de validação de sites.

## Stack
- React 19 + Vite + TypeScript
- Tailwind CSS v4
- Supabase (auth + banco + storage)
- Zustand (estado) e React Router (rotas)

## Como rodar (Parte 0)

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o Supabase:
   ```bash
   cp .env.example .env
   ```
   Preencha `.env` com a URL e a chave **anon** do seu projeto
   (Dashboard Supabase → Project Settings → API).

3. Rode o schema do banco:
   No SQL Editor do Supabase, cole e execute o arquivo `01_schema.sql`
   (entregue separadamente). Depois, crie sua conta e promova-a a admin
   com o `UPDATE` comentado no fim daquele arquivo.

4. Suba o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```
   A tela inicial deve mostrar **"Conectado ao Supabase"**.

## Estrutura
```
src/
  lib/supabase.ts     Cliente Supabase (singleton)
  types/blocks.ts     Modelo de blocos do relatório (contrato de dados)
  store/              Estado global (Zustand) — a partir da Parte 2
  components/         Componentes de UI
  pages/              Páginas/rotas
  App.tsx             Tela de verificação de conexão (provisória)
```

## Próximos passos
- Parte 2: autenticação e sessão
- Parte 3: layout (sidebar + canvas)
- Parte 4+: editor de blocos, painel admin, exportação/importação
