export type TicketStatus = "ai-handling" | "awaiting-user" | "escalated" | "resolved";
export type AppMode = "demo" | "live";
export type StaffRole = "owner" | "admin" | "staff";

export interface Ticket {
  id: string;
  user: string;
  avatar: string;
  subject: string;
  category: "Launch" | "Resolution" | "Admin Rights" | "In-Game Position" | "Debug" | "Other";
  status: TicketStatus;
  createdAt: string;
  lastMessage: string;
  messages: TicketMessage[];
  macro: string;
  isDemo?: boolean;
}

export interface TicketMessage {
  id: string;
  author: "user" | "ai" | "human";
  content: string;
  time: string;
  image?: string;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  path: string;
  size: string;
  byteSize: number;
  macro: string;
  language: "AHK2" | "JSON" | "MD" | "TXT" | "Other";
  indexed: boolean;
  updatedAt: string;
  content?: string;
  isDemo?: boolean;
}

export interface TrainedResponse {
  id: string;
  trigger: string;
  category: string;
  response: string;
  active: boolean;
  hits: number;
  isDemo?: boolean;
}

export interface BotCommand {
  id: string;
  command: string;
  description: string;
  response: string;
  active: boolean;
  isDemo?: boolean;
}

export interface StaffAccount {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  passwordHash: string;
  role: StaffRole;
  createdAt: string;
  lastLogin?: string;
}

export interface DiscordConfig {
  botToken: string;
  applicationId: string;
  guildId: string;
  ticketCategoryId: string;
  ticketChannelNames: string;
  staffChannelId: string;
  staffRoleId: string;
  webhookUrl: string;
  validated: boolean;
  validatedAt?: string;
  botName?: string;
  guildName?: string;
}

export type AIProviderId =
  | "pollinations"
  | "groq"
  | "openrouter"
  | "gemini"
  | "custom"
  | "local";

export interface AIConfig {
  provider: AIProviderId;
  apiKey: string;
  customEndpoint: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  enableImageReading: boolean;
  enableWebSearch: boolean;
  fallbackToLocal: boolean;
}

export interface BotConfig {
  tone: string;
  escalateKeyword: string;
  staffRolePing: string;
  quickFixFirst: boolean;
  autoTranslate: boolean;
  rateLimit: number;
}
