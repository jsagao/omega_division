export interface Post {
  _id: string;
  title: string;
  slug: string;
  desc?: string;
  content?: string;
  img?: string;
  category?: string;
  isFeatured?: boolean;
  featuredPosition?: "main" | "mini" | "portfolio";
  featuredRank?: number;
  videoUrl?: string;
  series?: string;
  seriesPart?: number;
  user?: PostUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostUser {
  clerkUserId?: string;
  username?: string;
  img?: string;
}

export interface Comment {
  _id: string;
  desc: string;
  user: CommentUser;
  post: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentUser {
  clerkUserId?: string;
  username?: string;
  img?: string;
}

export interface NewsItem {
  id?: string;
  title: string;
  url?: string;
  image?: string;
  source?: string;
  age?: string;
  kicker?: string;
}

export interface NewsPayload {
  hero: NewsItem | null;
  topRight?: NewsItem[];
  subCards?: NewsItem[];
  latest?: NewsItem[];
}

export interface TickerQuote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  [key: string]: unknown;
}

export interface TransformOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
}
