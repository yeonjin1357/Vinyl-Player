import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import '@/i18n/config'; // init i18next so components using useTranslation render real strings

// jsdom doesn't implement matchMedia; usePrefersReducedMotion needs it.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
