declare module "*.css";

// Use 'var' to avoid block-scoped redeclaration errors if 'process' is already defined by other type definitions.
declare var process: {
  env: {
    [key: string]: string | undefined;
  };
};