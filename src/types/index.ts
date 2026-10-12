export type Domain = "anime" | "movies" | "music" | "books" | "places";

export interface ShelfItem {
  id: string;
  shelfId: string;
  title: string;
  subtitle?: string;
  coverImageUrl: string;
  description?: string;
  userNote?: string;
  domain: Domain;
  qlooEntityId?: string;
  year?: string;
  ratingOrStatus?: string;
  createdAt: string;
}

export interface Shelf {
  id: string;
  title: string;
  domain: Domain;
  itemCount: number;
  items: ShelfItem[];
  colorTheme?: string;
  position?: { x: number; y: number };
  createdAt: string;
}

export interface SearchResultItem {
  title: string;
  subtitle?: string;
  coverImageUrl: string;
  description?: string;
  domain: Domain;
  year?: string;
  externalId?: string;
}
