// Centralized app-level types
export type AppError = { code: string; message: string; details?: any };

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
