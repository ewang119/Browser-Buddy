import type { PetData } from './types'

const STORAGE_KEY = 'petData'

export function savePetData(data: PetData): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError)
      else resolve()
    })
  })
}

export function loadPetData(): Promise<PetData | null> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError)
      else resolve(result[STORAGE_KEY] ?? null)
    })
  })
}

export function clearPetData(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(STORAGE_KEY, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError)
      else resolve()
    })
  })
}
