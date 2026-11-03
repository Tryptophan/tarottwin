/**
 * Debug flag: show every card in the Collection as unlocked. It is a build-time setting:
 * run `VITE_UNLOCK_ALL=true npm run dev` (or `npm run dev:unlocked`), or build with it set.
 */
export const UNLOCK_ALL = import.meta.env.VITE_UNLOCK_ALL === 'true'

export function unlockAll(): boolean {
  return UNLOCK_ALL
}
