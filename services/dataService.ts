
import { Book } from '../types';

const SHEET_ID = '1CGC3NzrGwXJuKNI_C1tJ7rTM4U7F_CzASYSBe_oDlFU';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

declare var Papa: any;

export const fetchBooks = async (): Promise<Book[]> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다.');
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        // Ensure that line breaks inside quotes are handled correctly
        dynamicTyping: false,
        transform: (value: string) => value.trim(),
        complete: (results: any) => {
          const books: Book[] = results.data.map((row: any) => ({
            id: row['번호'] || Math.random().toString(),
            title: row['책 제목'] || '제목 없음',
            author: row['저자'] || '저자 미상',
            keywords: (row['키워드'] || '').split(',').map((k: string) => k.trim()).filter((k: string) => k),
            reason: row['추천 이유 및 활용 포인트'] || '',
            purchaseUrl: row['주문링크'] || '#',
            imageUrl: row['표지이미지 링크'] || 'https://picsum.photos/200/300?grayscale'
          }));
          resolve(books);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
};
