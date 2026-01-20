"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComparisonTab } from "@/components/comparison-tab";
import { RecommendationTab } from "@/components/recommendation-tab";
import { Swords, Lightbulb } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">
          설계사를 위한 <span className="text-kb-yellow">AI 어시스턴트</span>
        </h2>
        <p className="text-muted-foreground">
          KB 상품의 강점을 찾고, 고객에게 딱 맞는 보험을 추천하세요
        </p>
      </div>

      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger
            value="comparison"
            className="data-[state=active]:bg-kb-yellow data-[state=active]:text-black py-3"
          >
            <Swords className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-semibold">상품 비교</div>
              <div className="text-xs opacity-80">A사보다 우리가 뭐가 좋아?</div>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="recommendation"
            className="data-[state=active]:bg-kb-yellow data-[state=active]:text-black py-3"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-semibold">AI 추천</div>
              <div className="text-xs opacity-80">이 고객한테 뭐 팔아야 해?</div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="mt-6">
          <ComparisonTab />
        </TabsContent>

        <TabsContent value="recommendation" className="mt-6">
          <RecommendationTab />
        </TabsContent>
      </Tabs>

      {/* Info Panel */}
      <div className="mt-8 bg-muted/50 border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="text-kb-yellow">ℹ️</span>
          사용 가이드
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">상품 비교:</strong> 경쟁사 상품 대비 KB 상품의 우위 조항을 자동 분석합니다.
          </li>
          <li>
            <strong className="text-foreground">AI 추천:</strong> 고객의 나이, 성별, 병력 등을 입력하면 최적의 KB 상품을 추천합니다.
          </li>
          <li>
            <strong className="text-destructive">⚠️ 법적 준수사항:</strong>{" "}
            본 시스템으로 생성된 자료는 금융감독원 심의를 받지 않았습니다.
            SNS 게시 시 과태료 대상이 되므로, 반드시 1:1 상담 목적으로만 사용하세요.
          </li>
        </ul>
      </div>
    </div>
  );
}
