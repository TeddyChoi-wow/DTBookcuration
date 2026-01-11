
import { GoogleGenAI } from "@google/genai";
import { Book } from "../types.ts";

/**
 * AI 기반 추천 또는 스마트 로컬 가중치 검색을 수행합니다.
 */
export const getAIRecommendations = async (query: string, books: Book[]): Promise<string[]> => {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) return books.map(b => b.id);

  // 1. API 키가 있는 경우 Gemini AI 사용 시도
  if (process.env.API_KEY && process.env.API_KEY !== "") {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const bookDataStr = books.map(b => `ID:${b.id} | Title:${b.title} | Reason:${b.reason} | Keywords:${b.keywords.join(',')}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          [Role] Design Thinking Book Curator.
          [Context] User Inquiry: "${trimmedQuery}"
          [Books]
          ${bookDataStr}
          [Task] Return ONLY a comma-separated list of relevant Book IDs, ranked by relevance. No explanation. If none, return "none".
        `,
        config: { temperature: 0.1 }
      });

      const result = response.text?.trim();
      if (result && result.toLowerCase() !== 'none') {
        const cleanedResult = result.replace(/[^0-9, ]/g, '');
        return cleanedResult.split(',').map(id => id.trim()).filter(id => id);
      }
    } catch (error) {
      console.warn("AI API Error, switching to Smart Local Search:", error);
    }
  }

  // 2. API 키가 없거나 실패한 경우: 스마트 로컬 가중치 검색 엔진 (Smart Local Search)
  // 디자인씽킹 맥락에 맞는 간단한 유의어 맵핑 (DT Context)
  const dtSynonyms: Record<string, string[]> = {
    "공감": ["고객", "인터뷰", "관찰", "사용자", "empathy", "마음", "심리"],
    "혁신": ["변화", "창의", "새로운", "innovation", "아이디어"],
    "문제": ["정의", "본질", "분석", "원인", "problem"],
    "실행": ["프로토타입", "테스트", "시제품", "prototype", "구현"],
    "협업": ["팀", "커뮤니케이션", "퍼실리테이션", "워크숍", "회의"]
  };

  const queryTokens = trimmedQuery.split(/\s+/);
  // 유의어까지 토큰에 포함
  const expandedTokens = [...queryTokens];
  queryTokens.forEach(token => {
    if (dtSynonyms[token]) expandedTokens.push(...dtSynonyms[token]);
  });

  const scoredBooks = books.map(book => {
    let score = 0;
    const contentToSearch = {
      title: book.title.toLowerCase(),
      keywords: book.keywords.map(k => k.toLowerCase()).join(' '),
      reason: book.reason.toLowerCase()
    };

    expandedTokens.forEach(token => {
      if (contentToSearch.title.includes(token)) score += 10;      // 제목 매칭 가중치 높음
      if (contentToSearch.keywords.includes(token)) score += 5;   // 키워드 매칭
      if (contentToSearch.reason.includes(token)) score += 2;     // 추천 이유 매칭
    });

    return { id: book.id, score };
  });

  // 점수가 0보다 큰 것만 골라내고 점수순 정렬
  return scoredBooks
    .filter(b => b.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(b => b.id);
};
