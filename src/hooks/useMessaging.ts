import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Message, Conversation, MediaMessage } from '@/types/messages'

export function useMessaging() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  // Listen to conversations
  useEffect(() => {
    if (!user?.uid) return

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos: Conversation[] = []
      snapshot.forEach((doc) => {
        convos.push({ id: doc.id, ...doc.data() } as Conversation)
      })
      setConversations(convos)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user?.uid])

  // Listen to messages in active conversation
  useEffect(() => {
    if (!activeConversation) return

    const q = query(
      collection(db, `conversations/${activeConversation}/messages`),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = []
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message)
      })
      setMessages(msgs)
    })

    return () => unsubscribe()
  }, [activeConversation])

  // Send a message
  const sendMessage = useCallback(async (
    recipientId: string,
    content: string,
    type: Message['type'] = 'text',
    media?: MediaMessage
  ) => {
    if (!user?.uid) return

    try {
      // Find or create conversation
      let conversationId = conversations.find(
        c => c.participants.includes(recipientId)
      )?.id

      if (!conversationId) {
        const convoRef = await addDoc(collection(db, 'conversations'), {
          participants: [user.uid, recipientId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unreadCount: 1
        })
        conversationId = convoRef.id
      }

      // Add message to conversation
      await addDoc(collection(db, `conversations/${conversationId}/messages`), {
        senderId: user.uid,
        recipientId,
        content,
        type,
        media,
        createdAt: serverTimestamp(),
        read: false
      })

      // Update conversation timestamp
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: {
          content,
          type,
          senderId: user.uid,
          createdAt: new Date()
        },
        updatedAt: serverTimestamp(),
        unreadCount: messages.filter(m => !m.read).length + 1
      })

      return conversationId
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }, [user?.uid, conversations, messages])

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user?.uid) return

    const conversationRef = doc(db, 'conversations', conversationId)
    const messagesRef = collection(db, `conversations/${conversationId}/messages`)
    
    const unreadMessages = messages.filter(m => !m.read && m.recipientId === user.uid)
    
    // Update all unread messages
    await Promise.all(
      unreadMessages.map(message =>
        updateDoc(doc(messagesRef, message.id), { read: true })
      )
    )

    // Update conversation unread count
    await updateDoc(conversationRef, { unreadCount: 0 })
  }, [user?.uid, messages])

  return {
    conversations,
    messages,
    loading,
    activeConversation,
    setActiveConversation,
    sendMessage,
    markAsRead
  }
}
