package org.telegram.ui.Cells;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextPaint;
import android.view.View;
import org.telegram.messenger.LocaleController;
import org.telegram.messenger.MessageObject;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.Browser;
import org.telegram.ui.Components.AvatarDrawable;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * ChatMessageCell
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/Cells/ChatMessageCell.java)
 *
 * Highly optimized custom view rendering individual message bubbles, sender headers,
 * avatars via AvatarDrawable, media previews, WebPage link previews (TL_messageMediaWebPage),
 * timestamps, checkmarks, replies, and link click dispatching.
 */
public class ChatMessageCell extends View {

    public interface ChatMessageCellDelegate {
        void didPressAvatar(ChatMessageCell cell, long userId, long chatId);
        void didPressReply(ChatMessageCell cell, int replyMessageId);
        void didLongPressMessage(ChatMessageCell cell, TLRPC.Message message);
        void didPressUrl(ChatMessageCell cell, String url);
    }

    private ChatMessageCellDelegate delegate;
    private TLRPC.Message currentMessage;
    private MessageObject currentMessageObject;
    private TLRPC.User currentUser;
    private TLRPC.Chat currentChat;
    private TLRPC.Message replyMessage;
    private TLRPC.WebPage currentWebPage;
    private AvatarDrawable avatarDrawable;

    private final Paint bubblePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint replyLinePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint webPageLinePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final TextPaint textPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    private final TextPaint namePaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    private final TextPaint timePaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    private final TextPaint replyNamePaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    private final TextPaint replyTextPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    private final TextPaint mediaCaptionPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    private final TextPaint webPageSitePaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    private final TextPaint webPageTitlePaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    private final TextPaint webPageDescPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);

    private final RectF bubbleRect = new RectF();
    private final RectF avatarRect = new RectF();
    private final RectF replyRect = new RectF();
    private final RectF webPageRect = new RectF();

    private boolean isOutgoing = false;
    private boolean isRtl = false;
    private CharSequence messageText = "";
    private String senderName = "";
    private String timeString = "12:00";
    private String statusCheckmarks = "";
    private String replyHeaderTitle = "";
    private String replyHeaderSubtitle = "";
    private String mediaDescription = "";
    private String detectedUrl = null;

    private StaticLayout textLayout;
    private StaticLayout webPageTitleLayout;
    private StaticLayout webPageDescLayout;
    private static final SimpleDateFormat timeFormatter = new SimpleDateFormat("HH:mm", Locale.getDefault());

    public ChatMessageCell(Context context) {
        super(context);
        init();
    }

    public void setDelegate(ChatMessageCellDelegate delegate) {
        this.delegate = delegate;
    }

    private void init() {
        avatarDrawable = new AvatarDrawable();
        avatarDrawable.setAvatarSize(AndroidUtilities.dp(36));
        updateThemePaints();
    }

    public void updateThemePaints() {
        int currentSize = Theme.getFontSize();

        textPaint.setColor(Theme.getColor(Theme.key_chats_message));
        textPaint.setTextSize(AndroidUtilities.dp(currentSize));
        textPaint.setTypeface(Theme.regularTypeface);

        namePaint.setColor(Theme.getColor(Theme.key_chats_name));
        namePaint.setTextSize(AndroidUtilities.dp(Math.max(12, currentSize - 2)));
        namePaint.setFakeBoldText(true);
        namePaint.setTypeface(Theme.boldTypeface);

        timePaint.setColor(Theme.getColor(Theme.key_chats_date));
        timePaint.setTextSize(AndroidUtilities.dp(Math.max(10, currentSize - 5)));

        replyLinePaint.setColor(Theme.getColor(Theme.key_actionBarDefault));
        replyLinePaint.setStrokeWidth(AndroidUtilities.dp(2.5f));
        replyLinePaint.setStyle(Paint.Style.STROKE);

        replyNamePaint.setColor(Theme.getColor(Theme.key_actionBarDefault));
        replyNamePaint.setTextSize(AndroidUtilities.dp(Math.max(11, currentSize - 3)));
        replyNamePaint.setFakeBoldText(true);

        replyTextPaint.setColor(Theme.getColor(Theme.key_chats_message));
        replyTextPaint.setTextSize(AndroidUtilities.dp(Math.max(11, currentSize - 4)));

        mediaCaptionPaint.setColor(Theme.getColor(Theme.key_chats_date));
        mediaCaptionPaint.setTextSize(AndroidUtilities.dp(Math.max(11, currentSize - 3)));

        webPageLinePaint.setColor(Theme.getColor(Theme.key_actionBarDefault));
        webPageLinePaint.setStrokeWidth(AndroidUtilities.dp(2.5f));
        webPageLinePaint.setStyle(Paint.Style.STROKE);

        webPageSitePaint.setColor(Theme.getColor(Theme.key_actionBarDefault));
        webPageSitePaint.setTextSize(AndroidUtilities.dp(Math.max(11, currentSize - 3.5f)));
        webPageSitePaint.setFakeBoldText(true);

        webPageTitlePaint.setColor(Theme.getColor(Theme.key_chats_name));
        webPageTitlePaint.setTextSize(AndroidUtilities.dp(Math.max(12, currentSize - 2)));
        webPageTitlePaint.setFakeBoldText(true);

        webPageDescPaint.setColor(Theme.getColor(Theme.key_chats_message));
        webPageDescPaint.setTextSize(AndroidUtilities.dp(Math.max(11, currentSize - 4)));
    }

    public void setMessageObject(TLRPC.Message message, TLRPC.User user, TLRPC.Chat chat, TLRPC.Message replyMsg, boolean rtl) {
        this.currentMessage = message;
        this.currentUser = user;
        this.currentChat = chat;
        this.replyMessage = replyMsg;
        this.isRtl = rtl;
        this.detectedUrl = null;

        if (message == null) return;

        this.currentMessageObject = new MessageObject(0, message, true);
        this.isOutgoing = message.out;
        this.messageText = currentMessageObject.messageText != null ? currentMessageObject.messageText : (message.message != null ? message.message : "");

        // 1. Time Formatting
        long timestamp = message.date > 0 ? (message.date * 1000L) : System.currentTimeMillis();
        this.timeString = timeFormatter.format(new Date(timestamp));

        // 2. Outgoing Delivery Status (✓ / ✓✓)
        if (isOutgoing) {
            bubblePaint.setColor(Theme.getColor(Theme.key_chat_outBubble));
            senderName = "";
            this.statusCheckmarks = (message.flags & 2) != 0 ? " ✓" : " ✓✓";
        } else {
            bubblePaint.setColor(Theme.getColor(Theme.key_chat_inBubble));
            this.statusCheckmarks = "";
            if (user != null) {
                senderName = (user.first_name != null ? user.first_name : "") + 
                             (user.last_name != null ? " " + user.last_name : "");
                avatarDrawable.setInfo(user);
            } else if (chat != null) {
                senderName = chat.title != null ? chat.title : "";
                avatarDrawable.setInfo(chat);
            } else {
                senderName = "";
            }
        }

        // 3. Reply Preview Data
        if (replyMessage != null) {
            replyHeaderTitle = replyMessage.out ? "You" : "Reply";
            replyHeaderSubtitle = replyMessage.message != null ? replyMessage.message : "Media Attachment";
        } else {
            replyHeaderTitle = "";
            replyHeaderSubtitle = "";
        }

        // 4. Media Attachment Data & WebPage Preview
        if (message.media != null) {
            if (message.media instanceof TLRPC.TL_messageMediaPhoto) {
                mediaDescription = "📷 صورة / Photo";
            } else if (message.media instanceof TLRPC.TL_messageMediaDocument) {
                mediaDescription = "📁 مستند / Document";
            } else if (message.media instanceof TLRPC.TL_messageMediaWebPage) {
                this.currentWebPage = ((TLRPC.TL_messageMediaWebPage) message.media).webpage;
                if (currentWebPage != null) {
                    detectedUrl = currentWebPage.url;
                }
            } else {
                mediaDescription = "";
            }
        } else {
            mediaDescription = "";
            // Check for plain URLs in text if no media webPage attached
            String raw = message.message;
            if (raw != null) {
                for (String word : raw.split("\\s+")) {
                    if (word.startsWith("http://") || word.startsWith("https://") || word.startsWith("t.me/")) {
                        detectedUrl = word;
                        break;
                    }
                }
            }
        }

        requestLayout();
        invalidate();
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = MeasureSpec.getSize(widthMeasureSpec);
        int maxTextWidth = Math.max(width - 160, 200);

        int contentHeight = 36;

        if (!isOutgoing && !senderName.isEmpty()) {
            contentHeight += 20;
        }

        if (!replyHeaderTitle.isEmpty()) {
            contentHeight += 38;
        }

        if (!mediaDescription.isEmpty()) {
            contentHeight += 24;
        }

        if (messageText != null && messageText.length() > 0) {
            textLayout = new StaticLayout(messageText, textPaint, maxTextWidth, Layout.Alignment.ALIGN_NORMAL, 1.15f, 0.0f, false);
            contentHeight += textLayout.getHeight();
        } else {
            textLayout = null;
        }

        // WebPage preview layout
        if (currentWebPage != null && !(currentWebPage instanceof TLRPC.TL_webPageEmpty)) {
            int previewWidth = maxTextWidth - 16;
            contentHeight += 20; // site name
            if (currentWebPage.title != null && !currentWebPage.title.isEmpty()) {
                webPageTitleLayout = new StaticLayout(currentWebPage.title, webPageTitlePaint, previewWidth, Layout.Alignment.ALIGN_NORMAL, 1.0f, 0.0f, false);
                contentHeight += webPageTitleLayout.getHeight() + 4;
            } else {
                webPageTitleLayout = null;
            }
            if (currentWebPage.description != null && !currentWebPage.description.isEmpty()) {
                webPageDescLayout = new StaticLayout(currentWebPage.description, webPageDescPaint, previewWidth, Layout.Alignment.ALIGN_NORMAL, 1.0f, 0.0f, false);
                contentHeight += webPageDescLayout.getHeight() + 8;
            } else {
                webPageDescLayout = null;
            }
        } else {
            webPageTitleLayout = null;
            webPageDescLayout = null;
        }

        int height = Math.max(contentHeight + 20, 56);
        setMeasuredDimension(width, height);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (currentMessage == null) return;

        int width = getWidth();
        int height = getHeight();

        // 1. Draw Avatar if incoming
        if (!isOutgoing) {
            int avatarSize = 36;
            int avatarLeft = isRtl ? width - avatarSize - 12 : 12;
            int avatarTop = height - avatarSize - 8;
            avatarRect.set(avatarLeft, avatarTop, avatarLeft + avatarSize, avatarTop + avatarSize);
            avatarDrawable.setBounds((int) avatarRect.left, (int) avatarRect.top, (int) avatarRect.right, (int) avatarRect.bottom);
            avatarDrawable.draw(canvas);
        }

        // 2. Draw Message Bubble
        float bubbleWidth = Math.min(width * 0.78f, width - 80);
        float bubbleLeft = isOutgoing ? (width - bubbleWidth - 16) : 56;
        float bubbleRight = isOutgoing ? (width - 16) : (56 + bubbleWidth);
        float bubbleTop = 6;
        float bubbleBottom = height - 6;

        bubbleRect.set(bubbleLeft, bubbleTop, bubbleRight, bubbleBottom);
        canvas.drawRoundRect(bubbleRect, 16, 16, bubblePaint);

        float textX = bubbleLeft + 14;
        float currentY = bubbleTop + 20;

        // 3. Draw Sender Name
        if (!isOutgoing && !senderName.isEmpty()) {
            canvas.drawText(senderName, textX, currentY, namePaint);
            currentY += 20;
        }

        // 4. Draw Reply Preview Header
        if (!replyHeaderTitle.isEmpty()) {
            replyRect.set(textX, currentY - 4, bubbleRight - 14, currentY + 32);
            canvas.drawLine(replyRect.left, replyRect.top, replyRect.left, replyRect.bottom, replyLinePaint);
            canvas.drawText(replyHeaderTitle, replyRect.left + 8, currentY + 12, replyNamePaint);
            String snippet = replyHeaderSubtitle.length() > 30 ? replyHeaderSubtitle.substring(0, 30) + "..." : replyHeaderSubtitle;
            canvas.drawText(snippet, replyRect.left + 8, currentY + 28, replyTextPaint);
            currentY += 38;
        }

        // 5. Draw Media Indicator
        if (!mediaDescription.isEmpty()) {
            canvas.drawText(mediaDescription, textX, currentY, mediaCaptionPaint);
            currentY += 22;
        }

        // 6. Draw Message Text
        if (textLayout != null) {
            canvas.save();
            canvas.translate(textX, currentY - 12);
            textLayout.draw(canvas);
            canvas.restore();
            currentY += textLayout.getHeight() + 4;
        }

        // 7. Draw WebPage Link Preview Card
        if (currentWebPage != null && !(currentWebPage instanceof TLRPC.TL_webPageEmpty)) {
            float cardLeft = textX;
            float cardRight = bubbleRight - 14;
            float cardTop = currentY;
            float cardBottom = cardTop + 20 + (webPageTitleLayout != null ? webPageTitleLayout.getHeight() : 0) + (webPageDescLayout != null ? webPageDescLayout.getHeight() : 0);
            webPageRect.set(cardLeft, cardTop, cardRight, cardBottom);

            canvas.drawLine(cardLeft, cardTop, cardLeft, cardBottom, webPageLinePaint);

            String site = currentWebPage.site_name != null ? currentWebPage.site_name : "Link Preview";
            canvas.drawText(site, cardLeft + 8, cardTop + 14, webPageSitePaint);
            float innerY = cardTop + 28;

            if (webPageTitleLayout != null) {
                canvas.save();
                canvas.translate(cardLeft + 8, innerY);
                webPageTitleLayout.draw(canvas);
                canvas.restore();
                innerY += webPageTitleLayout.getHeight() + 4;
            }

            if (webPageDescLayout != null) {
                canvas.save();
                canvas.translate(cardLeft + 8, innerY);
                webPageDescLayout.draw(canvas);
                canvas.restore();
            }
        }

        // 8. Draw Timestamp & Outgoing Checkmark
        String fullTimeText = timeString + (isOutgoing ? statusCheckmarks : "");
        float timeWidth = timePaint.measureText(fullTimeText);
        float timeX = bubbleRight - timeWidth - 12;
        float timeY = bubbleBottom - 10;
        canvas.drawText(fullTimeText, timeX, timeY, timePaint);
    }

    @Override
    public boolean onTouchEvent(android.view.MotionEvent event) {
        if (event.getAction() == android.view.MotionEvent.ACTION_UP) {
            float x = event.getX();
            float y = event.getY();
            if (!isOutgoing && avatarRect.contains(x, y) && delegate != null) {
                long userId = currentUser != null ? currentUser.id : 0;
                long chatId = currentChat != null ? currentChat.id : 0;
                delegate.didPressAvatar(this, userId, chatId);
                return true;
            } else if (!replyHeaderTitle.isEmpty() && replyRect.contains(x, y) && delegate != null && replyMessage != null) {
                delegate.didPressReply(this, replyMessage.id);
                return true;
            } else if (webPageRect.contains(x, y) && detectedUrl != null) {
                if (delegate != null) {
                    delegate.didPressUrl(this, detectedUrl);
                } else {
                    Browser.openUrl(getContext(), detectedUrl);
                }
                return true;
            } else if (bubbleRect.contains(x, y) && detectedUrl != null) {
                if (delegate != null) {
                    delegate.didPressUrl(this, detectedUrl);
                } else {
                    Browser.openUrl(getContext(), detectedUrl);
                }
                return true;
            }
        }
        return super.onTouchEvent(event);
    }
}


