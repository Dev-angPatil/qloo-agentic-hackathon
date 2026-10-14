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

export type RecommendationMode = "more_like_this" | "surprise_me" | "go_wild" | "trip_guide";

export interface RecommendationItem {
  id: string;
  title: string;
  subtitle?: string;
  domain: Domain;
  badgeLabel?: string;
  affinity: number; // Integer percentage 0 - 100
  popularity: number; // Float 0.0 - 1.0
  coverImageUrl: string;
  bridgeReasoning: string;
  year?: string;
  description?: string;
  address?: string;
  tags?: string[];
}

// Aliases for blueprint compatibility
export type RecommendationEntity = RecommendationItem;

export interface RecommendationsApiResponse {
  success: boolean;
  mode: RecommendationMode;
  count?: number;
  totalResults?: number;
  seedUsed?: string;
  targetDomain?: Domain;
  city?: string;
  recommendations: RecommendationItem[];
  error?: string;
  details?: string;
}

export type RecommendationsResponse = RecommendationsApiResponse;
