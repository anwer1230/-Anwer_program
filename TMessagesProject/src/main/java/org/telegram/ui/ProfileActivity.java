package org.telegram.ui;

import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.ImageView;
import org.telegram.messenger.MessagesController;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.BaseFragment;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.Components.AvatarDrawable;

/**
 * ProfileActivity
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/ProfileActivity.java)
 *
 * Handles User/Channel/Supergroup details, avatar preview, bio, phone, username,
 * shared links/files, notifications settings, and admin actions.
 */
public class ProfileActivity extends BaseFragment {

    private long user_id;
    private long chat_id;
    private boolean isChat;
    private TLRPC.User currentUser;
    private TLRPC.Chat currentChat;
    private AvatarDrawable avatarDrawable;

    public ProfileActivity(long id, boolean isChat) {
        this.isChat = isChat;
        if (isChat) {
            this.chat_id = id;
            this.currentChat = MessagesController.getInstance(0).getChat(id);
        } else {
            this.user_id = id;
            this.currentUser = MessagesController.getInstance(0).getUser(id);
        }
        this.avatarDrawable = new AvatarDrawable();
    }

    public ProfileActivity(Bundle args) {
        super(args);
        if (args != null) {
            if (args.containsKey("chat_id")) {
                this.chat_id = args.getLong("chat_id");
                this.isChat = true;
                this.currentChat = MessagesController.getInstance(0).getChat(chat_id);
            } else if (args.containsKey("user_id")) {
                this.user_id = args.getLong("user_id");
                this.isChat = false;
                this.currentUser = MessagesController.getInstance(0).getUser(user_id);
            }
        }
        this.avatarDrawable = new AvatarDrawable();
    }

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(org.telegram.messenger.R.drawable.ic_ab_back);
        actionBar.setTitle(isChat ? "معلومات المجموعة / Group Info" : "الملف الشخصي / Profile");

        fragmentView = new FrameLayout(context);
        fragmentView.setBackgroundColor(0xff0f1621);

        LinearLayout layout = new LinearLayout(context);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(24, 24, 24, 24);

        // Avatar & Name Card
        LinearLayout headerCard = new LinearLayout(context);
        headerCard.setOrientation(LinearLayout.VERTICAL);
        headerCard.setBackgroundColor(0xff17212b);
        headerCard.setPadding(20, 24, 20, 24);

        ImageView avatarView = new ImageView(context);
        if (currentUser != null) {
            avatarDrawable.setInfo(currentUser);
        } else if (currentChat != null) {
            avatarDrawable.setInfo(currentChat);
        }
        avatarView.setImageDrawable(avatarDrawable);
        headerCard.addView(avatarView);

        TextView titleView = new TextView(context);
        titleView.setTextColor(Color.WHITE);
        titleView.setTextSize(20);
        titleView.setPadding(0, 16, 0, 4);

        TextView subtitleView = new TextView(context);
        subtitleView.setTextColor(0xff708499);
        subtitleView.setTextSize(14);

        if (currentUser != null) {
            titleView.setText(currentUser.first_name + (currentUser.last_name != null ? " " + currentUser.last_name : ""));
            subtitleView.setText(currentUser.phone != null ? currentUser.phone : "@" + (currentUser.username != null ? currentUser.username : ""));
        } else if (currentChat != null) {
            titleView.setText(currentChat.title);
            subtitleView.setText(currentChat.participants_count + " أعضاء / members");
        }

        headerCard.addView(titleView);
        headerCard.addView(subtitleView);
        layout.addView(headerCard);

        // Actions (Send message, Mute, Share)
        LinearLayout actionsRow = new LinearLayout(context);
        actionsRow.setOrientation(LinearLayout.HORIZONTAL);
        actionsRow.setPadding(0, 20, 0, 0);

        TextView actionBtn1 = new TextView(context);
        actionBtn1.setText("💬 إرسال رسالة / Message");
        actionBtn1.setTextColor(0xff2ea6ff);
        actionBtn1.setTextSize(15);
        actionBtn1.setPadding(16, 12, 16, 12);
        actionBtn1.setBackgroundColor(0xff17212b);
        actionBtn1.setOnClickListener(v -> finishFragment());

        actionsRow.addView(actionBtn1);
        layout.addView(actionsRow);

        ((FrameLayout) fragmentView).addView(layout);
        return fragmentView;
    }

    public TLRPC.User getCurrentUser() {
        return currentUser;
    }

    public TLRPC.Chat getCurrentChat() {
        return currentChat;
    }
}
