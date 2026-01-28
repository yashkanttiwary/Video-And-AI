declare module "*.css";

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string | undefined;
  }
}
