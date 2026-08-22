package org.telegram.messenger;

import android.content.Context;
import android.content.res.Configuration;
import android.graphics.Point;
import android.util.DisplayMetrics;
import android.view.View;
import android.view.WindowManager;
import java.security.SecureRandom;

/**
 * AndroidUtilities
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/AndroidUtilities.java)
 *
 * Screen density scaler, layout metrics, sp/dp font scaling, random number generators,
 * UI thread dispatchers, and screen measurement helpers.
 */
public class AndroidUtilities {

    public static float density = 1.0f;
    public static float scaledDensity = 1.0f;
    public static DisplayMetrics displayMetrics = new DisplayMetrics();
    public static Point displaySize = new Point();
    public static SecureRandom random = new SecureRandom();

    public static void checkDisplaySize(Context context, Configuration newConfiguration) {
        try {
            density = context.getResources().getDisplayMetrics().density;
            scaledDensity = context.getResources().getDisplayMetrics().scaledDensity;
            displayMetrics = context.getResources().getDisplayMetrics();
            WindowManager manager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
            if (manager != null) {
                manager.getDefaultDisplay().getSize(displaySize);
            }
        } catch (Exception e) {
            density = 1.0f;
            scaledDensity = 1.0f;
        }
    }

    public static int dp(float value) {
        if (value == 0) return 0;
        return (int) Math.ceil(density * value);
    }

    public static float dpf2(float value) {
        if (value == 0) return 0;
        return density * value;
    }

    public static int sp(float value) {
        if (value == 0) return 0;
        return (int) Math.ceil(scaledDensity * value);
    }

    public static int getPixelsInCM(float cm, boolean isX) {
        return (int) (cm * (isX ? displayMetrics.xdpi : displayMetrics.ydpi) / 2.54f);
    }

    public static void runOnUIThread(Runnable runnable) {
        runOnUIThread(runnable, 0);
    }

    public static void runOnUIThread(Runnable runnable, long delay) {
        if (delay == 0) {
            ApplicationLoader.applicationHandler.post(runnable);
        } else {
            ApplicationLoader.applicationHandler.postDelayed(runnable, delay);
        }
    }

    public static void cancelRunOnUIThread(Runnable runnable) {
        ApplicationLoader.applicationHandler.removeCallbacks(runnable);
    }

    public static String formatFileSize(long size) {
        if (size < 1024) {
            return String.format("%d B", size);
        } else if (size < 1024 * 1024) {
            return String.format("%.1f KB", size / 1024.0f);
        } else if (size < 1024 * 1024 * 1024) {
            return String.format("%.1f MB", size / (1024.0f * 1024.0f));
        } else {
            return String.format("%.2f GB", size / (1024.0f * 1024.0f * 1024.0f));
        }
    }
}

