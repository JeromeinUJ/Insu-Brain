"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface PdfViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl?: string;
  page?: number;
  productName?: string;
}

export function PdfViewerModal({
  open,
  onOpenChange,
  pdfUrl,
  page = 1,
  productName = "보험약관",
}: PdfViewerModalProps) {
  // In production, use a proper PDF viewer like react-pdf or embed
  // For MVP, we'll show a placeholder with instructions

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-kb-yellow" />
            <DialogTitle>{productName} - {page}페이지</DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex-1 flex items-center justify-center bg-muted rounded-md p-8">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#page=${page}`}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          ) : (
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                약관 PDF URL이 설정되지 않았습니다.
              </p>
              <p className="text-sm text-muted-foreground">
                Supabase의 insurance_products 테이블에 pdf_url을 추가해주세요.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
