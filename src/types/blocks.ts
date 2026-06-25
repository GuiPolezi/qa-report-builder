// ============================================================
// QA REPORT BUILDER — Parte 1: Modelo de Blocos (contrato de dados)
//
// Este arquivo é a "fonte da verdade" da estrutura dos relatórios.
// O editor, o autosave, a exportação (PDF/Word) e a importação vão
// todos depender destes tipos. O conteúdo do relatório é um array
// de blocos guardado na coluna `reports.blocks` (jsonb) do Supabase.
// ============================================================

// ---------- Status (mapeia a legenda dos checklists) ----------
export type StatusValue = 'success' | 'problem' | 'untested' | 'partial';

export const STATUS_META: Record<StatusValue, { label: string; color: string }> = {
  success:  { label: 'Êxito',       color: '#16a34a' }, // verde
  problem:  { label: 'Problema',    color: '#dc2626' }, // vermelho
  untested: { label: 'Não testado', color: '#f59e0b' }, // amarelo
  partial:  { label: 'Parcial',     color: '#2563eb' }, // azul (ex.: "aparentemente funcionando")
};

// ---------- Tipos de bloco ----------
export type BlockType =
  | 'report-header'
  | 'legend'
  | 'heading'
  | 'step'
  | 'divider'
  | 'status-item'
  | 'page-card'
  | 'paragraph'
  | 'checklist'
  | 'device-test'
  | 'image'
  | 'link'
  | 'video'
  | 'callout'
  | 'table';

// Campos comuns a todos os blocos
interface BaseBlock {
  id: string;        // uuid do bloco (gerar no client)
  type: BlockType;
}

// 1. Cabeçalho do relatório (campos padronizados dos checklists)
export interface ReportHeaderBlock extends BaseBlock {
  type: 'report-header';
  client: string;       // ex.: "Câmara Municipal de Paulo de Faria"
  siteUrl: string;
  startDate: string;    // ISO yyyy-mm-dd
  endDate?: string;
  siteVersion: string;  // ex.: "2026 – 1.0.0.6"
  browser: string;      // ex.: "Google Chrome"
  technician: string;   // ex.: "Guilherme – Equipe de Suporte"
}

// 2. Legenda de status
export interface LegendBlock extends BaseBlock {
  type: 'legend';
  items: { status: StatusValue; label: string }[];
}

// 3. Título de seção
export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3;
  text: string;
}

// 4. Etapa numerada (estilo "Etapa 1", "Etapa 2"...)
export interface StepBlock extends BaseBlock {
  type: 'step';
  number: number;
  title: string;
}

// 5. Divisor
export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

// 6. Item de verificação com status (bloco-núcleo)
export interface StatusItemBlock extends BaseBlock {
  type: 'status-item';
  label: string;
  status: StatusValue;
  description?: string;
}

// Item usado dentro de page-card
export interface PageFinding {
  label: string;
  status: StatusValue;
  description?: string;
}

// 7. Página/Menu testado (card): nome + url + itens aninhados
export interface PageCardBlock extends BaseBlock {
  type: 'page-card';
  name: string;
  url?: string;
  status?: StatusValue;     // status geral da página (opcional)
  findings: PageFinding[];
}

// 8. Parágrafo / texto livre
export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  text: string;
  color?: StatusValue; // cor do texto, alinhada à legenda (opcional)
}

// 9. Checklist (to-do)
export interface ChecklistBlock extends BaseBlock {
  type: 'checklist';
  items: { text: string; done: boolean }[];
}

// 10. Teste multi-dispositivo (responsividade)
export type DeviceKind = 'desktop' | 'tablet' | 'mobile' | string;

export interface DeviceTestBlock extends BaseBlock {
  type: 'device-test';
  pageName: string;
  url?: string;
  devices: { device: DeviceKind; label: string; status: StatusValue; notes?: string }[];
}

// 11. Imagem / print  (path no bucket "report-images")
export interface ImageBlock extends BaseBlock {
  type: 'image';
  storagePath: string;   // caminho dentro do bucket
  caption?: string;
}

// 12. Link / URL testada
export interface LinkBlock extends BaseBlock {
  type: 'link';
  url: string;
  label?: string;
}

// 13. Vídeo / anexo (link demonstrando o bug)
export interface VideoBlock extends BaseBlock {
  type: 'video';
  url: string;
  label?: string;
}

// 14. Nota / callout (notas finais, conclusões)
export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  variant: 'note' | 'warning' | 'conclusion';
  title?: string;
  text: string;
}

// 15. Tabela genérica
export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

// ---------- União discriminada de todos os blocos ----------
export type Block =
  | ReportHeaderBlock
  | LegendBlock
  | HeadingBlock
  | StepBlock
  | DividerBlock
  | StatusItemBlock
  | PageCardBlock
  | ParagraphBlock
  | ChecklistBlock
  | DeviceTestBlock
  | ImageBlock
  | LinkBlock
  | VideoBlock
  | CalloutBlock
  | TableBlock;

// ---------- Relatório (espelha a tabela `reports`) ----------
export interface Report {
  id: string;
  ownerId: string;
  groupId: string | null;
  title: string;
  clientName?: string | null;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Fábrica de blocos novos (defaults sensatos para o editor)
// Uso: const bloco = createBlock('status-item')
// ============================================================
const uid = () =>
  (globalThis.crypto?.randomUUID?.() ??
    'b_' + Math.random().toString(36).slice(2) + Date.now().toString(36));

export function createBlock(type: BlockType): Block {
  const id = uid();
  switch (type) {
    case 'report-header':
      return { id, type, client: '', siteUrl: '', startDate: '', siteVersion: '', browser: 'Google Chrome', technician: '' };
    case 'legend':
      return {
        id, type,
        items: [
          { status: 'problem',  label: 'Problema' },
          { status: 'success',  label: 'Êxito' },
          { status: 'untested', label: 'Não testado' },
        ],
      };
    case 'heading':      return { id, type, level: 2, text: '' };
    case 'step':         return { id, type, number: 1, title: '' };
    case 'divider':      return { id, type };
    case 'status-item':  return { id, type, label: '', status: 'untested', description: '' };
    case 'page-card':    return { id, type, name: '', url: '', findings: [] };
    case 'paragraph':    return { id, type, text: '' };
    case 'checklist':    return { id, type, items: [{ text: '', done: false }] };
    case 'device-test':
      return {
        id, type, pageName: '', url: '',
        devices: [
          { device: 'desktop', label: 'MacBook Pro',  status: 'untested' },
          { device: 'tablet',  label: 'iPad',         status: 'untested' },
          { device: 'mobile',  label: 'iPhone 12 Pro', status: 'untested' },
        ],
      };
    case 'image':        return { id, type, storagePath: '', caption: '' };
    case 'link':         return { id, type, url: '', label: '' };
    case 'video':        return { id, type, url: '', label: '' };
    case 'callout':      return { id, type, variant: 'note', text: '' };
    case 'table':        return { id, type, headers: ['Coluna 1', 'Coluna 2'], rows: [['', '']] };
  }
}

// Relatório novo em branco, já com cabeçalho + legenda
export function createEmptyReport(ownerId: string): Omit<Report, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    ownerId,
    groupId: null,
    title: 'Novo Relatório',
    clientName: null,
    blocks: [createBlock('report-header'), createBlock('legend')],
  };
}