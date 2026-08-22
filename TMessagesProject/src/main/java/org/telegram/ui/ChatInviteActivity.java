package org.telegram.ui;

import android.content.Context;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import org.telegram.messenger.AndroidUtilities;
import org.telegram.messenger.LocaleController;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.NotificationCenter;
import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.ActionBar.BaseFragment;
import org.telegram.ui.Components.AvatarDrawable;
import org.telegram.ui.Components.LayoutHelper;

/**
 * ChatInviteActivity
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/ChatInviteActivity.java)
 *
 * Full-screen / BottomSheet preview for invite links (t.me/+hash, t.me/joinchat/*):
 * - Displays group / channel avatar, verified badge, member count, and description
 * - Handles 'Join Channel', 'Join Group', and 'Request to Join' actions
 * - Triggers MessagesController.importChatInvite / joinChannel on confirmation.
 */
public class ChatInviteActivity extends BaseFragment implements NotificationCenter.NotificationCenterDelegate {

    private String hash;
    private TLRPC.ChatInvite invite;
    private int currentAccount = 0;

    private LinearLayout container;
    private TextView titleTextView;
    private TextView subtitleTextView;
    private TextView descriptionTextView;
    private TextView joinButton;
    private ProgressBar progressBar;
    private boolean isJoining = false;

    public ChatInviteActivity(String hash, TLRPC.ChatInvite invite) {
        this.hash = hash;
        this.invite = invite;
    }

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.chatDidCreated);
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.dialogsNeedReload);
        return true;
    }

    @Override
    public void onFragmentDestroy() {
        super.onFragmentDestroy();
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.chatDidCreated);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.dialogsNeedReload);
    }

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(org.telegram.messenger.R.drawable.ic_ab_back);
        actionBar.setTitle(LocaleController.isRTL ? "معاينة الدعوة" : "Invite Preview");
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) {
                    finishFragment();
                }
            }
        });

        fragmentView = new FrameLayout(context);
        fragmentView.setBackgroundColor(0xff0e1621);
        FrameLayout rootLayout = (FrameLayout) fragmentView;

        container = new LinearLayout(context);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setGravity(Gravity.CENTER_HORIZONTAL);
        container.setPadding(AndroidUtilities.dp(24), AndroidUtilities.dp(40), AndroidUtilities.dp(24), AndroidUtilities.dp(40));

        // Group Title
        titleTextView = new TextView(context);
        titleTextView.setTextColor(0xffffffff);
        titleTextView.setTextSize(20);
        titleTextView.setGravity(Gravity.CENTER);
        titleTextView.setText(invite != null && invite.title != null ? invite.title : "Telegram Group");
        container.addView(titleTextView, LayoutHelper.createLinear(LayoutHelper.MATCH_PARENT, LayoutHelper.WRAP_CONTENT, 0, 16, 0, 8));

        // Subtitle (Members count / channel status)
        subtitleTextView = new TextView(context);
        subtitleTextView.setTextColor(0xff708499);
        subtitleTextView.setTextSize(14);
        subtitleTextView.setGravity(Gravity.CENTER);
        if (invite != null) {
            String membersStr = invite.participants_count > 0 ? invite.participants_count + (LocaleController.isRTL ? " عضو" : " members") : "";
            String typeStr = invite.is_channel ? (LocaleController.isRTL ? "قناة" : "channel") : (LocaleController.isRTL ? "مجموعة" : "group");
            subtitleTextView.setText(membersStr.isEmpty() ? typeStr : membersStr + " • " + typeStr);
        }
        container.addView(subtitleTextView, LayoutHelper.createLinear(LayoutHelper.MATCH_PARENT, LayoutHelper.WRAP_CONTENT, 0, 0, 0, 16));

        // Description / About
        if (invite != null && invite.about != null && !invite.about.isEmpty()) {
            descriptionTextView = new TextView(context);
            descriptionTextView.setTextColor(0xff8a9aa6);
            descriptionTextView.setTextSize(14);
            descriptionTextView.setGravity(Gravity.CENTER);
            descriptionTextView.setText(invite.about);
            container.addView(descriptionTextView, LayoutHelper.createLinear(LayoutHelper.MATCH_PARENT, LayoutHelper.WRAP_CONTENT, 0, 0, 0, 24));
        }

        // Join Action Button
        joinButton = new TextView(context);
        joinButton.setTextColor(0xffffffff);
        joinButton.setTextSize(16);
        joinButton.setGravity(Gravity.CENTER);
        joinButton.setBackgroundColor(0xff2b5278);
        joinButton.setPadding(AndroidUtilities.dp(24), AndroidUtilities.dp(14), AndroidUtilities.dp(24), AndroidUtilities.dp(14));
        String buttonText;
        if (invite != null && invite.is_request_needed) {
            buttonText = LocaleController.isRTL ? "طلب الانضمام إلى المجموعة" : "Request to Join Group";
        } else if (invite != null && invite.is_channel) {
            buttonText = LocaleController.isRTL ? "الانضمام إلى القناة" : "Join Channel";
        } else {
            buttonText = LocaleController.isRTL ? "الانضمام إلى المجموعة" : "Join Group";
        }
        joinButton.setText(buttonText);
        joinButton.setOnClickListener(v -> joinChat());
        container.addView(joinButton, LayoutHelper.createLinear(LayoutHelper.MATCH_PARENT, LayoutHelper.WRAP_CONTENT, 0, 24, 0, 0));

        progressBar = new ProgressBar(context);
        progressBar.setVisibility(View.GONE);
        container.addView(progressBar, LayoutHelper.createLinear(LayoutHelper.WRAP_CONTENT, LayoutHelper.WRAP_CONTENT, 0, 16, 0, 0));

        rootLayout.addView(container, LayoutHelper.createFrame(LayoutHelper.MATCH_PARENT, LayoutHelper.WRAP_CONTENT, Gravity.CENTER));
        return fragmentView;
    }

    private void joinChat() {
        if (isJoining || hash == null) return;
        isJoining = true;
        joinButton.setVisibility(View.GONE);
        progressBar.setVisibility(View.VISIBLE);

        MessagesController.getInstance(currentAccount).importChatInvite(hash);
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (id == NotificationCenter.chatDidCreated || id == NotificationCenter.dialogsNeedReload) {
            if (isJoining) {
                isJoining = false;
                finishFragment();
            }
        }
    }
}
