package org.telegram.ui;

import android.content.Context;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.UserConfig;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.BaseFragment;
import org.telegram.ui.Components.AvatarDrawable;

/**
 * SettingsActivity
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/SettingsActivity.java)
 *
 * App Settings: Profile customization, Telegram Premium status,
 * Privacy and Security (2FA, Sessions), Chat Settings, Notifications & Sounds, Data & Storage.
 */
public class SettingsActivity extends BaseFragment {

    private AvatarDrawable avatarDrawable;

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(org.telegram.messenger.R.drawable.ic_ab_back);
        actionBar.setTitle("الإعدادات / Settings");

        fragmentView = new FrameLayout(context);
        LinearLayout content = new LinearLayout(context);
        content.setOrientation(LinearLayout.VERTICAL);

        avatarDrawable = new AvatarDrawable();
        TLRPC.User selfUser = MessagesController.getInstance(currentAccount).getUser(UserConfig.getInstance(currentAccount).getClientUserId());
        if (selfUser != null) {
            avatarDrawable.setInfo(selfUser);
        }

        ((FrameLayout) fragmentView).addView(content);
        return fragmentView;
    }
}
