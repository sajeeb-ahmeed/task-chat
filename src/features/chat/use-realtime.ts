'use client';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { API_ORIGIN } from '@/lib/api';
import type { Message, Session } from '@/lib/types';
import { normalizeSocketMessage } from '@/lib/messages';
export function useRealtime(session: Session) {
  const client = useQueryClient();
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const socket = io(API_ORIGIN, { auth: { token: session.token }, reconnection: true });
    const reconcile = () => {
      void client.invalidateQueries({ queryKey: ['conversations'] });
      void client.invalidateQueries({ queryKey: ['messages'] });
    };
    socket.on('connect', () => {
      setConnected(true);
      reconcile();
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    socket.on('message:new', (payload: unknown) => {
      const message = normalizeSocketMessage(payload);
      if (!message) {
        reconcile();
        return;
      }
      client.setQueryData<Message[]>(
        ['live', session.user._id, message.conversation],
        (old = []) => [...old.filter((m) => m._id !== message._id), message],
      );
      void client.invalidateQueries({ queryKey: ['conversations'] });
    });
    socket.on('conversation:updated', reconcile);
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [session.token, session.user._id, client]);
  return connected;
}
