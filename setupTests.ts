// Adds custom jest-dom matchers like toBeInTheDocument()
import "@testing-library/jest-dom";

// Provide a working indexedDB in Node
import "fake-indexeddb/auto";

// Optional: smooth over non-browser APIs you might use
// Example: matchMedia (frequently needed by UI libs)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    // addListener: () => {}, // deprecated
    // removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Optional: mock Vite env vars you rely on in code
// Access these in code via a small helper instead of import.meta.env directly.
(process as any).env = {
  ...process.env,
  VITE_API_URL: "http://localhost/test-api", // customize as needed
};
