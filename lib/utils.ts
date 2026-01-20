import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import html2canvas from "html2canvas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compliance-safe image export with mandatory watermark
 * Adds legal disclaimer at bottom and diagonal watermark
 */
export async function exportWithWatermark(
  elementId: string,
  filename: string = "insu-brain-result.png"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Capture the element exactly as shown in browser
    const originalCanvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: "#1a1a1a",
    });

    // Create final canvas with space for watermark and disclaimer
    const padding = 40;
    const disclaimerHeight = 100;
    const finalCanvas = document.createElement("canvas");

    finalCanvas.width = originalCanvas.width + (padding * 2);
    finalCanvas.height = originalCanvas.height + (padding * 2) + disclaimerHeight;

    const ctx = finalCanvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    // Draw background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Draw captured content
    ctx.drawImage(originalCanvas, padding, padding);

    // Draw diagonal watermark
    ctx.save();
    ctx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
    ctx.rotate(-45 * Math.PI / 180);
    ctx.font = "bold 120px Arial";
    ctx.fillStyle = "rgba(255, 188, 0, 0.25)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("INTERNAL USE ONLY", 0, 0);
    ctx.restore();

    // Draw bottom disclaimer bar
    const disclaimerY = finalCanvas.height - disclaimerHeight;

    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(0, disclaimerY, finalCanvas.width, disclaimerHeight);

    ctx.fillStyle = "#ffbc00";
    ctx.fillRect(0, disclaimerY, finalCanvas.width, 6);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const line1 = "⚠️ 본 자료는 심의필이 없는 내부 교육용 자료이며, SNS 게시를 금합니다.";
    const line2 = "1:1 상담 목적으로만 활용 가능합니다.";

    ctx.fillText(line1, finalCanvas.width / 2, disclaimerY + 30);
    ctx.fillText(line2, finalCanvas.width / 2, disclaimerY + 65);

    // Download
    const link = document.createElement("a");
    link.download = filename;
    link.href = finalCanvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    console.error("Image export failed:", error);
    throw error;
  }
}

/**
 * Format page reference for evidence links
 */
export function formatPageRef(page: number): string {
  return `(약관 ${page}p)`;
}
