export type TicketStatus = "ai-handling" | "awaiting-user" | "escalated" | "resolved";

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
  macro: string;
  language: "AHK2" | "JSON" | "MD" | "TXT";
  indexed: boolean;
  updatedAt: string;
}

export interface TrainedResponse {
  id: string;
  trigger: string;
  category: string;
  response: string;
  active: boolean;
  hits: number;
}

export interface BotCommand {
  id: string;
  command: string;
  description: string;
  response: string;
  active: boolean;
}
