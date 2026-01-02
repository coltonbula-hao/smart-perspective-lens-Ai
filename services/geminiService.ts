
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse, AnalysisSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeIntelligence(
  input: string | { data: string; mimeType: string },
  useWebSearch: boolean = false
): Promise<AnalysisResponse> {
  const model = "gemini-3-flash-preview";

  const contents = typeof input === 'string' 
    ? { parts: [{ text: `请分析以下内容或公司：${input}。如果是公司名称或简短描述，请利用网络搜索获取其最新的财务数据和市场表现。请使用简体中文输出结果。` }] }
    : { parts: [{ text: "请分析以下报告，并可结合网络搜索验证相关的最新行业趋势或财务背景。请使用简体中文输出结果。" }, { inlineData: input }] };

  const tools: any[] = [];
  if (useWebSearch) {
    tools.push({ googleSearch: {} });
  }

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: `你是一位世界级的商业情报分析师和投资策略专家。
      你的任务是处理提供的研究报告、文本或通过搜索获取的信息，并进行深度分析。
      
      步骤 A (提取)：提取关键财务数据（收入、增长、毛利）、市场份额预测和管理层表态。
      步骤 B (分析)：进行 SWOT 分析。识别那些隐含的、不明显的“隐形风险”。
      步骤 C (综合)：提供最终投资决策（买入 Buy、持有 Hold、卖出 Sell 或 观望 Wait）并给出明确理由。

      所有输出内容必须使用简体中文。
      在 SWOT 分析中，将关键的劣势或威胁标记为 'isHighRisk: true'。
      输出必须严格遵守 JSON 格式。`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          decision: { type: Type.STRING, description: "只能是以下之一: Buy, Hold, Sell, Wait" },
          decisionRationale: { type: Type.STRING },
          financialData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING },
                trend: { type: Type.STRING, description: "up, down, 或 stable" }
              },
              required: ["label", "value", "trend"]
            }
          },
          marketInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
          managementSentiment: { type: Type.STRING },
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, description: { type: Type.STRING } } } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, description: { type: Type.STRING }, isHighRisk: { type: Type.BOOLEAN } } } },
              opportunities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, description: { type: Type.STRING } } } },
              threats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, description: { type: Type.STRING }, isHighRisk: { type: Type.BOOLEAN } } } }
            }
          },
          hiddenRisks: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["executiveSummary", "decision", "decisionRationale", "swot", "financialData", "hiddenRisks"]
      },
      tools: tools.length > 0 ? tools : undefined,
    }
  });

  if (!response.text) {
    throw new Error("未能生成分析结果。");
  }

  const result = JSON.parse(response.text) as AnalysisResponse;

  // Extract grounding sources if available
  if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
    const sources: AnalysisSource[] = response.candidates[0].groundingMetadata.groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || "参考来源",
        uri: chunk.web.uri
      }));
    
    // De-duplicate sources
    result.sources = Array.from(new Map(sources.map(s => [s.uri, s])).values());
  }

  return result;
}
