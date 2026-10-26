/// <reference types="vite/client" />

declare module '*.woff2?url' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
