import { supabase } from '@/lib/supabase'

const BUCKET = 'report-images'

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)

// Envia uma imagem e retorna o caminho (path) dentro do bucket privado.
export async function uploadReportImage(file: File, reportId: string, userId: string): Promise<string> {
  const ext = (file.name.split('.').pop() || file.type.split('/')[1] || 'png').toLowerCase()
  const path = `${userId}/${reportId}/${uid()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'image/png',
    upsert: false,
  })
  if (error) throw error
  return path
}

// Gera uma URL temporária para exibir a imagem (bucket é privado).
export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
  if (!path) return null
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn)
  if (error) {
    console.error('[storage] createSignedUrl:', error.message)
    return null
  }
  return data.signedUrl
}

// Remove a imagem do storage (usado ao trocar/remover).
export async function deleteReportImage(path: string): Promise<void> {
  if (!path) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.error('[storage] remove:', error.message)
}
