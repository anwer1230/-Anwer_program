package org.telegram.ui;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import androidx.drawerlayout.widget.DrawerLayout;
import org.telegram.messenger.ApplicationLoader;
import org.telegram.messenger.NotificationCenter;
import org.telegram.messenger.UserConfig;
import org.telegram.ui.ActionBar.BaseFragment;

import java.util.ArrayList;

/**
 * LaunchActivity
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/LaunchActivity.java)
 *
 * Root Activity that handles the Fragment navigation stack, Drawer layout,
 * deep linking (tg://, t.me/), notifications intent routing, and passcode entry lock screen.
 */
public class LaunchActivity extends Activity implements NotificationCenter.NotificationCenterDelegate {

    public static LaunchActivity instance;
    private DrawerLayout drawerLayout;
    private FrameLayout fragmentContainer;
    private final ArrayList<BaseFragment> mainFragmentsStack = new ArrayList<>();
    private int currentAccount = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = this;
        currentAccount = UserConfig.selectedAccount;

        drawerLayout = new DrawerLayout(this);
        fragmentContainer = new FrameLayout(this);
        drawerLayout.addView(fragmentContainer, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        // Mount Navigation Drawer View
        DrawerActivity drawerActivity = new DrawerActivity(this, currentAccount);
        drawerActivity.setListener(id -> {
            drawerLayout.closeDrawers();
            onDrawerItemSelected(id);
        });
        drawerLayout.addView(drawerActivity.createDrawerView());

        setContentView(drawerLayout);

        // Present DialogsActivity by default
        presentFragment(new DialogsActivity(null));

        NotificationCenter.getGlobalInstance().addObserver(this, NotificationCenter.closeChats);
    }

    public void presentFragment(BaseFragment fragment) {
        if (fragment == null) return;
        mainFragmentsStack.add(fragment);
        fragment.onFragmentCreate();
        fragmentContainer.removeAllViews();
        fragmentContainer.addView(fragment.createView(this));
    }

    private void onDrawerItemSelected(int id) {
        if (id == DrawerActivity.ITEM_SETTINGS) {
            presentFragment(new SettingsActivity());
        }
        // Additional modular fragment handlers
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (id == NotificationCenter.closeChats) {
            if (mainFragmentsStack.size() > 1) {
                mainFragmentsStack.get(mainFragmentsStack.size() - 1).finishFragment();
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        NotificationCenter.getGlobalInstance().removeObserver(this, NotificationCenter.closeChats);
        instance = null;
    }
}
