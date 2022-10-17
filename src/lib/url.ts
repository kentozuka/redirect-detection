export const isValidUrl = (target: string): boolean => {
  try {
    new URL(target)
  } catch {
    return false
  }

  return true
}
