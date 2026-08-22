package org.telegram.ui;

import android.content.Context;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.ImageView;
import org.telegram.messenger.MessagesController;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.BaseFragment;
import org.telegram.ui.Components.AvatarDrawable;

/**
 * DrawerActivity / DrawerLayoutView
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/DrawerActivity.java)
 *
 * Left-side navigation drawer housing user profile avatar, account switcher,
 * cloud storage, settings, and custom quick-action tools.
 */
public class DrawerActivity {

    public interface DrawerListener {
        void onItemSelected(int id);
    }

    public static final int ITEM_MY_STORIES = 1;
    public static final int ITEM_NEW_GROUP = 2;
    public static final int ITEM_CONTACTS = 3;
    public static final int ITEM_CALLS = 4;
    public static final int ITEM_SAVED_MESSAGES = 5;
    public static final int ITEM_SETTINGS = 6;
    public static final int ITEM_AUTOMATION_SUITE = 101;
    public static final int ITEM_SUPERGROUP_MANAGER = 102;
    public static final int ITEM_SPAM_REPORT = 103;

    private final Context context;
    private final int currentAccount;
    private DrawerListener listener;
    private AvatarDrawable avatarDrawable;

    public DrawerActivity(Context context, int account) {
        this.context = context;
        this.currentAccount = account;
        this.avatarDrawable = new AvatarDrawable();
    }

    public void setListener(DrawerListener listener) {
        this.listener = listener;
    }

    public View createDrawerView() {
        LinearLayout container = new LinearLayout(context);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setBackgroundColor(0xff17212b);

        // Header: Profile Avatar & User Info
        FrameLayout header = new FrameLayout(context);
        header.setBackgroundColor(0xff242f3d);
        header.setPadding(24, 48, 24, 24);

        TLRPC.User selfUser = MessagesController.getInstance(currentAccount).getUser(1L);
        if (selfUser != null) {
            avatarDrawable.setInfo(selfUser);
        }

        container.addView(header);

        // Menu Items List
        addDrawerItem(container, ITEM_SAVED_MESSAGES, "الرسائل المحفوظة / Saved Messages", org.telegram.messenger.R.drawable.msg_saved);
        addDrawerItem(container, ITEM_NEW_GROUP, "مجموعة جديدة / New Group", org.telegram.messenger.R.drawable.msg_groups);
        addDrawerItem(container, ITEM_CONTACTS, "جهات الاتصال / Contacts", org.telegram.messenger.R.drawable.msg_contacts);
        addDrawerItem(container, ITEM_CALLS, "المكالمات / Calls", org.telegram.messenger.R.drawable.msg_calls);

        // Custom Automation & Nine Super Tools Section
        addDrawerItem(container, ITEM_AUTOMATION_SUITE, "⚡ جناح الأتمتة والأدوات الـ 9 / 9 Automation Tools", org.telegram.messenger.R.drawable.msg_bot);
        addDrawerItem(container, ITEM_SUPERGROUP_MANAGER, "🛡️ إدارة المجموعات الكبرى / Supergroups", org.telegram.messenger.R.drawable.msg_admin);
        addDrawerItem(container, ITEM_SPAM_REPORT, "🚫 الإبلاغ ومكافحة الإزعاج / Anti-Spam Shield", org.telegram.messenger.R.drawable.msg_report);

        addDrawerItem(container, ITEM_SETTINGS, "الإعدادات / Settings", org.telegram.messenger.R.drawable.msg_settings);

        return container;
    }

    private void addDrawerItem(LinearLayout parent, final int id, String text, int iconRes) {
        LinearLayout row = new LinearLayout(context);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setPadding(24, 20, 24, 20);
        row.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemSelected(id);
            }
        });

        TextView label = new TextView(context);
        label.setText(text);
        label.setTextColor(0xffffffff);
        label.setTextSize(15);

        row.addView(label);
        parent.addView(row);
    }
}
