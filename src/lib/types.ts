export type User = { _id: string; name: string; phone: string; createdAt?: string };
export type Session = { token: string; user: User };
export type Message = {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: string;
};
export type MessagePage = { messages: Message[]; hasMore: boolean };
export type Conversation = {
  _id: string;
  type: 'direct' | 'group';
  updatedAt: string;
  lastMessage?: Partial<Pick<Message, 'text' | 'sender' | 'createdAt'>>;
  participant?: User;
  name?: string;
  participants?: User[];
  admins?: string[];
};
export const conversationName = (c: Conversation) =>
  c.type === 'group' ? c.name || 'Untitled group' : c.participant?.name || 'Conversation';
