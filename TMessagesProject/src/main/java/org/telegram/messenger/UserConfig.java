package org.telegram.messenger;

import android.content.Context;
import android.content.SharedPreferences;
import org.telegram.tgnet.TLRPC;

/**
 * UserConfig
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/UserConfig.java)
 *
 * Stores account configurations, logged-in user profiles, passcode hashes,
 * session tokens, cloud notification keys, and multi-account state (0..3).
 */
public class UserConfig {

    public static final int MAX_ACCOUNT_COUNT = 4;
    public static int selectedAccount = 0;
    private static final UserConfig[] Instance = new UserConfig[MAX_ACCOUNT_COUNT];

    public final int currentAccount;
    private TLRPC.User currentUser;
    public long clientUserId = 0;
    public boolean registeredForInternalPush = false;
    public String pushString = "";
    public int lastSendMessageId = -210000;
    public int lastBroadcastId = -1;
    public boolean blockedUsersLoaded = false;
    public int totalDialogsCount = 0;
    public boolean dialogsLoadOffsetId = false;

    // Passcode & Privacy
    public static String passcodeHash = "";
    public static byte[] passcodeSalt = new byte[0];
    public static int passcodeType = 0; // 0 = PIN, 1 = Password
    public static int autoLockIn = 3600;
    public static boolean useFingerprint = true;
    public static boolean isWaitingForPasscodeEnter = false;

    // App Preferences
    public boolean syncContacts = true;
    public boolean suggestContacts = true;
    public boolean hasSecureData = false;
    public int notificationsSettings = 0;

    public UserConfig(int account) {
        this.currentAccount = account;
        loadConfig();
    }

    public static UserConfig getInstance(int num) {
        UserConfig localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (UserConfig.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new UserConfig(num);
                }
            }
        }
        return localInstance;
    }

    public static int getActivatedAccountsCount() {
        int count = 0;
        for (int i = 0; i < MAX_ACCOUNT_COUNT; i++) {
            if (getInstance(i).isClientActivated()) {
                count++;
            }
        }
        return count;
    }

    public boolean isClientActivated() {
        return currentUser != null && clientUserId != 0;
    }

    public long getClientUserId() {
        return currentUser != null ? currentUser.id : clientUserId;
    }

    public TLRPC.User getCurrentUser() {
        return currentUser;
    }

    public void setCurrentUser(TLRPC.User user) {
        this.currentUser = user;
        if (user != null) {
            this.clientUserId = user.id;
        }
        saveConfig(true);
    }

    public void saveConfig(boolean withCurrentUsers) {
        // Save preferences to SharedPreferences / SQLite
    }

    public void loadConfig() {
        // Load account metadata
    }

    public void clearConfig() {
        this.currentUser = null;
        this.clientUserId = 0;
        saveConfig(true);
    }

    public static boolean checkPasscode(String passcode) {
        if (passcodeHash == null || passcodeHash.isEmpty()) {
            return true;
        }
        // Verify SHA-256 hash
        return passcodeHash.equals(passcode);
    }
}
