import { apiClient } from './client';

export interface Message {
  id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  listing?: { id: string; title: string; status: string };
  sender: { id: string; firstName: string; lastName: string; profilePhoto?: string };
  receiver?: { id: string; firstName: string; lastName: string; profilePhoto?: string };
}

export interface InboxData {
  threads: Message[];
  unreadCount: number;
}

export const messagesApi = {
  getInbox: () =>
    apiClient.get<InboxData>('/messages/inbox').then((r) => r.data),

  getThread: (listingId: string, partnerId: string) =>
    apiClient.get<Message[]>(`/messages/thread/${listingId}/${partnerId}`).then((r) => r.data),

  send: (data: { listingId: string; receiverId: string; body: string }) =>
    apiClient.post<Message>('/messages', data).then((r) => r.data),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/messages/unread-count').then((r) => r.data),
};
