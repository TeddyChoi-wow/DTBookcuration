
export interface Book {
  id: string;
  title: string;
  author: string;
  keywords: string[];
  reason: string;
  purchaseUrl: string;
  imageUrl: string;
}

export interface RawSheetRow {
  [key: string]: string;
}
