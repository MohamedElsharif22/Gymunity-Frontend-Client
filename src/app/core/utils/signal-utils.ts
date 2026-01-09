/**
 * Signal Utilities for State Management
 * Provides helper functions for working with Angular Signals following best practices
 */

import { signal, computed, Signal, WritableSignal } from '@angular/core';

/**
 * Create a thread-scoped message store
 * Manages message deduplication and organization per thread
 */
export interface MessageStore {
  messagesPerThread: Map<number, Set<number>>; // threadId -> Set of messageIds
  messageDetails: Map<number, any>; // messageId -> Message object
}

/**
 * Initialize a message store for thread-scoped message management
 */
export function createMessageStore(): WritableSignal<MessageStore> {
  return signal<MessageStore>({
    messagesPerThread: new Map(),
    messageDetails: new Map()
  });
}

/**
 * Add message to store with deduplication
 * Returns true if message was added, false if duplicate
 */
export function addMessageToStore(
  store: MessageStore,
  threadId: number,
  message: any
): boolean {
  const messageIds = store.messagesPerThread.get(threadId) || new Set();

  // Check if message already exists (deduplication)
  if (messageIds.has(message.id)) {
    console.warn(`Duplicate message detected: ${message.id}, skipping`);
    return false;
  }

  // Add message ID to thread's set
  messageIds.add(message.id);
  store.messagesPerThread.set(threadId, messageIds);

  // Store message details
  store.messageDetails.set(message.id, message);

  return true;
}

/**
 * Get all messages for a thread, sorted by ID
 */
export function getThreadMessages(
  store: MessageStore,
  threadId: number
): any[] {
  const messageIds = store.messagesPerThread.get(threadId) || new Set();
  return Array.from(messageIds)
    .sort((a, b) => a - b)
    .map(id => store.messageDetails.get(id))
    .filter((msg): msg is any => msg !== undefined);
}

/**
 * Clear all messages for a thread
 */
export function clearThreadMessages(store: MessageStore, threadId: number): void {
  const messageIds = store.messagesPerThread.get(threadId);

  if (messageIds) {
    // Remove message details
    messageIds.forEach(id => store.messageDetails.delete(id));
    // Remove thread from mapping
    store.messagesPerThread.delete(threadId);
  }
}

/**
 * Clear all messages from store
 */
export function clearAllMessages(store: MessageStore): void {
  store.messagesPerThread.clear();
  store.messageDetails.clear();
}
