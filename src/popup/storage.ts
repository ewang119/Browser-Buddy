import type { PetData } from './types'

const STORAGE_KEY = 'petData'

function isChromeExtension() {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local
}

export function savePetData(data: PetData): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isChromeExtension()) {
      console.warn('Chrome extension API not available, using localStorage as fallback')
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        resolve()
      } catch (error) {
        reject(error)
      }
      return
    }

    chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
      if (chrome.runtime.lastError) {
        console.error('Chrome storage error:', chrome.runtime.lastError)
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export function loadPetData(): Promise<PetData | null> {
  return new Promise((resolve, reject) => {
    if (!isChromeExtension()) {
      console.warn('Chrome extension API not available, using localStorage as fallback')
      try {
        const data = localStorage.getItem(STORAGE_KEY)
        resolve(data ? JSON.parse(data) : null)
      } catch (error) {
        reject(error)
      }
      return
    }

    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Chrome storage error:', chrome.runtime.lastError)
        reject(chrome.runtime.lastError)
      } else {
        resolve(result[STORAGE_KEY] ?? null)
      }
    })
  })
}
