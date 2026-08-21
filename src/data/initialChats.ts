import { Chat, Message, User } from '../types/telegram';

export const CURRENT_USER: User = {
  id: 'me',
  name: 'Alex Rivera',
  username: 'alexrivera',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  avatarColor: 'from-blue-500 to-indigo-600',
  phone: '+1 (555) 019-2834',
  bio: 'Product Designer & Full-stack builder. Always experimenting with modern Web & AI tech 🚀',
  status: 'online',
  isPremium: true,
};

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'saved_messages',
    type: 'saved',
    title: 'Saved Messages',
    avatarColor: 'from-sky-400 to-blue-600',
    about: 'Your cloud storage. Forward messages here to save them, send media and files to keep them backed up.',
    isPinned: true,
    unreadCount: 0,
    lastMessage: {
      id: 'msg-saved-3',
      chatId: 'saved_messages',
      senderId: 'me',
      text: '🔑 API credentials and useful Docker compose scripts:\n`docker run -d -p 6379:6379 redis:alpine`',
      timestamp: '14:20',
      isOutgoing: true,
      status: 'read',
    },
  },
  {
    id: 'durov_channel',
    type: 'channel',
    title: 'Telegram News & Updates 📢',
    username: 'telegram',
    avatar: 'https://telegram.org/img/t_logo.png',
    avatarColor: 'from-zinc-700 to-black',
    about: 'Official channel of Telegram news, platform releases, and cloud updates.',
    membersCount: 9850000,
    isVerified: true,
    isPinned: true,
    unreadCount: 1,
    lastMessage: {
      id: 'msg-durov-1',
      chatId: 'durov_channel',
      senderId: 'durov',
      text: 'Telegram 12.x is here. Introducing fast MTProto sync, full automation tools, audio voice notes, and rich cloud storage.',
      timestamp: '13:45',
      isOutgoing: false,
      status: 'read',
      views: 742100,
      commentsCount: 3412,
      reactions: [
        { emoji: '🔥', count: 48920, users: [] },
        { emoji: '👏', count: 21540, users: [] },
        { emoji: '🚀', count: 32100, users: [] },
        { emoji: '❤️', count: 18450, users: [] },
      ],
    },
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  saved_messages: [
    {
      id: 'msg-saved-1',
      chatId: 'saved_messages',
      senderId: 'me',
      text: '📌 Useful links for the project:\n• https://tailwindcss.com/docs\n• https://motion.dev\n• https://lucide.dev',
      timestamp: '10:00',
      isOutgoing: true,
      status: 'read',
      isPinned: true,
    },
    {
      id: 'msg-saved-2',
      chatId: 'saved_messages',
      senderId: 'me',
      text: 'Design inspiration mockup preview:',
      timestamp: '11:15',
      isOutgoing: true,
      status: 'read',
      attachments: [
        {
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          fileName: 'interface-render.png',
          fileSize: '1.8 MB',
        },
      ],
    },
    {
      id: 'msg-saved-3',
      chatId: 'saved_messages',
      senderId: 'me',
      text: '🔑 API credentials and useful Docker compose scripts:\n`docker run -d -p 6379:6379 redis:alpine`',
      timestamp: '14:20',
      isOutgoing: true,
      status: 'read',
    },
  ],

  durov_channel: [
    {
      id: 'msg-durov-0',
      chatId: 'durov_channel',
      senderId: 'durov',
      text: 'Thank you to our global users for believing in privacy, speed, and genuine freedom of communication. We will continue building without compromise.',
      timestamp: 'Aug 14',
      isOutgoing: false,
      status: 'read',
      views: 980000,
      commentsCount: 5120,
      reactions: [
        { emoji: '❤️', count: 85200, users: [] },
        { emoji: '🎉', count: 64100, users: [] },
        { emoji: '🔥', count: 91000, users: [] },
      ],
    },
    {
      id: 'msg-durov-1',
      chatId: 'durov_channel',
      senderId: 'durov',
      text: 'Telegram 12.x is here. Introducing fast MTProto sync, full automation tools, audio voice notes, and rich cloud storage.',
      timestamp: '13:45',
      isOutgoing: false,
      status: 'read',
      views: 742100,
      commentsCount: 3412,
      attachments: [
        {
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
          fileName: 'telegram-update.jpg',
          fileSize: '2.1 MB',
        },
      ],
      reactions: [
        { emoji: '🔥', count: 48920, users: [] },
        { emoji: '👏', count: 21540, users: [] },
        { emoji: '🚀', count: 32100, users: [] },
        { emoji: '❤️', count: 18450, users: [] },
      ],
    },
  ],
};
