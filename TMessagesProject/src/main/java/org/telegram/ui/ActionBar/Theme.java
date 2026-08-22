package org.telegram.ui.ActionBar;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.text.TextPaint;
import org.telegram.messenger.AndroidUtilities;
import org.telegram.messenger.ApplicationLoader;
import org.telegram.messenger.NotificationCenter;

import java.util.HashMap;

/**
 * Theme
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/ActionBar/Theme.java)
 *
 * Global color definitions, dynamic themes (Dark Blue, Night, Day, Arctic, Graphite),
 * central font size control (fontSize / prefFontSize), Typeface caches, and paint caches.
 */
public class Theme {

    // Font Size Configuration (12sp - 30sp, default 16sp)
    public static final int DEFAULT_FONT_SIZE = 16;
    public static final int MIN_FONT_SIZE = 12;
    public static final int MAX_FONT_SIZE = 30;
    public static int fontSize = DEFAULT_FONT_SIZE;
    public static int prefFontSize = DEFAULT_FONT_SIZE;

    // Typefaces
    public static Typeface regularTypeface = Typeface.SANS_SERIF;
    public static Typeface boldTypeface = Typeface.DEFAULT_BOLD;
    public static Typeface italicTypeface = Typeface.create(Typeface.SANS_SERIF, Typeface.ITALIC);
    public static Typeface monoTypeface = Typeface.MONOSPACE;

    // Standard Telegram Theme Keys
    public static final String key_actionBarDefault = "actionBarDefault";
    public static final String key_actionBarDefaultTitle = "actionBarDefaultTitle";
    public static final String key_actionBarDefaultIcon = "actionBarDefaultIcon";
    public static final String key_actionBarDefaultSelector = "actionBarDefaultSelector";
    public static final String key_chat_inBubble = "chat_inBubble";
    public static final String key_chat_outBubble = "chat_outBubble";
    public static final String key_windowBackgroundWhite = "windowBackgroundWhite";
    public static final String key_windowBackgroundGray = "windowBackgroundGray";
    public static final String key_chats_name = "chats_name";
    public static final String key_chats_message = "chats_message";
    public static final String key_chats_date = "chats_date";
    public static final String key_chats_unreadCounter = "chats_unreadCounter";
    public static final String key_chats_unreadCounterText = "chats_unreadCounterText";
    public static final String key_divider = "divider";

    // Theme Color Palettes
    public static final int THEME_DARK_BLUE = 0;
    public static final int THEME_NIGHT = 1;
    public static final int THEME_DAY = 2;
    public static final int THEME_ARCTIC = 3;

    public static int selectedTheme = THEME_DARK_BLUE;

    private static final HashMap<String, Integer> currentColors = new HashMap<>();

    // Shared cached paints
    public static final Paint dividerPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    public static final TextPaint chatMessageTextPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    public static final TextPaint chatNameTextPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    public static final TextPaint chatTimeTextPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);

    static {
        loadResources();
    }

    public static void loadResources() {
        // Load saved font size from SharedPreferences if available
        if (ApplicationLoader.applicationContext != null) {
            try {
                SharedPreferences preferences = ApplicationLoader.applicationContext.getSharedPreferences("mainconfig", Context.MODE_PRIVATE);
                prefFontSize = preferences.getInt("fons_size", DEFAULT_FONT_SIZE);
                fontSize = prefFontSize;
            } catch (Exception ignored) {}
        }

        applyThemeColors(selectedTheme);

        // Configure shared TextPaints based on current fontSize
        chatMessageTextPaint.setColor(Color.WHITE);
        chatMessageTextPaint.setTextSize(AndroidUtilities.dp(fontSize));
        chatMessageTextPaint.setTypeface(regularTypeface);

        chatNameTextPaint.setColor(getColor(key_chats_name));
        chatNameTextPaint.setTextSize(AndroidUtilities.dp(Math.max(13, fontSize - 2)));
        chatNameTextPaint.setTypeface(boldTypeface);

        chatTimeTextPaint.setColor(getColor(key_chats_date));
        chatTimeTextPaint.setTextSize(AndroidUtilities.dp(Math.max(11, fontSize - 4)));

        dividerPaint.setColor(getColor(key_divider));
        dividerPaint.setStrokeWidth(1);
    }

    public static void setFontSize(int size) {
        if (size < MIN_FONT_SIZE) size = MIN_FONT_SIZE;
        if (size > MAX_FONT_SIZE) size = MAX_FONT_SIZE;
        
        prefFontSize = size;
        fontSize = size;

        if (ApplicationLoader.applicationContext != null) {
            try {
                SharedPreferences preferences = ApplicationLoader.applicationContext.getSharedPreferences("mainconfig", Context.MODE_PRIVATE);
                preferences.edit().putInt("fons_size", fontSize).apply();
            } catch (Exception ignored) {}
        }

        loadResources();

        // Broadcast to all observers (MessagesAdapter, ChatActivity, DialogsActivity, etc.)
        NotificationCenter.getGlobalInstance().postNotificationName(NotificationCenter.fontSizeChanged, fontSize);
        for (int i = 0; i < 4; i++) {
            NotificationCenter.getInstance(i).postNotificationName(NotificationCenter.fontSizeChanged, fontSize);
            NotificationCenter.getInstance(i).postNotificationName(NotificationCenter.updateInterfaces);
        }
    }

    public static int getFontSize() {
        return fontSize;
    }

    public static void applyTheme(int theme) {
        selectedTheme = theme;
        applyThemeColors(theme);
        loadResources();

        NotificationCenter.getGlobalInstance().postNotificationName(NotificationCenter.didSetNewTheme);
        for (int i = 0; i < 4; i++) {
            NotificationCenter.getInstance(i).postNotificationName(NotificationCenter.didSetNewTheme);
            NotificationCenter.getInstance(i).postNotificationName(NotificationCenter.dialogsNeedReload);
        }
    }

    private static void applyThemeColors(int theme) {
        currentColors.clear();
        switch (theme) {
            case THEME_NIGHT:
                currentColors.put(key_actionBarDefault, 0xff1c1c1e);
                currentColors.put(key_actionBarDefaultTitle, 0xffffffff);
                currentColors.put(key_actionBarDefaultIcon, 0xffffffff);
                currentColors.put(key_chat_inBubble, 0xff2c2c2e);
                currentColors.put(key_chat_outBubble, 0xff3a3a3c);
                currentColors.put(key_windowBackgroundWhite, 0xff000000);
                currentColors.put(key_windowBackgroundGray, 0xff121212);
                currentColors.put(key_chats_name, 0xffffffff);
                currentColors.put(key_chats_message, 0xff8e8e93);
                currentColors.put(key_chats_date, 0xff636366);
                currentColors.put(key_chats_unreadCounter, 0xff30d158);
                currentColors.put(key_chats_unreadCounterText, 0xff000000);
                currentColors.put(key_divider, 0xff2c2c2e);
                break;

            case THEME_DAY:
                currentColors.put(key_actionBarDefault, 0xff527da3);
                currentColors.put(key_actionBarDefaultTitle, 0xffffffff);
                currentColors.put(key_actionBarDefaultIcon, 0xffffffff);
                currentColors.put(key_chat_inBubble, 0xffffffff);
                currentColors.put(key_chat_outBubble, 0xffeffdde);
                currentColors.put(key_windowBackgroundWhite, 0xffffffff);
                currentColors.put(key_windowBackgroundGray, 0xfff0f2f5);
                currentColors.put(key_chats_name, 0xff222222);
                currentColors.put(key_chats_message, 0xff8d969e);
                currentColors.put(key_chats_date, 0xffa8a8a8);
                currentColors.put(key_chats_unreadCounter, 0xff4fa2e3);
                currentColors.put(key_chats_unreadCounterText, 0xffffffff);
                currentColors.put(key_divider, 0xffe0e0e0);
                break;

            case THEME_ARCTIC:
                currentColors.put(key_actionBarDefault, 0xff2f6ea5);
                currentColors.put(key_actionBarDefaultTitle, 0xffffffff);
                currentColors.put(key_actionBarDefaultIcon, 0xffffffff);
                currentColors.put(key_chat_inBubble, 0xfff4f9fd);
                currentColors.put(key_chat_outBubble, 0xffe1f2fb);
                currentColors.put(key_windowBackgroundWhite, 0xffffffff);
                currentColors.put(key_windowBackgroundGray, 0xffeaf3f8);
                currentColors.put(key_chats_name, 0xff1b354b);
                currentColors.put(key_chats_message, 0xff708b9f);
                currentColors.put(key_chats_date, 0xff8ba7bc);
                currentColors.put(key_chats_unreadCounter, 0xff2f6ea5);
                currentColors.put(key_chats_unreadCounterText, 0xffffffff);
                currentColors.put(key_divider, 0xffd2e2ec);
                break;

            case THEME_DARK_BLUE:
            default:
                currentColors.put(key_actionBarDefault, 0xff242f3d);
                currentColors.put(key_actionBarDefaultTitle, 0xffffffff);
                currentColors.put(key_actionBarDefaultIcon, 0xffffffff);
                currentColors.put(key_chat_inBubble, 0xff182533);
                currentColors.put(key_chat_outBubble, 0xff2b5278);
                currentColors.put(key_windowBackgroundWhite, 0xff0f1621);
                currentColors.put(key_windowBackgroundGray, 0xff17212b);
                currentColors.put(key_chats_name, 0xffffffff);
                currentColors.put(key_chats_message, 0xff7f91a4);
                currentColors.put(key_chats_date, 0xff6c7883);
                currentColors.put(key_chats_unreadCounter, 0xff2ea6ff);
                currentColors.put(key_chats_unreadCounterText, 0xffffffff);
                currentColors.put(key_divider, 0xff1f2a36);
                break;
        }
    }

    public static int getColor(String key) {
        Integer color = currentColors.get(key);
        if (color != null) return color;
        return 0xff2ea6ff; // Default Telegram Accent
    }

    public static Drawable createRoundRectDrawable(int color, int radius) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(radius);
        return drawable;
    }
}

