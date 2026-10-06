export const FREE_STORAGE_LIMIT_BYTES = 200 * 1024 * 1024 // 209715200 bytes (200 MB)

export const STORAGE_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    storageLimit: FREE_STORAGE_LIMIT_BYTES,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    storageLimit: 200 * 1024 * 1024 * 1024, // 200 GB
  },
  business: {
    id: 'business',
    name: 'Business',
    storageLimit: 2 * 1024 * 1024 * 1024 * 1024, // 2 TB
  },
}

export const DEFAULT_STORAGE_LIMIT = FREE_STORAGE_LIMIT_BYTES
export const DEFAULT_PLAN = 'free'

/**
 * Calculates normalized storage statistics for a user, safely handling legacy or missing fields.
 *
 * @param {Object} user - User document or plain object
 * @returns {{ used: number, limit: number, remaining: number, percentage: number, plan: string }}
 */
export const getStorageStats = (user) => {
  const plan = user?.plan && STORAGE_PLANS[user.plan] ? user.plan : DEFAULT_PLAN

  const limit =
    typeof user?.storageLimit === 'number' && user.storageLimit > 0
      ? user.storageLimit
      : STORAGE_PLANS[plan]?.storageLimit || DEFAULT_STORAGE_LIMIT

  const used =
    typeof user?.storageUsed === 'number' && user.storageUsed >= 0
      ? user.storageUsed
      : 0

  const remaining = Math.max(0, limit - used)
  const percentage =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0

  return {
    used,
    limit,
    remaining,
    percentage,
    plan,
  }
}
