/**
 * Chat and messaging models
 * Aligns with Gymunity Backend API specification
 */

export interface ChatThread {
  id: number;
  userId: string;
  otherUserId: string;
  otherUserName?: string;
  otherUserProfilePhoto?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  createdAt?: Date;
}

export interface Message {
  id: number;
  threadId: number;
  senderId: string;
  senderName?: string;
  senderProfilePhoto?: string;
  content: string;
  mediaUrl?: string;
  type: MessageType;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
}

export interface CreateChatThreadRequest {
  otherUserId: string;
}

export interface SendMessageRequest {
  content: string;
  mediaUrl?: string;
  type: MessageType;
}

export enum MessageType {
  Text = 1,
  Image = 2,
  File = 3,
  Video = 4
}
