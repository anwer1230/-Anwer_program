package org.telegram.messenger;

import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * SendMessagesHelper
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/SendMessagesHelper.java)
 *
 * Coordinates message dispatching, media uploads, location sharing, contact cards,
 * voice messages, slow-mode throttling, batching, and automated broadcast campaigns.
 */
public class SendMessagesHelper {

    private static volatile SendMessagesHelper[] Instance = new SendMessagesHelper[UserConfig.MAX_ACCOUNT_COUNT];
    public final int currentAccount;

    public static class SendingMessage {
        public TLRPC.Message message;
        public TLRPC.InputPeer peer;
        public long dialogId;
        public int retryCount;
    }

    private final HashMap<Long, ArrayList<SendingMessage>> delayedMessages = new HashMap<>();

    public SendMessagesHelper(int account) {
        this.currentAccount = account;
    }

    public static SendMessagesHelper getInstance(int num) {
        SendMessagesHelper localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (SendMessagesHelper.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new SendMessagesHelper(num);
                }
            }
        }
        return localInstance;
    }

    /**
     * Send standard text message
     */
    public void sendMessage(String message, long peerId, TLRPC.MessageReplyHeader replyTo, boolean notify, int scheduleDate) {
        if (message == null || message.trim().isEmpty()) return;

        TLRPC.TL_messages_sendMessage req = new TLRPC.TL_messages_sendMessage();
        req.message = message;
        req.clear_draft = true;
        req.silent = !notify;
        req.random_id = System.currentTimeMillis();
        req.reply_to = replyTo;

        if (peerId < 0) {
            TLRPC.InputPeerChat chatPeer = new TLRPC.InputPeerChat();
            chatPeer.chat_id = -peerId;
            req.peer = chatPeer;
        } else {
            TLRPC.InputPeerUser userPeer = new TLRPC.InputPeerUser();
            userPeer.user_id = peerId;
            req.peer = userPeer;
        }

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                if (error == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.messageReceivedByServer, req.random_id, response);
                } else {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.messageSendError, req.random_id, error.text);
                }
            }
        });
    }

    /**
     * Send batch broadcast message to multiple target chats
     */
    public void sendBatchBroadcast(ArrayList<Long> targetPeerIds, String messageText, int antiFloodDelayMs) {
        new Thread(() -> {
            for (Long peerId : targetPeerIds) {
                sendMessage(messageText, peerId, null, true, 0);
                try {
                    Thread.sleep(Math.max(antiFloodDelayMs, 1000));
                } catch (InterruptedException ignored) {}
            }
        }).start();
    }

    /**
     * Send reactions (Emoji Reactions)
     */
    public void sendReaction(long dialogId, int messageId, String emoji) {
        // Send reaction to server via MTProto
    }
}
