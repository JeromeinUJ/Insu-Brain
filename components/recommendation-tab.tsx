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
import { exportWithWatermark } from "@/lib/utils";
import { Download, Target, X } from "lucide-react";

const HEALTH_TAGS = [
  "고혈압",
  "당뇨",
  "고지혈증",
  "갑상선질환",
  "우울증",
  "디스크",
];

const OCCUPATION_LIST = [
  "사무직",
  "운전직",
  "배송기사",
  "택시기사",
  "건설업",
  "서비스업",
  "기타",
];

export function RecommendationTab() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showComplianceAlert, setShowComplianceAlert] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRecommend = async () => {
    if (!age || !gender) {
      alert("나이와 성별을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    // Mock rule engine - replace with Supabase function call
    setTimeout(() => {
      const results = [];
      const ageNum = Number(age);

      // Rule 1: 유병자 간편보험
      if (
        selectedTags.some((t) => ["고혈압", "당뇨", "고지혈증"].includes(t))
      ) {
        results.push({
          product: "KB 간편건강보험",
          reason: "고객님의 병력도 할증 없이 가입 가능한 KB 간편건강보험을 추천드립니다.",
          details: [
            "기존 보험 가입이 어려웠던 분들을 위한 맞춤 상품",
            "고혈압·당뇨 합병증까지 보장",
            "간편 심사로 빠른 가입",
          ],
          score: 100,
        });
      }

      // Rule 2: 자녀보험
      if (ageNum <= 15) {
        results.push({
          product: "KB 자녀보험",
          reason: "출생 전부터 가입 가능한 KB 자녀보험으로 우리 아이의 미래를 지켜주세요.",
          details: [
            "성장기 질병 및 상해를 폭넓게 보장",
            "교육비 지원 특약 가능",
            "성인이 되어도 계속 보장",
          ],
          score: 90,
        });
      }

      // Rule 3: 운전자보험
      if (
        occupation &&
        ["운전직", "배송기사", "택시기사"].includes(occupation)
      ) {
        results.push({
          product: "KB 운전자보험",
          reason: "운전이 많으신 고객님께는 형사합의금과 변호사 비용까지 보장하는 KB 운전자보험을 추천드립니다.",
          details: [
            "형사합의금 최대 3천만원",
            "변호사 선임비용 지원",
            "자동차 사고 벌금까지 보장",
          ],
          score: 95,
        });
      }

      // Rule 4: 성인 암보험 (기본 추천)
      if (ageNum >= 30 && ageNum <= 60 && results.length === 0) {
        results.push({
          product: "KB 암보험",
          reason: "암 가족력이 있거나 건강검진 결과가 걱정되시는 고객님께는 KB 암보험을 추천드립니다.",
          details: [
            "진단비 최대 1억원 보장",
            "표적항암약물치료비 지원",
            "암 재발 시에도 반복 보장",
          ],
          score: 80,
        });
      }

      // Sort by score
      results.sort((a, b) => b.score - a.score);
      setRecommendations(results.slice(0, 3));
      setIsLoading(false);
    }, 1000);
  };

  const handleDownload = () => {
    setShowComplianceAlert(true);
  };

  const handleConfirmedDownload = async () => {
    try {
      await exportWithWatermark("recommendation-result", "kb-recommendation.png");
    } catch (error) {
      console.error("Export failed:", error);
      alert("이미지 저장에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-kb-yellow" />
          고객 맞춤 추천
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          고객 정보를 입력하면 AI가 최적의 상품을 추천합니다.
        </p>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                나이 <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="예: 35"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                성별 <span className="text-destructive">*</span>
              </label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="성별 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">직업군</label>
              <Select value={occupation} onValueChange={setOccupation}>
                <SelectTrigger>
                  <SelectValue placeholder="직업 선택 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPATION_LIST.map((occ) => (
                    <SelectItem key={occ} value={occ}>
                      {occ}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Health Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              병력 (해당사항 모두 선택)
            </label>
            <div className="flex flex-wrap gap-2">
              {HEALTH_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-kb-yellow text-black"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {selectedTags.includes(tag) && (
                    <X className="inline h-3 w-3 mr-1" />
                  )}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleRecommend}
            disabled={isLoading || !age || !gender}
            className="w-full bg-kb-yellow text-black hover:bg-kb-yellow/90"
          >
            {isLoading ? "분석 중..." : "추천 받기"}
          </Button>
        </div>
      </div>

      {/* Results */}
      {recommendations.length > 0 && (
        <div
          id="recommendation-result"
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">추천 결과</h3>
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

          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="border border-border rounded-lg p-4 bg-muted/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-2 py-1 bg-kb-yellow text-black text-xs font-bold rounded mb-2">
                      추천 #{idx + 1}
                    </span>
                    <h4 className="text-lg font-semibold">{rec.product}</h4>
                  </div>
                  <div className="text-2xl font-bold text-kb-yellow">
                    {rec.score}
                  </div>
                </div>

                <p className="text-sm text-foreground mb-3">{rec.reason}</p>

                <ul className="space-y-1">
                  {rec.details.map((detail: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-kb-yellow">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-md text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> 고객에게 전달 시 "이미지 저장" 버튼을 눌러
            카카오톡이나 문자로 개별 전송하세요. (SNS 업로드 금지)
          </div>
        </div>
      )}

      <ComplianceAlert
        open={showComplianceAlert}
        onOpenChange={setShowComplianceAlert}
        onConfirm={handleConfirmedDownload}
      />
    </div>
  );
}
