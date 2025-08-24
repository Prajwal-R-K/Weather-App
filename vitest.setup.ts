import '@testing-library/jest-dom/vitest'

// Polyfill window.matchMedia for jsdom
if (typeof window !== 'undefined' && !(window as any).matchMedia) {
  (window as any).matchMedia = (query: string) => {
    const listeners = new Set<(e: MediaQueryListEvent) => void>()
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: (cb: (e: MediaQueryListEvent) => void) => listeners.add(cb), // deprecated API
      removeListener: (cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
      addEventListener: (_: 'change', cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
      removeEventListener: (_: 'change', cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
      dispatchEvent: (_: Event) => true,
    } as any
  }
}

// Mock HTMLDialogElement showModal/close for jsdom
if (typeof window !== 'undefined' && !(window as any).HTMLDialogElement) {
  // Minimal mock class
  class HTMLDialogElementMock extends HTMLElement {
    open = false
    showModal(){ this.open = true }
    close(){ this.open = false }
  }
  ;(window as any).HTMLDialogElement = HTMLDialogElementMock as any
}

// Ensure methods exist even if jsdom adds the element later
if (typeof window !== 'undefined' && (window as any).HTMLDialogElement) {
  const proto = (window as any).HTMLDialogElement.prototype as any
  if (!proto.showModal) proto.showModal = function(){ this.open = true }
  if (!proto.close) proto.close = function(){ this.open = false }
}
