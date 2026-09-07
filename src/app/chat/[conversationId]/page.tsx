import { ChatWorkspace } from '@/features/chat/chat-workspace';
export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) { const { conversationId } = await params; return <ChatWorkspace selectedId={conversationId} />; }
