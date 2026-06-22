declare module '*.less' {}
declare module 'semantic-ui-less/semantic.less' {}

declare global {
  interface Window {
    navigator: Navigator & {
      msSaveBlob?: (blob: Blob, filename: string) => boolean;
    };
    port?: number;
    urlBase?: string;
  }
}

export {};
