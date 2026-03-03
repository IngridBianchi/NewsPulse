/// <reference types="vite/client" />

// En este proyecto no hay `tsconfig.json`, así que declaramos explícitamente `import.meta.env`
// para evitar el error: "Property 'env' does not exist on type 'ImportMeta'."
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

