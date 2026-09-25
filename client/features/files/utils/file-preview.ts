export type FileCategory =
  | 'image'
  | 'pdf'
  | 'video'
  | 'audio'
  | 'document'
  | 'code'
  | 'archive'
  | 'other'

export interface FileTypeInfo {
  category: FileCategory
  extension: string
  label: string
  colorClass: string
  bgClass: string
  badgeClass: string
  canHaveVisualThumbnail: boolean
  isDocument?: boolean
  docType?: 'word' | 'sheet' | 'slide' | 'generic'
}

export const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'ico',
  'bmp',
  'tiff',
  'avif'
])

export const PDF_EXTENSIONS = new Set(['pdf'])

export const VIDEO_EXTENSIONS = new Set([
  'mp4',
  'webm',
  'mov',
  'mkv',
  'avi',
  'm4v',
  'ogv'
])

export const AUDIO_EXTENSIONS = new Set([
  'mp3',
  'wav',
  'ogg',
  'm4a',
  'flac',
  'aac',
  'wma'
])

export const DOCUMENT_EXTENSIONS = new Set([
  'doc',
  'docx',
  'odt',
  'rtf',
  'xls',
  'xlsx',
  'ods',
  'csv',
  'ppt',
  'pptx',
  'odp'
])

export const CODE_EXTENSIONS = new Set([
  'txt',
  'md',
  'json',
  'js',
  'jsx',
  'ts',
  'tsx',
  'html',
  'css',
  'scss',
  'py',
  'java',
  'c',
  'cpp',
  'cs',
  'rs',
  'go',
  'php',
  'rb',
  'sql',
  'sh',
  'bat',
  'yaml',
  'yml',
  'xml',
  'env',
  'log'
])

export const ARCHIVE_EXTENSIONS = new Set([
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',
  'bz2'
])

/**
 * Extracts normalized file extension from a filename or explicit extension string
 */
export function extractExtension(filename: string, explicitExt?: string): string {
  if (explicitExt) {
    return explicitExt.replace(/^\./, '').trim().toLowerCase()
  }
  const parts = filename.split('.')
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase().trim() || ''
  }
  return ''
}

/**
 * Derives comprehensive file category and styling info from filename and extension
 */
export function getFileTypeInfo(
  filename: string,
  explicitExt?: string,
  mimeType?: string
): FileTypeInfo {
  const extension = extractExtension(filename, explicitExt)

  // Image detection
  if (mimeType?.startsWith('image/') || IMAGE_EXTENSIONS.has(extension)) {
    return {
      category: 'image',
      extension,
      label: extension.toUpperCase() || 'IMAGE',
      colorClass: 'text-emerald-500 dark:text-emerald-400',
      bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      badgeClass: 'bg-emerald-500 text-white',
      canHaveVisualThumbnail: true
    }
  }

  // PDF detection
  if (mimeType === 'application/pdf' || PDF_EXTENSIONS.has(extension)) {
    return {
      category: 'pdf',
      extension,
      label: 'PDF',
      colorClass: 'text-rose-500 dark:text-rose-400',
      bgClass: 'bg-rose-500/10 dark:bg-rose-500/15',
      badgeClass: 'bg-rose-500 text-white',
      canHaveVisualThumbnail: true
    }
  }

  // Video detection
  if (mimeType?.startsWith('video/') || VIDEO_EXTENSIONS.has(extension)) {
    return {
      category: 'video',
      extension,
      label: extension.toUpperCase() || 'VIDEO',
      colorClass: 'text-purple-500 dark:text-purple-400',
      bgClass: 'bg-purple-500/10 dark:bg-purple-500/15',
      badgeClass: 'bg-purple-500 text-white',
      canHaveVisualThumbnail: true
    }
  }

  // Audio detection
  if (mimeType?.startsWith('audio/') || AUDIO_EXTENSIONS.has(extension)) {
    return {
      category: 'audio',
      extension,
      label: extension.toUpperCase() || 'AUDIO',
      colorClass: 'text-amber-500 dark:text-amber-400',
      bgClass: 'bg-amber-500/10 dark:bg-amber-500/15',
      badgeClass: 'bg-amber-500 text-white',
      canHaveVisualThumbnail: false
    }
  }

  // Document detection (Word, Excel, PowerPoint, etc.)
  if (DOCUMENT_EXTENSIONS.has(extension)) {
    const isSpreadsheet = ['xls', 'xlsx', 'ods', 'csv'].includes(extension)
    const isPresentation = ['ppt', 'pptx', 'odp'].includes(extension)
    const docType = isSpreadsheet ? 'sheet' : isPresentation ? 'slide' : 'word'

    return {
      category: 'document',
      extension,
      label: extension.toUpperCase() || 'DOC',
      colorClass: isSpreadsheet
        ? 'text-emerald-600 dark:text-emerald-400'
        : isPresentation
        ? 'text-orange-500 dark:text-orange-400'
        : 'text-[#6E60EE] dark:text-[#8E82F8]',
      bgClass: isSpreadsheet
        ? 'bg-emerald-500/10'
        : isPresentation
        ? 'bg-orange-500/10'
        : 'bg-[#6E60EE]/10',
      badgeClass: isSpreadsheet
        ? 'bg-emerald-600 text-white'
        : isPresentation
        ? 'bg-orange-500 text-white'
        : 'bg-[#6E60EE] text-white',
      canHaveVisualThumbnail: false,
      isDocument: true,
      docType
    }
  }

  // Code / Text / Markdown detection
  if (mimeType?.startsWith('text/') || CODE_EXTENSIONS.has(extension)) {
    return {
      category: 'code',
      extension,
      label: extension.toUpperCase() || 'TXT',
      colorClass: 'text-cyan-600 dark:text-cyan-400',
      bgClass: 'bg-cyan-500/10 dark:bg-cyan-500/15',
      badgeClass: 'bg-cyan-600 text-white',
      canHaveVisualThumbnail: false
    }
  }

  // Archive detection
  if (ARCHIVE_EXTENSIONS.has(extension)) {
    return {
      category: 'archive',
      extension,
      label: extension.toUpperCase() || 'ZIP',
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-500/10 dark:bg-amber-500/15',
      badgeClass: 'bg-amber-600 text-white',
      canHaveVisualThumbnail: false
    }
  }

  // Unsupported / Other
  return {
    category: 'other',
    extension,
    label: extension.toUpperCase() || 'FILE',
    colorClass: 'text-text-secondary',
    bgClass: 'bg-input-bg',
    badgeClass: 'bg-text-secondary text-white',
    canHaveVisualThumbnail: false
  }
}

/**
 * Standard MIME type lookup mapping
 */
export const EXTENSION_MIME_MAP: Record<string, string> = {
  // Images
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  avif: 'image/avif',

  // Documents & PDFs
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  rtf: 'application/rtf',
  csv: 'text/csv',

  // Video
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  m4v: 'video/mp4',
  ogv: 'video/ogg',

  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  m4a: 'audio/mp4',
  flac: 'audio/flac',
  aac: 'audio/aac',
  wma: 'audio/x-ms-wma',

  // Code / Text
  txt: 'text/plain',
  log: 'text/plain',
  env: 'text/plain',
  md: 'text/markdown',
  markdown: 'text/markdown',
  json: 'application/json',
  js: 'text/javascript',
  mjs: 'text/javascript',
  cjs: 'text/javascript',
  jsx: 'text/javascript',
  ts: 'text/typescript',
  tsx: 'text/typescript',
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  scss: 'text/x-scss',
  sass: 'text/x-sass',
  less: 'text/x-less',
  py: 'text/x-python',
  java: 'text/x-java-source',
  c: 'text/x-c',
  cpp: 'text/x-c++',
  cs: 'text/x-csharp',
  rs: 'text/rust',
  go: 'text/x-go',
  php: 'text/x-php',
  rb: 'text/x-ruby',
  sql: 'application/sql',
  sh: 'application/x-sh',
  bat: 'application/x-bat',
  yaml: 'text/yaml',
  yml: 'text/yaml',
  xml: 'application/xml',

  // Archives
  zip: 'application/zip',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  '7z': 'application/x-7z-compressed',
  rar: 'application/vnd.rar'
}

/**
 * Returns the proper MIME type for a given filename or explicit extension
 */
export function getMimeType(
  filename: string,
  explicitExt?: string,
  fallbackMime?: string
): string {
  const extension = extractExtension(filename, explicitExt)
  if (extension && EXTENSION_MIME_MAP[extension]) {
    return EXTENSION_MIME_MAP[extension]
  }
  if (fallbackMime && fallbackMime !== 'application/octet-stream' && fallbackMime !== 'application/x-download') {
    return fallbackMime
  }
  return 'application/octet-stream'
}

/**
 * Ensures a Blob has a valid and specific MIME type matching its filename/extension
 */
export function ensureTypedBlob(
  blob: Blob,
  filename: string,
  explicitExt?: string,
  fallbackMime?: string
): Blob {
  // If the blob already has a specific non-generic MIME type, use it
  if (blob.type && blob.type !== 'application/octet-stream' && blob.type !== 'application/x-download') {
    return blob
  }

  const resolvedMime = getMimeType(filename, explicitExt, fallbackMime || blob.type)
  if (resolvedMime && resolvedMime !== blob.type && resolvedMime !== 'application/octet-stream') {
    return new Blob([blob], { type: resolvedMime })
  }

  return blob
}

/**
 * Safely revokes an Object URL with an optional delay to allow opened tabs or async decoders time to complete
 */
export function revokeBlobUrl(url?: string | null, delayMs = 60000): void {
  if (!url || typeof url !== 'string' || !url.startsWith('blob:')) return

  if (delayMs <= 0) {
    try {
      URL.revokeObjectURL(url)
    } catch {
      // Ignore if already revoked
    }
    return
  }

  setTimeout(() => {
    try {
      URL.revokeObjectURL(url)
    } catch {
      // Ignore
    }
  }, delayMs)
}

/**
 * Quick helper returning category directly
 */
export function getFileCategory(
  filename: string,
  explicitExt?: string,
  mimeType?: string
): FileCategory {
  return getFileTypeInfo(filename, explicitExt, mimeType).category
}
