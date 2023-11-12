// declarations.d.ts
// Tell TypeScript that when we import a file ending in .ttf, .woff, or .woff2, to treat it as a module with a default export of type string.
declare module '*.ttf' {
    const content: string;
    export default content;
  }
  
  declare module '*.woff' {
    const content: string;
    export default content;
  }
  
  declare module '*.woff2' {
    const content: string;
    export default content;
  }
