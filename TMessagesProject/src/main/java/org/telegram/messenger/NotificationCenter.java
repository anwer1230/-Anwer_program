package org.telegram.messenger;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * NotificationCenter
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/NotificationCenter.java)
 *
 * Central event bus coordinating UI updates across all activities, adapters,
 * background services, and audio/video controllers.
 */
public class NotificationCenter {

    private static volatile NotificationCenter[] Instance = new NotificationCenter[UserConfig.MAX_ACCOUNT_COUNT];
    private static volatile NotificationCenter globalInstance;

    public interface NotificationCenterDelegate {
        void didReceivedNotification(int id, int account, Object... args);
    }

    // Standard Telegram Event Identifiers
    public static final int didReceivedNewMessages = 1;
    public static final int updateInterfaces = 2;
    public static final int dialogsNeedReload = 3;
    public static final int closeChats = 4;
    public static final int messagesDeleted = 5;
    public static final int historyCleared = 6;
    public static final int messageReceivedByAck = 7;
    public static final int messageReceivedByServer = 8;
    public static final int messageSendError = 9;
    public static final int contactsDidLoad = 10;
    public static final int chatDidCreated = 11;
    public static final int chatDidFailCreate = 12;
    public static final int chatInfoDidLoad = 13;
    public static final int userFullInfoDidLoad = 14;
    public static final int mediaDidLoad = 15;
    public static final int encryptedChatCreated = 16;
    public static final int encryptedChatUpdated = 17;
    public static final int userStatusLoaded = 18;
    public static final int botKeyboardDidLoad = 19;
    public static final int chatOnlineCountDidLoad = 20;
    public static final int messagePlayingProgressDidChanged = 21;
    public static final int messagePlayingDidReset = 22;
    public static final int messagePlayingPlayStateChanged = 23;
    public static final int pushMessagesUpdated = 24;
    public static final int newDraftReceived = 25;
    public static final int proxySettingsChanged = 26;
    public static final int storiesUpdated = 27;
    public static final int supergroupPermissionsUpdated = 28;
    public static final int spamReportSubmitted = 29;
    public static final int messagesDidLoad = 30;
    public static final int didSetNewTheme = 31;
    public static final int fontSizeChanged = 32;
    public static final int reloadDialogs = 33;
    public static final int chatInfoNeedReload = 34;

    private final int currentAccount;
    private final HashMap<Integer, ArrayList<NotificationCenterDelegate>> observers = new HashMap<>();
    private final HashMap<Integer, ArrayList<NotificationCenterDelegate>> removeAfterBroadcast = new HashMap<>();
    private final HashMap<Integer, ArrayList<NotificationCenterDelegate>> addAfterBroadcast = new HashMap<>();
    private int broadcasting = 0;

    public NotificationCenter(int account) {
        this.currentAccount = account;
    }

    public static NotificationCenter getInstance(int num) {
        NotificationCenter localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (NotificationCenter.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new NotificationCenter(num);
                }
            }
        }
        return localInstance;
    }

    public static NotificationCenter getGlobalInstance() {
        NotificationCenter localInstance = globalInstance;
        if (localInstance == null) {
            synchronized (NotificationCenter.class) {
                localInstance = globalInstance;
                if (localInstance == null) {
                    globalInstance = localInstance = new NotificationCenter(-1);
                }
            }
        }
        return localInstance;
    }

    public void addObserver(NotificationCenterDelegate observer, int id) {
        if (broadcasting != 0) {
            ArrayList<NotificationCenterDelegate> arrayList = addAfterBroadcast.computeIfAbsent(id, k -> new ArrayList<>());
            arrayList.add(observer);
            return;
        }
        ArrayList<NotificationCenterDelegate> objects = observers.computeIfAbsent(id, k -> new ArrayList<>());
        if (!objects.contains(observer)) {
            objects.add(observer);
        }
    }

    public void removeObserver(NotificationCenterDelegate observer, int id) {
        if (broadcasting != 0) {
            ArrayList<NotificationCenterDelegate> arrayList = removeAfterBroadcast.computeIfAbsent(id, k -> new ArrayList<>());
            arrayList.add(observer);
            return;
        }
        ArrayList<NotificationCenterDelegate> objects = observers.get(id);
        if (objects != null) {
            objects.remove(observer);
        }
    }

    public void postNotificationName(int id, Object... args) {
        broadcasting++;
        ArrayList<NotificationCenterDelegate> objects = observers.get(id);
        if (objects != null && !objects.isEmpty()) {
            for (int a = 0; a < objects.size(); a++) {
                NotificationCenterDelegate obj = objects.get(a);
                obj.didReceivedNotification(id, currentAccount, args);
            }
        }
        broadcasting--;

        if (broadcasting == 0) {
            if (!removeAfterBroadcast.isEmpty()) {
                for (HashMap.Entry<Integer, ArrayList<NotificationCenterDelegate>> entry : removeAfterBroadcast.entrySet()) {
                    for (NotificationCenterDelegate delegate : entry.getValue()) {
                        removeObserver(delegate, entry.getKey());
                    }
                }
                removeAfterBroadcast.clear();
            }
            if (!addAfterBroadcast.isEmpty()) {
                for (HashMap.Entry<Integer, ArrayList<NotificationCenterDelegate>> entry : addAfterBroadcast.entrySet()) {
                    for (NotificationCenterDelegate delegate : entry.getValue()) {
                        addObserver(delegate, entry.getKey());
                    }
                }
                addAfterBroadcast.clear();
            }
        }
    }
}
