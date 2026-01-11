// /// <reference types="vite/client" />

declare const process: {
  env: {
    API_KEY: string | undefined;
    [key: string]: string | undefined;
  }
}

interface Window {
  aistudio?: {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  };
}

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const value: string;
  export default value;
}
