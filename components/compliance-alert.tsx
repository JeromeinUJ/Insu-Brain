"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ComplianceAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ComplianceAlert({
  open,
  onOpenChange,
  onConfirm,
}: ComplianceAlertProps) {
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (!agreed) return;
    onConfirm();
    onOpenChange(false);
    setAgreed(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-destructive">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl">법적 경고</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3 pt-4">
            <p className="font-semibold text-foreground">
              본 자료는 금융감독원 심의를 받지 않은 내부 교육용 자료입니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                <strong>SNS, 카페, 블로그 등 공개 게시 시</strong> 보험업법
                제97조에 따라 <span className="text-destructive font-bold">과태료 3천만원 이하</span> 처분 대상이 됩니다.
              </li>
              <li>
                본 자료는 <strong>1:1 상담 목적</strong>으로만 사용 가능합니다.
              </li>
              <li>
                카카오톡, 문자 등 <strong>개별 고객 전송</strong>은 허용됩니다.
              </li>
            </ul>
            <div className="mt-4 p-3 bg-muted rounded-md">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-kb-yellow"
                />
                <span className="text-sm">
                  위 내용을 충분히 이해했으며, <strong>1:1 전송 용도로만 사용</strong>하겠습니다.
                </span>
              </label>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!agreed}
            className="bg-kb-yellow text-black hover:bg-kb-yellow/90"
          >
            동의 및 저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
