export interface Conversation {
  id: string;
  jobId: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
}

export interface ConversationWithDetails extends Conversation {
  job: { id: string; title: string };
  otherParticipant: {
    id: string;
    firstName: string;
    avatarUrl?: string | null;
  };
  lastMessage?: Message | null;
  unreadCount: number;
}

export enum NotificationType {
  NEW_JOB = 'NEW_JOB',
  NEW_APPLICATION = 'NEW_APPLICATION',
  APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED',
  APPLICATION_DECLINED = 'APPLICATION_DECLINED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  JOB_REMINDER = 'JOB_REMINDER',
  JOB_STARTED = 'JOB_STARTED',
  JOB_COMPLETED = 'JOB_COMPLETED',
  NEW_REVIEW = 'NEW_REVIEW',
  JOB_CANCELLED = 'JOB_CANCELLED',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
}
