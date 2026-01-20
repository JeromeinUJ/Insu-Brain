"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComplianceAlert } from "@/components/compliance-alert";
import { PdfViewerModal } from "@/components/pdf-viewer-modal";
import { exportWithWatermark } from "@/lib/utils";
import { Download, Sparkles } from "lucide-react";

// Mock data - in production, fetch from Supabase
const MOCK_COMPANIES = [
  { id: 1, name: "KB손해보험" },
  { id: 2, name: "삼성화재" },
  { id: 3, name: "현대해상" },
  { id: 4, name: "DB손해보험" },
  { id: 5, name: "메리츠화재" },
];

const MOCK_PRODUCTS = {
  1: [
    { id: "kb-1", name: "KB 간편건강보험" },
    { id: "kb-2", name: "KB 암보험" },
    { id: "kb-3", name: "KB 운전자보험" },
  ],
  2: [{ id: "ss-1", name: "삼성 건강보험" }],
  3: [{ id: "hd-1", name: "현대 건강보험" }],
  4: [{ id: "db-1", name: "DB 건강보험" }],
  5: [{ id: "mr-1", name: "메리츠 건강보험" }],
};

export function ComparisonTab() {
  const [myCompany, setMyCompany] = useState("1"); // KB 고정
  const [myProduct, setMyProduct] = useState("");
  const [competitorCompany, setCompetitorCompany] = useState("");
  const [competitorProduct, setCompetitorProduct] = useState("");
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showComplianceAlert, setShowComplianceAlert] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedPdfPage, setSelectedPdfPage] = useState(1);

  const handleCompare = async () => {
    if (!myProduct || !competitorProduct) {
      alert("상품을 모두 선택해주세요.");
      return;
    }

    setIsLoading(true);

    // Mock API call - replace with actual n8n webhook
    setTimeout(() => {
      setComparisonResult(`
**KB 간편건강보험의 우위 포인트:**

1. **면책기간 단축** (약관 14p)
   - KB: 최초 가입 후 90일
   - 경쟁사: 최초 가입 후 180일
   → "고객님, KB는 3개월만 지나면 바로 보장받으실 수 있습니다!"

2. **보장 범위 확대** (약관 22p)
   - KB: 고혈압·당뇨 합병증까지 보장
   - 경쟁사: 직접 원인 질병만 보장
   → "기존 병력 때문에 생기는 합병증도 KB는 다 커버합니다."

3. **갱신 보장** (약관 31p)
   - KB: 100세까지 자동 갱신
   - 경쟁사: 80세까지 갱신 후 재심사
      `);
      setIsLoading(false);
    }, 1500);
  };

  const handleEvidenceClick = (page: number) => {
    setSelectedPdfPage(page);
    setShowPdfViewer(true);
  };

  const handleDownload = () => {
    setShowComplianceAlert(true);
  };

  const handleConfirmedDownload = async () => {
    try {
      await exportWithWatermark("comparison-result", "kb-comparison.png");
    } catch (error) {
      console.error("Export failed:", error);
      alert("이미지 저장에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-kb-yellow" />
          승리 논리 생성기
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          경쟁사 대비 우리 상품의 강점을 AI가 분석합니다.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* My Company */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                내 회사 <span className="text-kb-yellow">★</span>
              </label>
              <Select value={myCompany} onValueChange={setMyCompany}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_COMPANIES.map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.name}
                      {company.id === 1 && " (추천)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                내 상품
              </label>
              <Select value={myProduct} onValueChange={setMyProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="상품 선택" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PRODUCTS[Number(myCompany) as keyof typeof MOCK_PRODUCTS]?.map(
                    (product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Competitor */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                경쟁사
              </label>
              <Select
                value={competitorCompany}
                onValueChange={setCompetitorCompany}
              >
                <SelectTrigger>
                  <SelectValue placeholder="경쟁사 선택" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_COMPANIES.filter((c) => c.id !== Number(myCompany)).map(
                    (company) => (
                      <SelectItem key={company.id} value={String(company.id)}>
                        {company.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                경쟁 상품
              </label>
              <Select
                value={competitorProduct}
                onValueChange={setCompetitorProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상품 선택" />
                </SelectTrigger>
                <SelectContent>
                  {competitorCompany &&
                    MOCK_PRODUCTS[
                      Number(competitorCompany) as keyof typeof MOCK_PRODUCTS
                    ]?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCompare}
          disabled={isLoading || !myProduct || !competitorProduct}
          className="w-full mt-6 bg-kb-yellow text-black hover:bg-kb-yellow/90"
        >
          {isLoading ? "분석 중..." : "비교 분석 시작"}
        </Button>
      </div>

      {/* Results */}
      {comparisonResult && (
        <div
          id="comparison-result"
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">분석 결과</h3>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              이미지 저장
            </Button>
          </div>

          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: comparisonResult
                .split("\n")
                .map((line) => {
                  // Convert page references to clickable links
                  return line.replace(
                    /\(약관 (\d+)p\)/g,
                    '<button class="text-kb-yellow hover:underline" onclick="window.handleEvidenceClick($1)">(약관 $1p)</button>'
                  );
                })
                .join("<br/>"),
            }}
          />
        </div>
      )}

      {/* Modals */}
      <ComplianceAlert
        open={showComplianceAlert}
        onOpenChange={setShowComplianceAlert}
        onConfirm={handleConfirmedDownload}
      />

      <PdfViewerModal
        open={showPdfViewer}
        onOpenChange={setShowPdfViewer}
        page={selectedPdfPage}
        productName="KB 간편건강보험 약관"
      />

      {/* Global handler for evidence clicks */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.handleEvidenceClick = function(page) {
              window.dispatchEvent(new CustomEvent('openPdfViewer', { detail: { page } }));
            }
          `,
        }}
      />
    </div>
  );
}
