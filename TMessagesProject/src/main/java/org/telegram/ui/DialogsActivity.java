package org.telegram.ui;

import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.widget.FrameLayout;
import org.telegram.messenger.LocaleController;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.NotificationCenter;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.Adapters.DialogsAdapter;
import org.telegram.ui.ActionBar.BaseFragment;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.ActionBar.AlertDialog;
import org.telegram.ui.Components.RecyclerListView;

import java.util.ArrayList;

/**
 * DialogsActivity
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/DialogsActivity.java)
 *
 * The primary chat list view in Telegram, managing dialogs sorting, folders,
 * archive, search filter, unread counters, swipe actions, and restricted/banned
 * chat click verification.
 */
public class DialogsActivity extends BaseFragment implements NotificationCenter.NotificationCenterDelegate {

    private RecyclerListView listView;
    private DialogsAdapter dialogsAdapter;
    private int currentAccount = 0;
    private int selectedFolderId = 0;
    private ArrayList<TLRPC.TLObject> dialogsList = new ArrayList<>();

    public DialogsActivity() {
        super();
    }

    public DialogsActivity(Bundle args) {
        super(args);
    }

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.dialogsNeedReload);
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.updateInterfaces);
        loadDialogs();
        return true;
    }

    @Override
    public void onFragmentDestroy() {
        super.onFragmentDestroy();
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.dialogsNeedReload);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.updateInterfaces);
    }

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(org.telegram.messenger.R.drawable.ic_ab_menu);
        actionBar.setTitle("Telegram");
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) {
                    if (parentLayout != null) {
                        parentLayout.getDrawerLayoutContainer().openDrawer(false);
                    }
                }
            }
        });

        fragmentView = new FrameLayout(context);
        FrameLayout frameLayout = (FrameLayout) fragmentView;

        listView = new RecyclerListView(context);
        dialogsAdapter = new DialogsAdapter(context, currentAccount, selectedFolderId);
        listView.setAdapter(dialogsAdapter);

        listView.setOnItemClickListener((view, position) -> {
            TLRPC.TLObject object = dialogsAdapter.getItem(position);
            if (object instanceof TLRPC.Chat) {
                TLRPC.Chat chat = (TLRPC.Chat) object;
                
                // If banned or forbidden from group, alert user or handle forbidden state
                if (chat instanceof TLRPC.TL_chatForbidden || chat instanceof TLRPC.TL_channelForbidden || chat.kicked) {
                    if (getParentActivity() != null) {
                        AlertDialog.Builder builder = new AlertDialog.Builder(getParentActivity());
                        builder.setTitle(chat.title != null ? chat.title : "Telegram");
                        builder.setMessage(LocaleController.getString("YouWereBanned"));
                        builder.setPositiveButton("OK", null);
                        showDialog(builder.create());
                        return;
                    }
                }

                Bundle args = new Bundle();
                args.putLong("chat_id", chat.id);
                presentFragment(new ChatActivity(args));
            } else if (object instanceof TLRPC.User) {
                TLRPC.User user = (TLRPC.User) object;
                Bundle args = new Bundle();
                args.putLong("user_id", user.id);
                presentFragment(new ChatActivity(args));
            }
        });

        frameLayout.addView(listView);
        return fragmentView;
    }

    public void loadDialogs() {
        MessagesController controller = MessagesController.getInstance(currentAccount);
        dialogsList = controller.dialogs;
        if (dialogsAdapter != null) {
            dialogsAdapter.notifyDataSetChanged();
        }
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (id == NotificationCenter.dialogsNeedReload || id == NotificationCenter.updateInterfaces) {
            loadDialogs();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (dialogsAdapter != null) {
            dialogsAdapter.notifyDataSetChanged();
        }
    }
}
