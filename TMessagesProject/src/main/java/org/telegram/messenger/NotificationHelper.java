package org.telegram.messenger;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

/**
 * NotificationHelper
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/NotificationHelper.java)
 *
 * Manages notification channels, audio attributes, vibration patterns, LED colors,
 * and high-priority heads-up notification flags for modern Android versions (Oreo+).
 */
public class NotificationHelper {

    public static final String CHANNEL_PRIVATE_CHATS = "channel_private_chats_v2";
    public static final String CHANNEL_GROUPS = "channel_groups_v2";
    public static final String CHANNEL_CHANNELS = "channel_channels_v2";
    public static final String CHANNEL_CALLS = "channel_calls_v2";
    public static final String CHANNEL_SERVICE = "channel_service_v2";

    public static final long[] DEFAULT_VIBRATE_PATTERN = new long[]{0, 250, 250, 250};
    public static final int DEFAULT_LED_COLOR = 0xff0088cc; // Telegram Blue

    public static void createNotificationChannels(Context context) {
        if (Build.VERSION.SDK_INT < 26 || context == null) {
            return;
        }

        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) {
            return;
        }

        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build();

        // 1. Private Chats Channel
        NotificationChannel privateChannel = new NotificationChannel(
                CHANNEL_PRIVATE_CHATS,
                "Private Chats",
                NotificationManager.IMPORTANCE_HIGH
        );
        privateChannel.setDescription("Notifications from private 1-on-1 chats and secret chats");
        privateChannel.enableLights(true);
        privateChannel.setLightColor(DEFAULT_LED_COLOR);
        privateChannel.enableVibration(true);
        privateChannel.setVibrationPattern(DEFAULT_VIBRATE_PATTERN);
        privateChannel.setSound(Settings.System.DEFAULT_NOTIFICATION_URI, audioAttributes);
        manager.createNotificationChannel(privateChannel);

        // 2. Groups Channel
        NotificationChannel groupsChannel = new NotificationChannel(
                CHANNEL_GROUPS,
                "Groups",
                NotificationManager.IMPORTANCE_HIGH
        );
        groupsChannel.setDescription("Notifications from basic groups and supergroups");
        groupsChannel.enableLights(true);
        groupsChannel.setLightColor(Color.CYAN);
        groupsChannel.enableVibration(true);
        groupsChannel.setVibrationPattern(DEFAULT_VIBRATE_PATTERN);
        groupsChannel.setSound(Settings.System.DEFAULT_NOTIFICATION_URI, audioAttributes);
        manager.createNotificationChannel(groupsChannel);

        // 3. Channels Channel
        NotificationChannel channelsChannel = new NotificationChannel(
                CHANNEL_CHANNELS,
                "Channels",
                NotificationManager.IMPORTANCE_DEFAULT
        );
        channelsChannel.setDescription("Notifications from subscribed broadcast channels");
        channelsChannel.enableLights(true);
        channelsChannel.setLightColor(Color.MAGENTA);
        channelsChannel.enableVibration(false);
        manager.createNotificationChannel(channelsChannel);

        // 4. Calls Channel
        NotificationChannel callsChannel = new NotificationChannel(
                CHANNEL_CALLS,
                "Calls",
                NotificationManager.IMPORTANCE_MAX
        );
        callsChannel.setDescription("Incoming voice and video calls");
        callsChannel.enableLights(true);
        callsChannel.setLightColor(Color.GREEN);
        callsChannel.enableVibration(true);
        callsChannel.setVibrationPattern(new long[]{0, 1000, 1000, 1000});
        manager.createNotificationChannel(callsChannel);
    }

    public static String getChannelIdForDialog(long dialogId, boolean isChannel) {
        if (dialogId > 0) {
            return CHANNEL_PRIVATE_CHATS;
        } else if (isChannel) {
            return CHANNEL_CHANNELS;
        } else {
            return CHANNEL_GROUPS;
        }
    }
}
