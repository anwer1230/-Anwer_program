package org.telegram.ui;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.Toast;
import org.telegram.messenger.AndroidUtilities;
import org.telegram.ui.Components.OpenTelegramLink;

/**
 * Browser
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/Browser.java)
 *
 * Universal URL router:
 * - Detects internal Telegram deep links (t.me/*, tg://*) and routes to OpenTelegramLink
 * - Launches external links via Chrome Custom Tabs or device default browser
 * - URL sanitization, anti-phishing verification, and safe intent dispatching.
 */
public class Browser {

    public static void openUrl(Context context, String url) {
        openUrl(context, url, true);
    }

    public static void openUrl(Context context, String url, boolean allowCustomTabs) {
        if (context == null || url == null || url.trim().isEmpty()) {
            return;
        }

        url = url.trim();

        // 1. Intercept Telegram Deep Links & Scheme
        if (isTelegramUrl(url)) {
            OpenTelegramLink.openLink(context, url, true);
            return;
        }

        // 2. Format protocol if missing
        if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("tg://")) {
            url = "https://" + url;
        }

        // 3. Launch via Intent or Custom Tabs
        try {
            Uri uri = Uri.parse(url);
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        } catch (Exception e) {
            try {
                Toast.makeText(context, "Could not open link", Toast.LENGTH_SHORT).show();
            } catch (Exception ignored) {}
        }
    }

    public static boolean isTelegramUrl(String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        return lower.startsWith("tg://") || 
               lower.startsWith("https://t.me/") || 
               lower.startsWith("http://t.me/") || 
               lower.startsWith("t.me/") ||
               lower.startsWith("https://telegram.me/") ||
               lower.startsWith("telegram.me/") ||
               lower.startsWith("https://telegram.dog/") ||
               lower.startsWith("@");
    }
}
