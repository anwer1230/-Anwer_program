package org.telegram.messenger;

import java.util.HashMap;
import java.util.Locale;

/**
 * LocaleController
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/LocaleController.java)
 *
 * Multi-language localization manager with dynamic RTL / LTR switching
 * and comprehensive Arabic / English localization dictionary for restrictions,
 * admin permissions, ban status, and system notices.
 */
public class LocaleController {

    private static volatile LocaleController Instance;
    public static boolean isRTL = false;
    private static Locale currentLocale = Locale.getDefault();
    private static final HashMap<String, String> localeStrings = new HashMap<>();

    static {
        // Arabic & English localization strings for permissions and restrictions
        localeStrings.put("ChannelCantWrite", "المشرفون فقط يمكنهم النشر في هذه القناة");
        localeStrings.put("ChatWriteForbidden", "لا يمكنك إرسال رسائل إلى هذه المجموعة");
        localeStrings.put("YouWereBanned", "تم حظرك من قبل مشرفي هذه المجموعة");
        localeStrings.put("Slowmode", "تم تفعيل الوضع البطيء: يمكنك الإرسال بعد %s");
        localeStrings.put("ChatSendMediaForbidden", "لا يسمح بإرسال الوسائط في هذه المحادثة");
        localeStrings.put("ChatSendStickersForbidden", "لا يسمح بإرسال الملصقات في هذه المحادثة");
        localeStrings.put("ChatSendLinksForbidden", "لا يسمح بإرسال الروابط في هذه المحادثة");
        localeStrings.put("FloodWait", "الرجاء الانتظار %d ثانية قبل المحاولة مرة أخرى");
        localeStrings.put("ChatAdminRequired", "تحتاج إلى صلاحيات مشرف لتنفيذ هذا الإجراء");
        localeStrings.put("ChannelJoinToPost", "انضم إلى القناة لتتمكن من النشر أو التعليق");
        localeStrings.put("YouLeftGroup", "لقد غادرت هذه المجموعة");
        localeStrings.put("ChatDeactivated", "تم تعطيل هذه المجموعة");
        localeStrings.put("UsernameNotFound", "اسم المستخدم غير موجود");
        localeStrings.put("InviteExpired", "عذراً، هذا الرابط منتهي الصلاحية أو غير صالح");
        localeStrings.put("OpenUrlAlert", "هل تريد فتح الرابط الخارجي؟");
        localeStrings.put("JoinGroup", "الانضمام إلى المجموعة");
        localeStrings.put("JoinChannel", "الانضمام إلى القناة");
    }

    public static LocaleController getInstance() {
        LocaleController localInstance = Instance;
        if (localInstance == null) {
            synchronized (LocaleController.class) {
                localInstance = Instance;
                if (localInstance == null) {
                    Instance = localInstance = new LocaleController();
                }
            }
        }
        return localInstance;
    }

    public static String getString(String key) {
        String val = localeStrings.get(key);
        if (val != null) {
            return val;
        }
        return key;
    }

    public static String getString(String key, int res) {
        return getString(key);
    }

    public static String formatString(String key, int res, Object... args) {
        String val = getString(key);
        try {
            return String.format(currentLocale, val, args);
        } catch (Exception e) {
            return val;
        }
    }

    public static void setLocale(Locale locale) {
        currentLocale = locale;
        isRTL = locale.getLanguage().equals("ar") || locale.getLanguage().equals("fa") || locale.getLanguage().equals("he");
    }

    public static boolean isRTL() {
        return isRTL;
    }
}
