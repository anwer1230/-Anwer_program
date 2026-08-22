package org.telegram.messenger;

import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

/**
 * MessagesController
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/MessagesController.java)
 *
 * Core business logic manager for dialogs, messages, users, chats, channels,
 * admin permissions, ban rights, history pagination, TDLib event handling,
 * and comprehensive error resolution (CHAT_WRITE_FORBIDDEN, USER_BANNED_IN_CHANNEL, FLOOD_WAIT).
 */
public class MessagesController {

    private static volatile MessagesController[] Instance = new MessagesController[4];
    private final int currentAccount;

    public final ConcurrentHashMap<Long, TLRPC.User> users = new ConcurrentHashMap<>();
    public final ConcurrentHashMap<Long, TLRPC.Chat> chats = new ConcurrentHashMap<>();
    public final ArrayList<TLRPC.TLObject> dialogs = new ArrayList<>();
    public final ConcurrentHashMap<Long, ArrayList<TLRPC.Message>> dialogMessages = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, Boolean> loadingDialogs = new ConcurrentHashMap<>();

    public MessagesController(int account) {
        this.currentAccount = account;
    }

    public static MessagesController getInstance(int num) {
        MessagesController localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (MessagesController.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new MessagesController(num);
                }
            }
        }
        return localInstance;
    }

    /**
     * Determine if current user has permission to write/send messages to a chat/channel
     */
    public boolean canWriteToChat(TLRPC.Chat chat) {
        if (chat == null) {
            return true;
        }
        // If kicked, left, or deactivated
        if (chat.kicked || chat.left || chat.deactivated) {
            return false;
        }
        // If chat is forbidden (banned/kicked on server)
        if (chat instanceof TLRPC.TL_chatForbidden || chat instanceof TLRPC.TL_channelForbidden) {
            return false;
        }
        // Channel / Supergroup restrictions
        if (chat.is_channel) {
            // Broadcast channels: only creators or admins with post_messages right can write
            if (!chat.is_supergroup) {
                if (chat.creator) {
                    return true;
                }
                if (chat.admin_rights != null && chat.admin_rights.post_messages) {
                    return true;
                }
                return false;
            } else {
                // Supergroup: Check user-specific or default banned rights
                if (chat.creator) {
                    return true;
                }
                if (chat.admin_rights != null && (chat.admin_rights.post_messages || chat.admin_rights.change_info)) {
                    return true;
                }
                if (chat.banned_rights != null && chat.banned_rights.send_messages) {
                    return false;
                }
                if (chat.default_banned_rights != null && chat.default_banned_rights.send_messages) {
                    return false;
                }
            }
        }
        return true;
    }

    public boolean canSendMedia(TLRPC.Chat chat) {
        if (!canWriteToChat(chat)) return false;
        if (chat == null) return true;
        if (chat.banned_rights != null && chat.banned_rights.send_media) return false;
        if (chat.default_banned_rights != null && chat.default_banned_rights.send_media) return false;
        return true;
    }

    public boolean canSendStickers(TLRPC.Chat chat) {
        if (!canWriteToChat(chat)) return false;
        if (chat == null) return true;
        if (chat.banned_rights != null && chat.banned_rights.send_stickers) return false;
        if (chat.default_banned_rights != null && chat.default_banned_rights.send_stickers) return false;
        return true;
    }

    public boolean canEmbedLinks(TLRPC.Chat chat) {
        if (!canWriteToChat(chat)) return false;
        if (chat == null) return true;
        if (chat.banned_rights != null && chat.banned_rights.embed_links) return false;
        if (chat.default_banned_rights != null && chat.default_banned_rights.embed_links) return false;
        return true;
    }

    /**
     * Load chat history from SQLite cache first, then fetch latest via TDLib/MTProto getHistory RPC
     */
    public void loadHistory(final long dialogId, final int limit, final int offsetId, final boolean fromCache) {
        if (fromCache) {
            ArrayList<TLRPC.Message> cached = MessagesStorage.getInstance(currentAccount).getMessages(dialogId, limit, offsetId);
            if (cached != null && !cached.isEmpty()) {
                dialogMessages.put(dialogId, new ArrayList<>(cached));
                NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.messagesDidLoad, dialogId, cached, true);
            }
        }

        if (loadingDialogs.getOrDefault(dialogId, false)) {
            return;
        }
        loadingDialogs.put(dialogId, true);

        TLRPC.TL_messages_getHistory req = new TLRPC.TL_messages_getHistory();
        req.peer = getInputPeer(dialogId);
        req.limit = limit;
        req.offset_id = offsetId;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                loadingDialogs.put(dialogId, false);
                if (error == null && response instanceof TLRPC.messages_Messages) {
                    TLRPC.messages_Messages res = (TLRPC.messages_Messages) response;
                    
                    // Cache users and chats from response
                    if (res.users != null) {
                        for (TLRPC.User u : res.users) {
                            users.put(u.id, u);
                            MessagesStorage.getInstance(currentAccount).putUser(u);
                        }
                    }
                    if (res.chats != null) {
                        for (TLRPC.Chat c : res.chats) {
                            chats.put(c.id, c);
                            MessagesStorage.getInstance(currentAccount).putChat(c);
                        }
                    }

                    if (res.messages != null) {
                        MessagesStorage.getInstance(currentAccount).putMessages(dialogId, res.messages);
                        ArrayList<TLRPC.Message> currentList = dialogMessages.computeIfAbsent(dialogId, k -> new ArrayList<>());
                        for (TLRPC.Message m : res.messages) {
                            boolean exists = false;
                            for (int i = 0; i < currentList.size(); i++) {
                                if (currentList.get(i).id == m.id) {
                                    currentList.set(i, m);
                                    exists = true;
                                    break;
                                }
                            }
                            if (!exists) {
                                currentList.add(m);
                            }
                        }
                        NotificationCenter.getInstance(currentAccount).postNotificationName(
                                NotificationCenter.messagesDidLoad, dialogId, currentList, false);
                    }
                } else if (error != null) {
                    handleRpcError(error, dialogId, 0);
                } else {
                    // Fallback to local messages if available
                    ArrayList<TLRPC.Message> local = MessagesStorage.getInstance(currentAccount).getMessages(dialogId, limit, offsetId);
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                            NotificationCenter.messagesDidLoad, dialogId, local, false);
                }
            }
        });
    }

    /**
     * Send Message through TDLib / MTProto with optimistic UI dispatch and server restriction handling
     */
    public void sendMessage(TLRPC.InputPeer peer, String messageText, long replyToMsgId) {
        long dialogId = getDialogId(peer);
        sendMessage(peer, messageText, replyToMsgId, dialogId);
    }

    public void sendMessage(TLRPC.InputPeer peer, String messageText, long replyToMsgId, long dialogId) {
        if (messageText == null || messageText.trim().isEmpty()) return;

        // Verify local rights first
        if (dialogId < 0) {
            TLRPC.Chat chat = getChat(-dialogId);
            if (chat != null && !canWriteToChat(chat)) {
                NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.messageSendError, 0, dialogId, "CHAT_WRITE_FORBIDDEN");
                return;
            }
        }

        // 1. Create local outgoing message object
        int tempMsgId = (int) (System.currentTimeMillis() % 1000000000);
        TLRPC.Message newMsg = new TLRPC.Message();
        newMsg.id = tempMsgId;
        newMsg.date = (int) (System.currentTimeMillis() / 1000);
        newMsg.message = messageText;
        newMsg.out = true;
        newMsg.unread = false;
        newMsg.flags = 2; // Sent indicator

        if (dialogId < 0) {
            TLRPC.PeerChat pc = new TLRPC.PeerChat();
            pc.chat_id = -dialogId;
            newMsg.peer_id = pc;
        } else {
            TLRPC.PeerUser pu = new TLRPC.PeerUser();
            pu.user_id = dialogId;
            newMsg.peer_id = pu;
        }

        TLRPC.PeerUser selfPeer = new TLRPC.PeerUser();
        selfPeer.user_id = UserConfig.getInstance(currentAccount).getClientUserId();
        newMsg.from_id = selfPeer;

        if (replyToMsgId != 0) {
            newMsg.reply_to = new TLRPC.MessageReplyHeader();
            newMsg.reply_to.reply_to_msg_id = (int) replyToMsgId;
        }

        // 2. Put immediately into local cache for zero-latency feedback
        ArrayList<TLRPC.Message> list = dialogMessages.computeIfAbsent(dialogId, k -> new ArrayList<>());
        list.add(newMsg);
        MessagesStorage.getInstance(currentAccount).putMessage(dialogId, newMsg);

        // 3. Notify UI of new outgoing message
        NotificationCenter.getInstance(currentAccount).postNotificationName(
                NotificationCenter.didReceivedNewMessages, dialogId, newMsg);

        // 4. Send RPC via ConnectionsManager
        TLRPC.TL_messages_sendMessage req = new TLRPC.TL_messages_sendMessage();
        req.peer = peer != null ? peer : getInputPeer(dialogId);
        req.message = messageText;
        req.random_id = System.currentTimeMillis();

        if (replyToMsgId != 0) {
            req.reply_to = new TLRPC.MessageReplyHeader();
            req.reply_to.reply_to_msg_id = (int) replyToMsgId;
        }

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                if (error == null) {
                    newMsg.flags = 0; // Delivered / read status
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                            NotificationCenter.messageReceivedByServer, tempMsgId, dialogId);
                } else {
                    // Remove optimistic failed message or mark send error
                    handleRpcError(error, dialogId, tempMsgId);
                }
            }
        });
    }

    /**
     * Handle Server RPC Errors and Restriction Codes
     */
    public void handleRpcError(TLRPC.TL_error error, long dialogId, int tempMsgId) {
        if (error == null || error.text == null) return;
        String errorText = error.text;

        if ("CHAT_WRITE_FORBIDDEN".equals(errorText) || "USER_BANNED_IN_CHANNEL".equals(errorText)) {
            if (dialogId < 0) {
                TLRPC.Chat chat = getChat(-dialogId);
                if (chat != null) {
                    if ("USER_BANNED_IN_CHANNEL".equals(errorText)) {
                        chat.kicked = true;
                    }
                    if (chat.banned_rights == null) {
                        chat.banned_rights = new TLRPC.ChatBannedRights();
                    }
                    chat.banned_rights.send_messages = true;
                    MessagesStorage.getInstance(currentAccount).putChat(chat);
                }
            }
            NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.messageSendError, tempMsgId, dialogId, errorText);
            NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.updateInterfaces);
        } else if (errorText.startsWith("FLOOD_WAIT")) {
            NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.messageSendError, tempMsgId, dialogId, errorText);
        } else if ("CHAT_ADMIN_REQUIRED".equals(errorText) || "CHAT_SEND_MEDIA_FORBIDDEN".equals(errorText)) {
            NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.messageSendError, tempMsgId, dialogId, errorText);
        } else {
            NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.messageSendError, tempMsgId, dialogId, errorText);
        }
    }

    /**
     * Delete Messages
     */
    public void deleteMessages(ArrayList<Integer> messageIds, boolean revoke) {
        TLRPC.TL_messages_deleteMessages req = new TLRPC.TL_messages_deleteMessages();
        req.id = messageIds;
        req.revoke = revoke;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                if (error == null) {
                    MessagesStorage.getInstance(currentAccount).markMessagesAsDeleted(messageIds);
                    for (ArrayList<TLRPC.Message> list : dialogMessages.values()) {
                        list.removeIf(m -> messageIds.contains(m.id));
                    }
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                            NotificationCenter.messagesDeleted, messageIds);
                }
            }
        });
    }

    /**
     * Report Spam and Leave Chat
     */
    public void reportSpam(long dialogId, int messageId, String reason) {
        TLRPC.TL_messages_reportSpam req = new TLRPC.TL_messages_reportSpam();
        req.peer = getInputPeer(dialogId);

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                deleteDialog(dialogId, true);
                NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.spamReportSubmitted, dialogId);
            }
        });
    }

    /**
     * Join Channel / Supergroup
     */
    public void joinChannel(long channelId, long accessHash) {
        TLRPC.TL_channels_joinChannel req = new TLRPC.TL_channels_joinChannel();
        TLRPC.TL_inputChannel inputChannel = new TLRPC.TL_inputChannel();
        inputChannel.channel_id = channelId;
        inputChannel.access_hash = accessHash;
        req.channel = inputChannel;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                if (error == null && response instanceof TLRPC.Updates) {
                    processUpdates((TLRPC.Updates) response);
                    NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.chatDidCreated, channelId);
                }
            }
        });
    }

    /**
     * Import Chat Invite Link (t.me/+hash)
     */
    public void importChatInvite(String hash) {
        TLRPC.TL_messages_importChatInvite req = new TLRPC.TL_messages_importChatInvite();
        req.hash = hash;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                if (error == null && response instanceof TLRPC.Updates) {
                    processUpdates((TLRPC.Updates) response);
                    NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.dialogsNeedReload);
                }
            }
        });
    }

    /**
     * Process Incoming Updates from MTProto / TDLib Stream
     */
    public void processUpdates(TLRPC.Updates updates) {
        if (updates == null) return;
        if (updates.users != null) {
            for (TLRPC.User user : updates.users) {
                users.put(user.id, user);
                MessagesStorage.getInstance(currentAccount).putUser(user);
            }
        }
        if (updates.chats != null) {
            for (TLRPC.Chat chat : updates.chats) {
                chats.put(chat.id, chat);
                MessagesStorage.getInstance(currentAccount).putChat(chat);
            }
        }
        if (updates.updates != null) {
            for (TLRPC.Update update : updates.updates) {
                processUpdate(update);
            }
        }
    }

    public void processUpdate(TLRPC.Update update) {
        if (update instanceof TLRPC.TL_updateNewMessage) {
            TLRPC.TL_updateNewMessage newMsgUpdate = (TLRPC.TL_updateNewMessage) update;
            if (newMsgUpdate.message != null) {
                long dialogId = getDialogId(newMsgUpdate.message);
                
                ArrayList<TLRPC.Message> list = dialogMessages.computeIfAbsent(dialogId, k -> new ArrayList<>());
                list.add(newMsgUpdate.message);
                MessagesStorage.getInstance(currentAccount).putMessage(dialogId, newMsgUpdate.message);

                NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.didReceivedNewMessages, dialogId, newMsgUpdate.message);

                // Dispatch system notification if message is incoming
                if (!newMsgUpdate.message.out) {
                    NotificationsController.getInstance(currentAccount).showNotification(newMsgUpdate.message, dialogId);
                }
            }
        } else if (update instanceof TLRPC.TL_updateDeleteMessages) {
            TLRPC.TL_updateDeleteMessages del = (TLRPC.TL_updateDeleteMessages) update;
            MessagesStorage.getInstance(currentAccount).markMessagesAsDeleted(del.messages);
            for (ArrayList<TLRPC.Message> list : dialogMessages.values()) {
                list.removeIf(m -> del.messages.contains(m.id));
            }
            NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.messagesDeleted, del.messages);
        } else if (update instanceof TLRPC.TL_updateEditMessage) {
            TLRPC.TL_updateEditMessage edit = (TLRPC.TL_updateEditMessage) update;
            if (edit.message != null) {
                long dialogId = getDialogId(edit.message);
                ArrayList<TLRPC.Message> list = dialogMessages.computeIfAbsent(dialogId, k -> new ArrayList<>());
                for (int i = 0; i < list.size(); i++) {
                    if (list.get(i).id == edit.message.id) {
                        list.set(i, edit.message);
                        break;
                    }
                }
                MessagesStorage.getInstance(currentAccount).putMessage(dialogId, edit.message);
                NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.updateInterfaces);
            }
        }
    }

    /**
     * Resolve public username (@username, t.me/username)
     */
    public void resolveUsername(String username, ConnectionsManager.RequestDelegate delegate) {
        TLRPC.TL_contacts_resolveUsername req = new TLRPC.TL_contacts_resolveUsername();
        req.username = username;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (error == null && response instanceof TLRPC.TL_contacts_resolvedPeer) {
                TLRPC.TL_contacts_resolvedPeer resolved = (TLRPC.TL_contacts_resolvedPeer) response;
                if (resolved.users != null) {
                    for (TLRPC.User u : resolved.users) {
                        users.put(u.id, u);
                        MessagesStorage.getInstance(currentAccount).putUser(u);
                    }
                }
                if (resolved.chats != null) {
                    for (TLRPC.Chat c : resolved.chats) {
                        chats.put(c.id, c);
                        MessagesStorage.getInstance(currentAccount).putChat(c);
                    }
                }
            }
            if (delegate != null) {
                delegate.run(response, error);
            }
        });
    }

    /**
     * Check chat invite link (t.me/+hash, t.me/joinchat/hash)
     */
    public void checkChatInvite(String hash, ConnectionsManager.RequestDelegate delegate) {
        TLRPC.TL_messages_checkChatInvite req = new TLRPC.TL_messages_checkChatInvite();
        req.hash = hash;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (delegate != null) {
                delegate.run(response, error);
            }
        });
    }

    /**
     * Fetch web page link preview
     */
    public void getWebPagePreview(String message, ConnectionsManager.RequestDelegate delegate) {
        TLRPC.TL_messages_getWebPagePreview req = new TLRPC.TL_messages_getWebPagePreview();
        req.message = message;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (delegate != null) {
                delegate.run(response, error);
            }
        });
    }

    /**
     * Edit Message Text
     */
    public void editMessage(TLRPC.InputPeer peer, int messageId, String newText) {
        TLRPC.TL_messages_editMessage req = new TLRPC.TL_messages_editMessage();
        req.peer = peer;
        req.id = messageId;
        req.message = newText;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                if (error == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.updateInterfaces);
                }
            }
        });
    }

    public void setAdminRights(long chatId, TLRPC.User user, TLRPC.ChatAdminRights rights, String rank) {
        TLRPC.TL_channels_editAdmin req = new TLRPC.TL_channels_editAdmin();
        TLRPC.TL_inputChannel inputChannel = new TLRPC.TL_inputChannel();
        inputChannel.channel_id = chatId;
        req.channel = inputChannel;

        TLRPC.TL_inputUser inputUser = new TLRPC.TL_inputUser();
        inputUser.user_id = user.id;
        inputUser.access_hash = user.access_hash;
        req.user_id = inputUser;
        req.admin_rights = rights;
        req.rank = rank;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                if (error == null && response instanceof TLRPC.Updates) {
                    processUpdates((TLRPC.Updates) response);
                }
            }
        });
    }

    public void setBannedRights(long chatId, TLRPC.User user, TLRPC.ChatBannedRights rights) {
        TLRPC.TL_channels_editBanned req = new TLRPC.TL_channels_editBanned();
        TLRPC.TL_inputChannel inputChannel = new TLRPC.TL_inputChannel();
        inputChannel.channel_id = chatId;
        req.channel = inputChannel;

        TLRPC.TL_inputUser inputUser = new TLRPC.TL_inputUser();
        inputUser.user_id = user.id;
        inputUser.access_hash = user.access_hash;
        req.participant = inputUser;
        req.banned_rights = rights;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                if (error == null && response instanceof TLRPC.Updates) {
                    processUpdates((TLRPC.Updates) response);
                }
            }
        });
    }

    public void deleteDialog(long dialogId, boolean deleteHistory) {
        dialogMessages.remove(dialogId);
        MessagesStorage.getInstance(currentAccount).deleteDialog(dialogId);
    }

    public TLRPC.User getUser(Long userId) {
        if (userId == null) return null;
        return users.get(userId);
    }

    public TLRPC.Chat getChat(Long chatId) {
        if (chatId == null) return null;
        return chats.get(chatId);
    }

    public TLRPC.InputPeer getInputPeer(long dialogId) {
        if (dialogId < 0) {
            TLRPC.InputPeerChat peer = new TLRPC.InputPeerChat();
            peer.chat_id = -dialogId;
            return peer;
        } else {
            TLRPC.InputPeerUser peer = new TLRPC.InputPeerUser();
            peer.user_id = dialogId;
            return peer;
        }
    }

    public long getDialogId(TLRPC.InputPeer peer) {
        if (peer instanceof TLRPC.InputPeerChat) {
            return -((TLRPC.InputPeerChat) peer).chat_id;
        } else if (peer instanceof TLRPC.InputPeerChannel) {
            return -((TLRPC.InputPeerChannel) peer).channel_id;
        } else if (peer instanceof TLRPC.InputPeerUser) {
            return ((TLRPC.InputPeerUser) peer).user_id;
        }
        return 0;
    }

    public long getDialogId(TLRPC.Message message) {
        if (message == null) return 0;
        if (message.peer_id instanceof TLRPC.PeerChat) {
            return -((TLRPC.PeerChat) message.peer_id).chat_id;
        } else if (message.peer_id instanceof TLRPC.PeerChannel) {
            return -((TLRPC.PeerChannel) message.peer_id).channel_id;
        } else if (message.peer_id instanceof TLRPC.PeerUser) {
            return ((TLRPC.PeerUser) message.peer_id).user_id;
        } else if (message.from_id instanceof TLRPC.PeerUser) {
            return ((TLRPC.PeerUser) message.from_id).user_id;
        }
        return 0;
    }
}
