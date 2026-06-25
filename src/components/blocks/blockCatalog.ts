import {
  Heading, ListOrdered, Minus, FileText, Palette, AlignLeft, CircleCheckBig,
  LayoutPanelTop, ListChecks, MonitorSmartphone, Table, StickyNote,
  Image as ImageIcon, Link as LinkIcon, Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { BlockType } from '@/types/blocks'

export interface CatalogEntry {
  type: BlockType
  label: string
  desc: string
  icon: LucideIcon
  group: string
}

// Fonte única do catálogo de blocos (usado pelo painel lateral)
export const BLOCK_CATALOG: CatalogEntry[] = [
  { type: 'heading', label: 'Título de seção', desc: 'Divide o relatório em seções (H1–H3)', icon: Heading, group: 'Estrutura' },
  { type: 'step', label: 'Etapa numerada', desc: 'Passo numerado: Etapa 1, 2, 3…', icon: ListOrdered, group: 'Estrutura' },
  { type: 'divider', label: 'Divisor', desc: 'Linha que separa trechos', icon: Minus, group: 'Estrutura' },
  { type: 'report-header', label: 'Cabeçalho do relatório', desc: 'Cliente, URL, versão, navegador, técnico', icon: FileText, group: 'Estrutura' },
  { type: 'legend', label: 'Legenda de status', desc: 'Cores e o que cada status significa', icon: Palette, group: 'Estrutura' },
  { type: 'paragraph', label: 'Parágrafo', desc: 'Texto livre e observações', icon: AlignLeft, group: 'Conteúdo' },
  { type: 'status-item', label: 'Item de verificação', desc: 'Um item testado com status colorido', icon: CircleCheckBig, group: 'Conteúdo' },
  { type: 'page-card', label: 'Página/menu testado', desc: 'Uma página com vários itens verificados', icon: LayoutPanelTop, group: 'Conteúdo' },
  { type: 'checklist', label: 'Checklist (to-do)', desc: 'Lista de tarefas com caixas de seleção', icon: ListChecks, group: 'Conteúdo' },
  { type: 'device-test', label: 'Teste multi-dispositivo', desc: 'Mesma página em vários aparelhos', icon: MonitorSmartphone, group: 'Conteúdo' },
  { type: 'table', label: 'Tabela', desc: 'Tabela de URLs e status', icon: Table, group: 'Conteúdo' },
  { type: 'callout', label: 'Nota / callout', desc: 'Caixa de nota, atenção ou conclusão', icon: StickyNote, group: 'Conteúdo' },
  { type: 'image', label: 'Imagem / print', desc: 'Print do problema: enviar, arrastar ou colar', icon: ImageIcon, group: 'Mídia' },
  { type: 'link', label: 'Link', desc: 'URL testada', icon: LinkIcon, group: 'Mídia' },
  { type: 'video', label: 'Vídeo', desc: 'Vídeo demonstrando o bug', icon: Video, group: 'Mídia' },
]