import crypto from 'crypto'

const CURSOR_SECRET = process.env.CURSOR_SECRET

if (!CURSOR_SECRET) {
  throw new Error('CURSOR_SECRET is not defined')
}

export const createCursor = data => {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url')

  const signature = crypto
    .createHmac('sha256', CURSOR_SECRET)
    .update(payload)
    .digest('base64url')

  return `${payload}.${signature}`
}

export const decodeCursor = cursor => {
  const [payload, signature] = cursor.split('.')

  if (!payload || !signature) {
    throw new Error('Invalid cursor')
  }

  const expectedSignature = crypto
    .createHmac('sha256', CURSOR_SECRET)
    .update(payload)
    .digest('base64url')

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )

  if (!isValid) {
    throw new Error('Invalid cursor')
  }

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
}
