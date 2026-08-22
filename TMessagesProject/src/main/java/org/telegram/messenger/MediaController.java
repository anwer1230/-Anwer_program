package org.telegram.messenger;

import android.content.Context;
import org.telegram.tgnet.TLRPC;
import java.util.ArrayList;

/**
 * MediaController
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/MediaController.java)
 *
 * Audio/Video playback service, voice note recorder, audio focus manager,
 * waveform generator, and proximity sensor coordinator.
 */
public class MediaController {

    private static volatile MediaController Instance;
    private TLRPC.Message playingMessage;
    private boolean isPaused = false;
    private float currentProgress = 0f;
    private int currentAudioDuration = 0;

    public static MediaController getInstance() {
        MediaController localInstance = Instance;
        if (localInstance == null) {
            synchronized (MediaController.class) {
                localInstance = Instance;
                if (localInstance == null) {
                    Instance = localInstance = new MediaController();
                }
            }
        }
        return localInstance;
    }

    public boolean playMessage(TLRPC.Message message) {
        if (message == null) return false;
        this.playingMessage = message;
        this.isPaused = false;
        this.currentProgress = 0f;
        NotificationCenter.getGlobalInstance().postNotificationName(NotificationCenter.messagePlayingPlayStateChanged, message);
        return true;
    }

    public boolean pauseMessage(TLRPC.Message message) {
        if (playingMessage != null && playingMessage.id == message.id) {
            isPaused = true;
            NotificationCenter.getGlobalInstance().postNotificationName(NotificationCenter.messagePlayingPlayStateChanged, message);
            return true;
        }
        return false;
    }

    public void stopAudio() {
        playingMessage = null;
        isPaused = false;
        currentProgress = 0f;
        NotificationCenter.getGlobalInstance().postNotificationName(NotificationCenter.messagePlayingDidReset);
    }

    public boolean isPlayingMessage(TLRPC.Message message) {
        return playingMessage != null && playingMessage.id == message.id && !isPaused;
    }

    public TLRPC.Message getPlayingMessage() {
        return playingMessage;
    }
}
