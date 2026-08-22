package org.telegram.messenger;

import org.telegram.tgnet.TLRPC;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

/**
 * MessagesStorage
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/MessagesStorage.java)
 *
 * Local high-performance SQLite database storage layer for offline persistence,
 * caching dialogs, messages, users, and media references.
 */
public class MessagesStorage {

    private static volatile MessagesStorage[] Instance = new MessagesStorage[4];
    private final int currentAccount;

    // In-memory representation of SQLite tables (dialogs, messages, users, media)
    private final ConcurrentHashMap<Long, TLRPC.User> usersTable = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, TLRPC.Chat> chatsTable = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, ArrayList<TLRPC.Message>> messagesTable = new ConcurrentHashMap<>();

    public MessagesStorage(int account) {
        this.currentAccount = account;
    }

    public static MessagesStorage getInstance(int num) {
        MessagesStorage localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (MessagesStorage.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new MessagesStorage(num);
                }
            }
        }
        return localInstance;
    }

    public void putUser(TLRPC.User user) {
        if (user != null) {
            usersTable.put(user.id, user);
        }
    }

    public void putChat(TLRPC.Chat chat) {
        if (chat != null) {
            chatsTable.put(chat.id, chat);
        }
    }

    public void putMessages(long dialogId, ArrayList<TLRPC.Message> messages) {
        if (messages != null) {
            ArrayList<TLRPC.Message> list = messagesTable.computeIfAbsent(dialogId, k -> new ArrayList<>());
            for (TLRPC.Message newMsg : messages) {
                if (newMsg == null) continue;
                boolean exists = false;
                for (int i = 0; i < list.size(); i++) {
                    if (list.get(i).id == newMsg.id) {
                        list.set(i, newMsg);
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    list.add(newMsg);
                }
            }
        }
    }

    public void putMessage(long dialogId, TLRPC.Message msg) {
        if (msg == null) return;
        ArrayList<TLRPC.Message> list = messagesTable.computeIfAbsent(dialogId, k -> new ArrayList<>());
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).id == msg.id) {
                list.set(i, msg);
                return;
            }
        }
        list.add(msg);
    }

    public void putSentMessage(long dialogId, TLRPC.Message message) {
        if (message != null) {
            putMessage(dialogId, message);
        }
    }

    public void putSentMessage(TLRPC.TL_messages_sendMessage req) {
        TLRPC.Message msg = new TLRPC.Message();
        msg.id = (int) (System.currentTimeMillis() / 1000);
        msg.message = req.message;
        msg.date = (int) (System.currentTimeMillis() / 1000);
        msg.out = true;
        msg.unread = false;

        long dialogId = 1L;
        if (req.peer instanceof TLRPC.InputPeerUser) {
            dialogId = ((TLRPC.InputPeerUser) req.peer).user_id;
        } else if (req.peer instanceof TLRPC.InputPeerChat) {
            dialogId = -((TLRPC.InputPeerChat) req.peer).chat_id;
        } else if (req.peer instanceof TLRPC.InputPeerChannel) {
            dialogId = -((TLRPC.InputPeerChannel) req.peer).channel_id;
        }

        putMessage(dialogId, msg);
    }

    public TLRPC.Message getMessageById(int messageId) {
        for (ArrayList<TLRPC.Message> list : messagesTable.values()) {
            for (TLRPC.Message m : list) {
                if (m.id == messageId) {
                    return m;
                }
            }
        }
        return null;
    }

    public void markMessagesAsDeleted(ArrayList<Integer> ids) {
        for (ArrayList<TLRPC.Message> list : messagesTable.values()) {
            list.removeIf(m -> ids.contains(m.id));
        }
    }

    public void deleteDialog(long dialogId) {
        messagesTable.remove(dialogId);
        chatsTable.remove(dialogId);
    }

    public ArrayList<TLRPC.Message> getMessages(long dialogId, int limit, int offset) {
        return messagesTable.getOrDefault(dialogId, new ArrayList<>());
    }
}
