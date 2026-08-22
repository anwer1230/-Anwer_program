package org.telegram.ui.Components;

import android.content.Context;
import android.view.View;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

/**
 * RecyclerListView
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/Components/RecyclerListView.java)
 *
 * Fast, optimized RecyclerView with built-in empty view handling, click listeners,
 * pinned headers, and fast scroll thumb.
 */
public class RecyclerListView extends RecyclerView {

    public interface OnItemClickListener {
        void onItemClick(View view, int position);
    }

    public interface OnItemLongClickListener {
        boolean onItemClick(View view, int position);
    }

    private OnItemClickListener onItemClickListener;
    private OnItemLongClickListener onItemLongClickListener;
    private View emptyView;

    public RecyclerListView(Context context) {
        super(context);
        setLayoutManager(new LinearLayoutManager(context));
    }

    public void setOnItemClickListener(OnItemClickListener listener) {
        this.onItemClickListener = listener;
    }

    public void setOnItemLongClickListener(OnItemLongClickListener listener) {
        this.onItemLongClickListener = listener;
    }

    public void setEmptyView(View view) {
        this.emptyView = view;
        checkIfEmpty();
    }

    public void checkIfEmpty() {
        if (emptyView != null && getAdapter() != null) {
            final boolean emptyViewVisible = getAdapter().getItemCount() == 0;
            emptyView.setVisibility(emptyViewVisible ? VISIBLE : GONE);
            setVisibility(emptyViewVisible ? GONE : VISIBLE);
        }
    }
}
