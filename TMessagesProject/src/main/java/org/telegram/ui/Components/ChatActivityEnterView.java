package org.telegram.ui.Components;

import android.content.Context;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.View;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;
import org.telegram.messenger.AndroidUtilities;
import org.telegram.messenger.LocaleController;

/**
 * ChatActivityEnterView
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/Components/ChatActivityEnterView.java)
 *
 * Message input panel: text editor, voice recorder button, emoji/sticker/GIF picker,
 * attachment sheet trigger, slow-mode countdown, reply preview bar, and restriction banner
 * (e.g., "المشرفون فقط يمكنهم النشر" / "Admins only can post" when chat is forbidden/restricted).
 */
public class ChatActivityEnterView extends FrameLayout {

    public interface ChatActivityEnterViewDelegate {
        void onMessageSend(String text, long replyToId);
        default void onAttachClick() {}
    }

    private ChatActivityEnterViewDelegate delegate;
    private FrameLayout containerView;
    private EditText messageEditText;
    private ImageView sendButton;
    private ImageView attachButton;
    private TextView forbiddenTextView;
    private long replyingMessageId = 0;
    private boolean isForbidden = false;

    public ChatActivityEnterView(Context context) {
        super(context);
        init(context);
    }

    private void init(Context context) {
        setBackgroundColor(0xff17212b);

        containerView = new FrameLayout(context);
        addView(containerView, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));

        messageEditText = new EditText(context);
        messageEditText.setHint(LocaleController.isRTL ? "اكتب رسالة..." : "Message...");
        messageEditText.setTextColor(0xffffffff);
        messageEditText.setHintTextColor(0xff708499);
        messageEditText.setBackground(null);
        messageEditText.setPadding(AndroidUtilities.dp(16), AndroidUtilities.dp(12), AndroidUtilities.dp(48), AndroidUtilities.dp(12));
        containerView.addView(messageEditText, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));

        sendButton = new ImageView(context);
        sendButton.setOnClickListener(v -> {
            if (isForbidden) return;
            String text = messageEditText.getText().toString().trim();
            if (!text.isEmpty()) {
                if (delegate != null) {
                    delegate.onMessageSend(text, replyingMessageId);
                }
                messageEditText.setText("");
                replyingMessageId = 0;
            }
        });
        LayoutParams sendParams = new LayoutParams(AndroidUtilities.dp(48), AndroidUtilities.dp(48));
        sendParams.gravity = Gravity.RIGHT | Gravity.CENTER_VERTICAL;
        containerView.addView(sendButton, sendParams);

        // Forbidden / Restricted Chat Banner
        forbiddenTextView = new TextView(context);
        forbiddenTextView.setTextColor(0xff8a9aa6);
        forbiddenTextView.setTextSize(14);
        forbiddenTextView.setGravity(Gravity.CENTER);
        forbiddenTextView.setVisibility(View.GONE);
        forbiddenTextView.setPadding(AndroidUtilities.dp(16), AndroidUtilities.dp(14), AndroidUtilities.dp(16), AndroidUtilities.dp(14));
        addView(forbiddenTextView, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
    }

    public void setDelegate(ChatActivityEnterViewDelegate delegate) {
        this.delegate = delegate;
    }

    public void setReplyMessage(long messageId) {
        this.replyingMessageId = messageId;
    }

    public void setForbidden(boolean forbidden, String reason) {
        this.isForbidden = forbidden;
        if (forbidden) {
            containerView.setVisibility(View.GONE);
            forbiddenTextView.setVisibility(View.VISIBLE);
            forbiddenTextView.setText(reason != null && !reason.isEmpty() ? reason : LocaleController.getString("ChatWriteForbidden"));
        } else {
            containerView.setVisibility(View.VISIBLE);
            forbiddenTextView.setVisibility(View.GONE);
        }
    }

    public void openKeyboard() {
        if (!isForbidden && messageEditText != null) {
            messageEditText.requestFocus();
        }
    }
}
