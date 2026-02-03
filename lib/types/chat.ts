// Message interface for chat messages
export interface MessageType {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; uri: string }>;
  suggestions?: string[];
}
