declare module "pdf-parse" {
  export default function pdf(dataBuffer: Buffer): Promise<{ text: string }>;
}
