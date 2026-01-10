/**
 * Chat and messaging models
 * Aligns with Gymunity Backend API specification
 */

export enum MessageType {
  Text = 1,
  Image = 2,
  Video = 3,
  Audio = 4,
  File = 5
}

/**
 * CreateChatThreadResponse
 * Response when creating a chat thread
 */
export interface CreateChatThreadResponse {
  id: number;
  clientId: string;
  trainerId: string;
  createdAt: Date;
  lastMessageAt: Date;
}

/**
 * ChatThread
 * Represents a conversation thread
 */
export interface ChatThread extends CreateChatThreadResponse {
  otherUserName?: string;
  otherUserProfilePhoto?: string;
  otherUserProfilePhotoUrl?: string;
  lastMessage?: string;
  unreadCount?: number;
  isOnline?: boolean;
  trainerProfileId?: number;
}

/**
 * MessageResponse
 * Represents a message in a thread
 * Note: Backend returns type as string (e.g., "Text"), we store it as-is
 */
export interface MessageResponse {
  id: number;
  threadId: number;
  senderId: string;
  senderName: string;
  senderProfilePhoto: string;
  content: string;
  mediaUrl?: string;
  type: string | MessageType;  // Accept both string and enum number from backend
  createdAt: Date;
  isRead: boolean;
}

/**
 * Message
 * Extended message model for UI
 */
export interface Message extends MessageResponse {
  isOwn?: boolean;
}

/**
 * CreateChatThreadRequest
 * Used to create a new chat thread with another user
 */
export interface CreateChatThreadRequest {
  otherUserId: string;
}

/**
 * SendMessageRequest
 * Used to send a message to a thread
 */
export interface SendMessageRequest {
  content: string;
  mediaUrl?: string;
  type: MessageType;
}

/**
 * ClientTrainer
 * Represents a trainer associated with a client
 * Used for starting new chat threads
 */
export interface ClientTrainer {
  userId: string;
  userName: string;
  fullName: string;
  profilePhotoUrl?: string;
  trainerProfileId: number;
  handle: string;
}
