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
 * Quick helper returning category directly
 */
export function getFileCategory(
  filename: string,
  explicitExt?: string,
  mimeType?: string
): FileCategory {
  return getFileTypeInfo(filename, explicitExt, mimeType).category
}
