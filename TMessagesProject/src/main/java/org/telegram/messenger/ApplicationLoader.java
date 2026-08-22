package org.telegram.messenger;

import android.app.Application;
import android.content.Context;
import android.os.Handler;

/**
 * ApplicationLoader
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/ApplicationLoader.java)
 *
 * Core bootstrap class: initializes native engines, cryptographic salts,
 * databases, connections manager, push services, and localizations.
 */
public class ApplicationLoader extends Application {

    public static volatile Context applicationContext;
    public static volatile Handler applicationHandler;

    @Override
    public void onCreate() {
        super.onCreate();
        applicationContext = getApplicationContext();
        applicationHandler = new Handler(applicationContext.getMainLooper());

        // Initialize UserConfig & Connections for all 4 slots
        for (int i = 0; i < UserConfig.MAX_ACCOUNT_COUNT; i++) {
            UserConfig.getInstance(i);
            MessagesController.getInstance(i);
            MessagesStorage.getInstance(i);
        }
    }

    public static void postInitApplication() {
        // Post initialization hooks
    }
}
