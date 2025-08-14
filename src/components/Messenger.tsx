'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  where,
  doc,
  updateDoc
} from 'firebase/firestore'
import { Chat, Message, User } from '@/types/firebase'
import { 
  Send, 
  Search, 
  MoreVertical, 
  Image, 
  Video, 
  Plus,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Messenger() {
  const [user] = useAuthState(auth)
  const [chats, setChats] = useState<(Chat & { otherUser?: User })[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock data for demonstration
  const generateMockChats = () => {
    return [
      {
        id: 'chat-1',
        participants: [user?.uid || '', 'user-2'],
        type: 'direct' as const,
        lastMessage: {
          content: 'Hey! Love your latest video 🔥',
          senderId: 'user-2',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          type: 'text' as const
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000),
        otherUser: {
          id: 'user-2',
          username: 'creativedancer',
          displayName: 'Alex Rivera',
          email: 'alex@example.com',
          avatar: 'https://picsum.photos/40/40?random=2',
          followers: 1250,
          following: 890,
          videoStats: { totalVideos: 45, totalLikes: 12500, totalViews: 85000 },
          createdAt: new Date(),
          verified: true
        }
      },
      {
        id: 'chat-2',
        participants: [user?.uid || '', 'user-3'],
        type: 'direct' as const,
        lastMessage: {
          content: 'Thanks for the collab idea!',
          senderId: user?.uid || '',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'text' as const
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        otherUser: {
          id: 'user-3',
          username: 'musicproducer',
          displayName: 'Jordan Kim',
          email: 'jordan@example.com',
          avatar: 'https://picsum.photos/40/40?random=3',
          followers: 2100,
          following: 450,
          videoStats: { totalVideos: 67, totalLikes: 25000, totalViews: 150000 },
          createdAt: new Date(),
          verified: false
        }
      }
    ]
  }

  const generateMockMessages = (chatId: string) => {
    const isChat1 = chatId === 'chat-1'
    const otherUserId = isChat1 ? 'user-2' : 'user-3'
    
    return [
      {
        id: 'msg-1',
        chatId,
        senderId: otherUserId,
        content: 'Hey! I saw your latest video and it was amazing!',
        type: 'text' as const,
        readBy: { [user?.uid || '']: new Date(), [otherUserId]: new Date() },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: 'msg-2',
        chatId,
        senderId: user?.uid || '',
        content: 'Thank you so much! I really appreciate the feedback 😊',
        type: 'text' as const,
        readBy: { [user?.uid || '']: new Date(), [otherUserId]: new Date() },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'msg-3',
        chatId,
        senderId: otherUserId,
        content: isChat1 ? 'Would love to collaborate sometime!' : 'Want to work on something together?',
        type: 'text' as const,
        readBy: { [user?.uid || '']: new Date(), [otherUserId]: new Date() },
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]
  }

  // Load chats
  useEffect(() => {
    if (!user) return

    // Simulate loading chats
    setTimeout(() => {
      setChats(generateMockChats())
      setLoading(false)
    }, 1000)

    // In a real app, this would be:
    // const q = query(
    //   collection(db, 'chats'),
    //   where('participants', 'array-contains', user.uid),
    //   orderBy('updatedAt', 'desc')
    // )
    // const unsubscribe = onSnapshot(q, (snapshot) => {
    //   const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    //   setChats(chatsData)
    //   setLoading(false)
    // })
    // return unsubscribe
  }, [user])

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat) return

    // Simulate loading messages
    setMessages(generateMockMessages(selectedChat))

    // In a real app, this would be:
    // const q = query(
    //   collection(db, 'messages'),
    //   where('chatId', '==', selectedChat),
    //   orderBy('createdAt', 'asc'),
    //   limit(100)
    // )
    // const unsubscribe = onSnapshot(q, (snapshot) => {
    //   const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    //   setMessages(messagesData)
    //   scrollToBottom()
    // })
    // return unsubscribe
  }, [selectedChat])

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return

    const messageContent = newMessage.trim()
    setNewMessage('')

    try {
      // Optimistically add message to UI
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        chatId: selectedChat,
        senderId: user.uid,
        content: messageContent,
        type: 'text',
        readBy: { [user.uid]: new Date() },
        createdAt: new Date()
      }
      setMessages(prev => [...prev, tempMessage])

      // In a real app, this would add to Firestore:
      // await addDoc(collection(db, 'messages'), {
      //   chatId: selectedChat,
      //   senderId: user.uid,
      //   content: messageContent,
      //   type: 'text',
      //   readBy: { [user.uid]: serverTimestamp() },
      //   createdAt: serverTimestamp()
      // })

      // Update chat's last message
      // await updateDoc(doc(db, 'chats', selectedChat), {
      //   lastMessage: {
      //     content: messageContent,
      //     senderId: user.uid,
      //     timestamp: serverTimestamp(),
      //     type: 'text'
      //   },
      //   updatedAt: serverTimestamp()
      // })

    } catch (error) {
      console.error('Error sending message:', error)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const formatChatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return formatMessageTime(date)
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please sign in to access messages</p>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-white">
      {/* Chat List */}
      <div className={`w-full md:w-1/3 border-r ${selectedChat ? 'hidden md:block' : 'block'}`}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading chats...
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat === chat.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={chat.otherUser?.avatar || '/default-avatar.png'}
                    alt={chat.otherUser?.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">
                        {chat.otherUser?.displayName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {chat.lastMessage && formatChatTime(chat.lastMessage.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className={`flex-1 flex flex-col ${selectedChat ? 'block' : 'hidden md:flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedChat(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                {(() => {
                  const chat = chats.find(c => c.id === selectedChat)
                  return chat?.otherUser ? (
                    <>
                      <img
                        src={chat.otherUser.avatar || '/default-avatar.png'}
                        alt={chat.otherUser.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <h2 className="font-semibold">{chat.otherUser.displayName}</h2>
                        <p className="text-sm text-gray-500">@{chat.otherUser.username}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </>
                  ) : null
                })()}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user?.uid
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === user?.uid ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="mb-2">
                  <Image className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="mb-2">
                  <Video className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="mb-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
              <p className="text-gray-500">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}