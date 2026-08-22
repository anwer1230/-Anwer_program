package org.telegram.ui.Adapters;

import android.content.Context;
import android.view.ViewGroup;
import androidx.recyclerview.widget.RecyclerView;
import org.telegram.messenger.LocaleController;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.MessagesStorage;
import org.telegram.messenger.NotificationCenter;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.Cells.ChatMessageCell;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;

/**
 * MessagesAdapter
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/Adapters/MessagesAdapter.java)
 *
 * RecyclerView Adapter responsible for organizing, ordering, and binding TLRPC / TDLib
 * message records into ChatMessageCell rows with full sender, reply, and media resolution.
 * Listens to NotificationCenter for real-time font size and theme changes.
 */
public class MessagesAdapter extends RecyclerView.Adapter<MessagesAdapter.ViewHolder> implements NotificationCenter.NotificationCenterDelegate {

    public interface MessagesAdapterDelegate {
        void didPressAvatar(long userId, long chatId);
        void didPressReply(int replyMessageId);
        void didLongPressMessage(TLRPC.Message message);
        void didPressUrl(String url);
    }

    private final Context context;
    private final long dialogId;
    private final ArrayList<TLRPC.Message> messagesList = new ArrayList<>();
    private final HashMap<Integer, TLRPC.Message> messagesDict = new HashMap<>();
    private int currentAccount = 0;
    private MessagesAdapterDelegate delegate;

    public static class ViewHolder extends RecyclerView.ViewHolder {
        public ChatMessageCell messageCell;

        public ViewHolder(ChatMessageCell itemView) {
            super(itemView);
            this.messageCell = itemView;
        }
    }

    public MessagesAdapter(Context context, long dialogId, ArrayList<TLRPC.Message> messages) {
        this.context = context;
        this.dialogId = dialogId;
        
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.fontSizeChanged);
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.didSetNewTheme);
        NotificationCenter.getGlobalInstance().addObserver(this, NotificationCenter.fontSizeChanged);
        NotificationCenter.getGlobalInstance().addObserver(this, NotificationCenter.didSetNewTheme);

        setMessages(messages);
    }

    public void destroy() {
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.fontSizeChanged);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.didSetNewTheme);
        NotificationCenter.getGlobalInstance().removeObserver(this, NotificationCenter.fontSizeChanged);
        NotificationCenter.getGlobalInstance().removeObserver(this, NotificationCenter.didSetNewTheme);
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (id == NotificationCenter.fontSizeChanged || id == NotificationCenter.didSetNewTheme) {
            notifyDataSetChanged();
        }
    }

    public void setDelegate(MessagesAdapterDelegate delegate) {
        this.delegate = delegate;
    }

    public void setMessages(ArrayList<TLRPC.Message> messages) {
        messagesList.clear();
        messagesDict.clear();
        if (messages != null) {
            messagesList.addAll(messages);
            // Sort messages chronologically by date then id (oldest to newest in chat thread)
            Collections.sort(messagesList, new Comparator<TLRPC.Message>() {
                @Override
                public int compare(TLRPC.Message o1, TLRPC.Message o2) {
                    if (o1.date != o2.date) {
                        return Integer.compare(o1.date, o2.date);
                    }
                    return Integer.compare(o1.id, o2.id);
                }
            });

            for (TLRPC.Message msg : messagesList) {
                if (msg != null) {
                    messagesDict.put(msg.id, msg);
                }
            }
        }
        notifyDataSetChanged();
    }

    public void addMessage(TLRPC.Message message) {
        if (message == null) return;
        messagesList.add(message);
        messagesDict.put(message.id, message);
        notifyItemInserted(messagesList.size() - 1);
    }

    public void updateMessage(TLRPC.Message message) {
        if (message == null) return;
        for (int i = 0; i < messagesList.size(); i++) {
            if (messagesList.get(i).id == message.id) {
                messagesList.set(i, message);
                messagesDict.put(message.id, message);
                notifyItemChanged(i);
                return;
            }
        }
    }

    public void deleteMessages(ArrayList<Integer> ids) {
        if (ids == null || ids.isEmpty()) return;
        boolean changed = false;
        for (int i = messagesList.size() - 1; i >= 0; i--) {
            if (ids.contains(messagesList.get(i).id)) {
                messagesDict.remove(messagesList.get(i).id);
                messagesList.remove(i);
                notifyItemRemoved(i);
                changed = true;
            }
        }
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        ChatMessageCell cell = new ChatMessageCell(context);
        cell.setDelegate(new ChatMessageCell.ChatMessageCellDelegate() {
            @Override
            public void didPressAvatar(ChatMessageCell cell, long userId, long chatId) {
                if (delegate != null) {
                    delegate.didPressAvatar(userId, chatId);
                }
            }

            @Override
            public void didPressReply(ChatMessageCell cell, int replyMessageId) {
                if (delegate != null) {
                    delegate.didPressReply(replyMessageId);
                }
            }

            @Override
            public void didLongPressMessage(ChatMessageCell cell, TLRPC.Message message) {
                if (delegate != null) {
                    delegate.didLongPressMessage(message);
                }
            }

            @Override
            public void didPressUrl(ChatMessageCell cell, String url) {
                if (delegate != null) {
                    delegate.didPressUrl(url);
                }
            }
        });
        return new ViewHolder(cell);
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        TLRPC.Message message = messagesList.get(position);
        if (message == null) return;

        TLRPC.User senderUser = null;
        TLRPC.Chat senderChat = null;
        TLRPC.Message replyMessage = null;

        // 1. Resolve Sender
        if (message.from_id instanceof TLRPC.PeerUser) {
            long userId = ((TLRPC.PeerUser) message.from_id).user_id;
            senderUser = MessagesController.getInstance(currentAccount).getUser(userId);
        } else if (message.peer_id instanceof TLRPC.PeerChat) {
            long chatId = ((TLRPC.PeerChat) message.peer_id).chat_id;
            senderChat = MessagesController.getInstance(currentAccount).getChat(chatId);
        }

        // 2. Resolve Reply-to Message
        if (message.reply_to != null && message.reply_to.reply_to_msg_id != 0) {
            int replyId = message.reply_to.reply_to_msg_id;
            replyMessage = messagesDict.get(replyId);
            if (replyMessage == null) {
                replyMessage = MessagesStorage.getInstance(currentAccount).getMessageById(replyId);
            }
        }

        boolean isRtl = LocaleController.isRTL;
        holder.messageCell.setMessageObject(message, senderUser, senderChat, replyMessage, isRtl);
    }

    public void updateMessageStatus(int messageId, boolean unread) {
        for (int i = 0; i < messagesList.size(); i++) {
            TLRPC.Message msg = messagesList.get(i);
            if (msg.id == messageId) {
                msg.unread = unread;
                msg.flags = 0;
                notifyItemChanged(i);
                return;
            }
        }
    }

    @Override
    public int getItemCount() {
        return messagesList.size();
    }

    public TLRPC.Message getItem(int position) {
        if (position >= 0 && position < messagesList.size()) {
            return messagesList.get(position);
        }
        return null;
    }
}

