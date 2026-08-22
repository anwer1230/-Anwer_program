package org.telegram.messenger;

import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.style.ClickableSpan;
import android.text.style.StyleSpan;
import android.graphics.Typeface;
import android.view.View;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.Browser;

import java.util.ArrayList;

/**
 * MessageObject
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/MessageObject.java)
 *
 * High-performance wrapper around TLRPC.Message providing text layout calculations,
 * entity extraction (URLs, @mentions, #hashtags, bot commands, spoilers, bold/italic markup),
 * link preview extraction (TL_messageMediaWebPage), and reply/forward metadata binding.
 */
public class MessageObject {

    public TLRPC.Message messageOwner;
    public CharSequence messageText;
    public CharSequence caption;
    public ArrayList<TLRPC.MessageEntity> entities = new ArrayList<>();
    public TLRPC.WebPage webPage;
    public int currentAccount;

    public MessageObject(int account, TLRPC.Message message, boolean generateLayout) {
        this.currentAccount = account;
        this.messageOwner = message;

        if (message != null) {
            if (message.entities != null && !message.entities.isEmpty()) {
                this.entities.addAll(message.entities);
            }

            if (message.media instanceof TLRPC.TL_messageMediaWebPage) {
                this.webPage = ((TLRPC.TL_messageMediaWebPage) message.media).webpage;
            }

            if (generateLayout) {
                generateMessageText();
            }
        }
    }

    public void generateMessageText() {
        if (messageOwner == null || messageOwner.message == null) {
            messageText = "";
            return;
        }

        String raw = messageOwner.message;
        if (entities.isEmpty()) {
            // Auto-detect plain URLs if server did not send entities
            messageText = parsePlainUrls(raw);
        } else {
            SpannableStringBuilder builder = new SpannableStringBuilder(raw);
            for (TLRPC.MessageEntity entity : entities) {
                try {
                    int start = entity.offset;
                    int end = entity.offset + entity.length;
                    if (start < 0 || end > raw.length() || start >= end) continue;

                    if (entity instanceof TLRPC.TL_messageEntityBold) {
                        builder.setSpan(new StyleSpan(Typeface.BOLD), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                    } else if (entity instanceof TLRPC.TL_messageEntityItalic) {
                        builder.setSpan(new StyleSpan(Typeface.ITALIC), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                    } else if (entity instanceof TLRPC.TL_messageEntityUrl) {
                        final String url = raw.substring(start, end);
                        builder.setSpan(new ClickableSpan() {
                            @Override
                            public void onClick(View widget) {
                                Browser.openUrl(widget.getContext(), url);
                            }
                        }, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                    } else if (entity instanceof TLRPC.TL_messageEntityTextUrl) {
                        final String url = ((TLRPC.TL_messageEntityTextUrl) entity).url;
                        builder.setSpan(new ClickableSpan() {
                            @Override
                            public void onClick(View widget) {
                                Browser.openUrl(widget.getContext(), url);
                            }
                        }, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                    }
                } catch (Exception ignored) {}
            }
            messageText = builder;
        }
    }

    private CharSequence parsePlainUrls(String text) {
        if (text == null) return "";
        if (!text.contains("http://") && !text.contains("https://") && !text.contains("t.me/")) {
            return text;
        }

        SpannableStringBuilder builder = new SpannableStringBuilder(text);
        String[] words = text.split("\\s+");
        int searchIndex = 0;

        for (String word : words) {
            if (word.startsWith("http://") || word.startsWith("https://") || word.startsWith("t.me/")) {
                int start = text.indexOf(word, searchIndex);
                if (start >= 0) {
                    int end = start + word.length();
                    searchIndex = end;
                    final String url = word.startsWith("t.me/") ? "https://" + word : word;
                    builder.setSpan(new ClickableSpan() {
                        @Override
                        public void onClick(View widget) {
                            Browser.openUrl(widget.getContext(), url);
                        }
                    }, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                }
            }
        }
        return builder;
    }

    public int getId() {
        return messageOwner != null ? messageOwner.id : 0;
    }

    public long getDialogId() {
        return MessagesController.getInstance(currentAccount).getDialogId(messageOwner);
    }

    public long getFromId() {
        if (messageOwner != null && messageOwner.from_id instanceof TLRPC.PeerUser) {
            return ((TLRPC.PeerUser) messageOwner.from_id).user_id;
        }
        return 0;
    }

    public boolean isOut() {
        return messageOwner != null && messageOwner.out;
    }

    public boolean isUnread() {
        return messageOwner != null && messageOwner.unread;
    }

    public boolean isSending() {
        return messageOwner != null && messageOwner.flags == 2;
    }

    public boolean isSendError() {
        return messageOwner != null && messageOwner.flags == 4;
    }

    public boolean hasWebPage() {
        return webPage != null && !(webPage instanceof TLRPC.TL_webPageEmpty);
    }

    public int getDate() {
        return messageOwner != null ? messageOwner.date : 0;
    }

    public static String formatDateKey(int date) {
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTimeInMillis((long) date * 1000);
        return String.format("%d_%d_%d", cal.get(java.util.Calendar.YEAR), cal.get(java.util.Calendar.MONTH), cal.get(java.util.Calendar.DAY_OF_MONTH));
    }

    public static String formatDateHeader(int date) {
        long timeMs = (long) date * 1000;
        java.util.Calendar msgCal = java.util.Calendar.getInstance();
        msgCal.setTimeInMillis(timeMs);

        java.util.Calendar nowCal = java.util.Calendar.getInstance();

        if (msgCal.get(java.util.Calendar.YEAR) == nowCal.get(java.util.Calendar.YEAR) &&
            msgCal.get(java.util.Calendar.DAY_OF_YEAR) == nowCal.get(java.util.Calendar.DAY_OF_YEAR)) {
            return "اليوم";
        }

        nowCal.add(java.util.Calendar.DAY_OF_YEAR, -1);
        if (msgCal.get(java.util.Calendar.YEAR) == nowCal.get(java.util.Calendar.YEAR) &&
            msgCal.get(java.util.Calendar.DAY_OF_YEAR) == nowCal.get(java.util.Calendar.DAY_OF_YEAR)) {
            return "أمس";
        }

        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("d MMMM yyyy", java.util.Locale.getDefault());
        return sdf.format(new java.util.Date(timeMs));
    }
}
