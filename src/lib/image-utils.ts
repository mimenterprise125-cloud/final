import supabase from './supabase'

/**
 * Compress an image File (png/jpg) to WebP, resize to maxWidth, and return a Blob.
 * Uses browser canvas APIs; no external deps required.
 */
export async function compressImageFileToWebP(
  file: File,
  opts: { maxWidth?: number; quality?: number } = {}
): Promise<Blob> {
  const maxWidth = opts.maxWidth ?? 1200
  const quality = opts.quality ?? 0.75

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  let canvas: OffscreenCanvas | HTMLCanvasElement
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(width, height)
  } else {
    canvas = document.createElement('canvas')
  }

  // @ts-ignore
  const ctx = (canvas as any).getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)

  const mime = 'image/webp'
  const blob: Blob = await new Promise((resolve, reject) => {
    // @ts-ignore
    ;(canvas as HTMLCanvasElement).toBlob(
      (b: Blob | null) => {
        if (!b) return reject(new Error('Failed to create blob'))
        resolve(b)
      },
      mime,
      quality
    )
  })

  return blob
}

/**
 * Upload blob to Supabase Storage under `journal-screenshots/{userId}/{filename}`.
 * Returns the public URL (if bucket public) and the path.
 */
export async function uploadJournalImage(
  blob: Blob,
  userId: string,
  filename?: string
): Promise<{ path: string; publicUrl?: string }> {
  const bucket = 'journal-screenshots'
  const name = filename ?? `journal-${Date.now()}.webp`
  const path = `${userId}/${name}`

  const { data, error } = await supabase.storage.from(bucket).upload(path, blob as any, {
    contentType: 'image/webp',
    upsert: false,
  })
  if (error) throw error

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return { path: data.path, publicUrl: publicData?.publicUrl }
}
