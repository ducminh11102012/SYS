import mammoth from "mammoth";
import pdf from "pdf-parse";

export class DocumentService {
  async extractText(fileName: string, fileBuffer: Buffer): Promise<string> {
    if (fileName.toLowerCase().endsWith(".pdf")) {
      const parsed = await pdf(fileBuffer);
      return parsed.text;
    }

    if (fileName.toLowerCase().endsWith(".docx") || fileName.toLowerCase().endsWith(".doc")) {
      const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
      return parsed.value;
    }

    throw new Error("Unsupported file type. Only PDF/DOC/DOCX are allowed.");
  }
}
