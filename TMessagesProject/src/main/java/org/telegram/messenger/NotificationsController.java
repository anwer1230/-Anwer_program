package org.telegram.messenger;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.RemoteInput;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.LaunchActivity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

/**
 * NotificationsController
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/NotificationsController.java)
 *
 * Core notification dispatch and formatting engine:
 * - Listens for live MTProto / TDLib message streams
 * - Queues and aggregates unread messages per dialog
 * - Generates rich Android notifications (BigTextStyle, InboxStyle, direct reply RemoteInput)
 * - Manages badge count, silent hours, sound, vibration, LED, and immediate cancellation on chat open.
 */
public class NotificationsController {

    private static volatile NotificationsController[] Instance = new NotificationsController[UserConfig.MAX_ACCOUNT_COUNT];
    public static final String EXTRA_VOICE_REPLY = "extra_voice_reply";
    public static final String KEY_TEXT_REPLY = "key_text_reply";

    private final int currentAccount;
    private final NotificationManager notificationManager;
    private final ConcurrentHashMap<Long, ArrayList<TLRPC.Message>> pushMessages = new ConcurrentHashMap<>();
    private int totalUnreadCount = 0;
    private long openedDialogId = 0;

    public NotificationsController(int account) {
        this.currentAccount = account;
        Context context = ApplicationLoader.applicationContext;
        if (context != null) {
            this.notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            NotificationHelper.createNotificationChannels(context);
        } else {
            this.notificationManager = null;
        }
    }

    public static NotificationsController getInstance(int num) {
        NotificationsController localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (NotificationsController.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new NotificationsController(num);
                }
            }
        }
        return localInstance;
    }

    /**
     * Set the currently active / opened conversation in UI to suppress notifications
     */
    public void setOpenedDialogId(long dialogId) {
        this.openedDialogId = dialogId;
        if (dialogId != 0) {
            removeNotificationsForDialog(dialogId);
        }
    }

    public long getOpenedDialogId() {
        return openedDialogId;
    }

    /**
     * Process incoming message updates from MTProto / TDLib stream
     */
    public void processNewMessages(ArrayList<TLRPC.Message> messages, boolean isScheduled) {
        if (messages == null || messages.isEmpty()) return;

        Context context = ApplicationLoader.applicationContext;
        if (context == null || notificationManager == null) return;

        for (TLRPC.Message msg : messages) {
            if (msg == null || msg.out) continue;

            long dialogId = MessagesController.getInstance(currentAccount).getDialogId(msg);
            if (dialogId == openedDialogId && ApplicationLoader.isScreenOn) {
                continue; // Suppress notification if currently reading this chat
            }

            ArrayList<TLRPC.Message> list = pushMessages.computeIfAbsent(dialogId, k -> new ArrayList<>());
            list.add(msg);
            totalUnreadCount++;

            showNotification(msg, dialogId);
        }

        updateBadge();
    }

    /**
     * Build and post notification to Android Notification Manager
     */
    public void showNotification(TLRPC.Message message, long dialogId) {
        Context context = ApplicationLoader.applicationContext;
        if (context == null || notificationManager == null || message == null) return;

        MessagesController controller = MessagesController.getInstance(currentAccount);
        String title = "Telegram";
        String subtitle = "";
        boolean isChannel = false;

        if (dialogId < 0) {
            TLRPC.Chat chat = controller.getChat(-dialogId);
            if (chat != null) {
                title = chat.title != null ? chat.title : "Group";
                isChannel = chat.is_channel && !chat.is_supergroup;
            }
            if (message.from_id instanceof TLRPC.PeerUser) {
                TLRPC.User sender = controller.getUser(((TLRPC.PeerUser) message.from_id).user_id);
                if (sender != null) {
                    subtitle = (sender.first_name != null ? sender.first_name : "") + ": ";
                }
            }
        } else {
            TLRPC.User user = controller.getUser(dialogId);
            if (user != null) {
                title = (user.first_name != null ? user.first_name : "") + 
                        (user.last_name != null ? " " + user.last_name : "");
            }
        }

        String contentText = subtitle + (message.message != null ? message.message : "");
        String channelId = NotificationHelper.getChannelIdForDialog(dialogId, isChannel);

        // Click intent to open ChatActivity
        Intent intent = new Intent(context, LaunchActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (dialogId < 0) {
            intent.putExtra("chat_id", -dialogId);
        } else {
            intent.putExtra("user_id", dialogId);
        }
        intent.putExtra("currentAccount", currentAccount);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pendingIntent = PendingIntent.getActivity(context, (int) dialogId, intent, flags);

        // Direct Reply RemoteInput
        RemoteInput remoteInput = new RemoteInput.Builder(KEY_TEXT_REPLY)
                .setLabel(LocaleController.isRTL ? "رد..." : "Reply...")
                .build();

        Intent replyIntent = new Intent(context, LaunchActivity.class);
        replyIntent.putExtra("dialog_id", dialogId);
        replyIntent.putExtra("reply_to_msg_id", message.id);
        int replyFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 31) {
            replyFlags |= PendingIntent.FLAG_MUTABLE;
        }
        PendingIntent replyPendingIntent = PendingIntent.getBroadcast(context, (int) (dialogId + 10000), replyIntent, replyFlags);

        NotificationCompat.Action replyAction = new NotificationCompat.Action.Builder(
                org.telegram.messenger.R.drawable.ic_ab_back,
                LocaleController.isRTL ? "رد" : "Reply",
                replyPendingIntent
        ).addRemoteInput(remoteInput).build();

        // Build Notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, channelId)
                .setSmallIcon(org.telegram.messenger.R.drawable.ic_ab_back)
                .setContentTitle(title)
                .setContentText(contentText)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(contentText))
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setColor(NotificationHelper.DEFAULT_LED_COLOR)
                .addAction(replyAction);

        // Multiple unread lines in InboxStyle
        ArrayList<TLRPC.Message> messagesList = pushMessages.get(dialogId);
        if (messagesList != null && messagesList.size() > 1) {
            NotificationCompat.InboxStyle inboxStyle = new NotificationCompat.InboxStyle();
            inboxStyle.setBigContentTitle(title);
            for (int i = Math.max(0, messagesList.size() - 5); i < messagesList.size(); i++) {
                TLRPC.Message m = messagesList.get(i);
                inboxStyle.addLine(m.message != null ? m.message : "");
            }
            inboxStyle.setSummaryText("+" + (messagesList.size() - 1) + " more");
            builder.setStyle(inboxStyle);
        }

        int notificationId = (int) Math.abs(dialogId % 100000);
        notificationManager.notify(notificationId, builder.build());
    }

    /**
     * Dismiss and remove notifications when user opens the conversation
     */
    public void removeNotificationsForDialog(long dialogId) {
        if (notificationManager == null) return;
        int notificationId = (int) Math.abs(dialogId % 100000);
        notificationManager.cancel(notificationId);

        ArrayList<TLRPC.Message> removed = pushMessages.remove(dialogId);
        if (removed != null) {
            totalUnreadCount = Math.max(0, totalUnreadCount - removed.size());
            updateBadge();
        }
    }

    public void cleanupAllNotifications() {
        if (notificationManager != null) {
            notificationManager.cancelAll();
        }
        pushMessages.clear();
        totalUnreadCount = 0;
        updateBadge();
    }

    public void updateBadge() {
        // Broadcast badge update to system launcher if supported
        NotificationCenter.getInstance(currentAccount).postNotificationName(
                NotificationCenter.pushMessagesUpdated, totalUnreadCount);
    }
}
