package org.telegram.ui.ActionBar;

import android.content.Context;
import android.os.Bundle;
import android.view.View;

/**
 * BaseFragment
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/ActionBar/BaseFragment.java)
 *
 * Base class for all Telegram fragments/screens (DialogsActivity, ChatActivity, ProfileActivity, etc.)
 */
public class BaseFragment {

    public View fragmentView;
    public ActionBar actionBar;
    public int currentAccount = 0;
    protected Bundle arguments;
    private boolean isFinished = false;

    public BaseFragment() {
    }

    public BaseFragment(Bundle args) {
        this.arguments = args;
    }

    public boolean onFragmentCreate() {
        return true;
    }

    public void onFragmentDestroy() {
        isFinished = true;
    }

    public View createView(Context context) {
        return null;
    }

    public void finishFragment() {
        onFragmentDestroy();
    }

    public boolean isFinished() {
        return isFinished;
    }
}
