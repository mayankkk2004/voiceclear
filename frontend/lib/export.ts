import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";

export function downloadTxt(text: string, filename = "transcript.txt"): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  saveAs(blob, filename);
}

export async function downloadDocx(
  text: string,
  filename = "transcript.docx"
): Promise<void> {
  const doc = new Document({
    sections: [
      {
        children: [new Paragraph(text)]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
