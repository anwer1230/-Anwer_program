package org.telegram.ui.ActionBar;

import android.content.Context;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;

/**
 * ActionBar
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/ActionBar/ActionBar.java)
 *
 * Custom header navigation bar handling back button, title, subtitle, search mode,
 * and overflow action menus.
 */
public class ActionBar extends FrameLayout {

    private TextView titleTextView;
    private TextView subtitleTextView;
    private ImageView backButtonImageView;
    private boolean isSearchFieldVisible = false;

    public interface ActionBarMenuOnItemClick {
        void onItemClick(int id);
    }

    private ActionBarMenuOnItemClick actionBarMenuOnItemClick;

    public ActionBar(Context context) {
        super(context);
        init(context);
    }

    private void init(Context context) {
        setBackgroundColor(0xff242f3d);
        titleTextView = new TextView(context);
        titleTextView.setTextColor(0xffffffff);
        titleTextView.setTextSize(18);

        subtitleTextView = new TextView(context);
        subtitleTextView.setTextColor(0xff708499);
        subtitleTextView.setTextSize(13);

        backButtonImageView = new ImageView(context);
        backButtonImageView.setOnClickListener(v -> {
            if (actionBarMenuOnItemClick != null) {
                actionBarMenuOnItemClick.onItemClick(-1);
            }
        });
    }

    public void setTitle(CharSequence title) {
        if (titleTextView != null) {
            titleTextView.setText(title);
        }
    }

    public void setSubtitle(CharSequence subtitle) {
        if (subtitleTextView != null) {
            subtitleTextView.setText(subtitle);
        }
    }

    public void setBackButtonImage(int resId) {
        if (backButtonImageView != null) {
            backButtonImageView.setImageResource(resId);
        }
    }

    public void setActionBarMenuOnItemClick(ActionBarMenuOnItemClick listener) {
        this.actionBarMenuOnItemClick = listener;
    }
}
