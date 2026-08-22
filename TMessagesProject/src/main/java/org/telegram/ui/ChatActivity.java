package org.telegram.ui;

import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.Toast;
import org.telegram.messenger.NotificationCenter;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.LocaleController;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.Adapters.MessagesAdapter;
import org.telegram.ui.ActionBar.BaseFragment;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.Components.ChatActivityEnterView;
import org.telegram.ui.Components.RecyclerListView;

import java.util.ArrayList;

/**
 * ChatActivity
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/ChatActivity.java)
 *
 * Primary conversation view: handles RecyclerView message stream, TDLib event updates,
 * real-time notification sync, message composer, avatar navigation, network RPC calls,
 * and permission / restriction state evaluation (canWriteToChat, CHAT_WRITE_FORBIDDEN banner,
 * USER_BANNED_IN_CHANNEL dialogs, FLOOD_WAIT).
 */
public class ChatActivity extends BaseFragment implements NotificationCenter.NotificationCenterDelegate, MessagesAdapter.MessagesAdapterDelegate {

    private long dialog_id;
    private int currentAccount = 0;
    private TLRPC.Chat currentChat;
    private TLRPC.User currentUser;
    private RecyclerListView chatListView;
    private MessagesAdapter messagesAdapter;
    private ChatActivityEnterView enterView;
    private ArrayList<TLRPC.Message> messages = new ArrayList<>();
    private long replyingMessageId = 0;

    public ChatActivity(Bundle args) {
        super(args);
        if (args != null) {
            if (args.containsKey("chat_id")) {
                this.dialog_id = -args.getLong("chat_id");
            } else if (args.containsKey("user_id")) {
                this.dialog_id = args.getLong("user_id");
            }
        }
    }

    public ChatActivity(long dialogId) {
        this.dialog_id = dialogId;
    }

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        if (dialog_id < 0) {
            currentChat = MessagesController.getInstance(currentAccount).getChat(-dialog_id);
        } else {
            currentUser = MessagesController.getInstance(currentAccount).getUser(dialog_id);
        }

        // Register TDLib and MTProto event listeners
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.messagesDidLoad);
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.didReceivedNewMessages);
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.messagesDeleted);
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.updateInterfaces);
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.messageReceivedByServer);
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.messageSendError);

        // Load messages directly from TDLib / MessagesController
        loadMessages();

        // Suppress notifications for active dialog and dismiss status bar notification
        org.telegram.messenger.NotificationsController.getInstance(currentAccount).setOpenedDialogId(dialog_id);
        return true;
    }

    @Override
    public void onResume() {
        super.onResume();
        org.telegram.messenger.NotificationsController.getInstance(currentAccount).setOpenedDialogId(dialog_id);
    }

    @Override
    public void onPause() {
        super.onPause();
        org.telegram.messenger.NotificationsController.getInstance(currentAccount).setOpenedDialogId(0);
    }

    @Override
    public void onFragmentDestroy() {
        super.onFragmentDestroy();
        org.telegram.messenger.NotificationsController.getInstance(currentAccount).setOpenedDialogId(0);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.messagesDidLoad);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.didReceivedNewMessages);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.messagesDeleted);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.updateInterfaces);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.messageReceivedByServer);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.messageSendError);
    }

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(org.telegram.messenger.R.drawable.ic_ab_back);
        updateActionBarTitle();

        // Tap on Action Bar to open ProfileActivity
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) {
                    finishFragment();
                } else if (id == 0) {
                    openProfile();
                }
            }
        });

        fragmentView = new FrameLayout(context);
        FrameLayout frameLayout = (FrameLayout) fragmentView;

        chatListView = new RecyclerListView(context);
        messagesAdapter = new MessagesAdapter(context, dialog_id, messages);
        messagesAdapter.setDelegate(this);
        chatListView.setAdapter(messagesAdapter);

        enterView = new ChatActivityEnterView(context);
        enterView.setDelegate(new ChatActivityEnterView.ChatActivityEnterViewDelegate() {
            @Override
            public void onMessageSend(String text, long replyToId) {
                long replyTarget = replyToId != 0 ? replyToId : replyingMessageId;
                sendMessage(text, replyTarget);
                replyingMessageId = 0;
            }
        });

        frameLayout.addView(chatListView);
        frameLayout.addView(enterView);

        // Check chat permissions and update bottom bar layout
        updateChatRestrictions();

        // Initial scroll to bottom if messages exist
        if (messages.size() > 0) {
            chatListView.scrollToPosition(messages.size() - 1);
        }

        return fragmentView;
    }

    /**
     * Check if user can write to chat and update bottom composer/banner state
     */
    public void updateChatRestrictions() {
        if (enterView == null) return;

        if (dialog_id < 0) {
            currentChat = MessagesController.getInstance(currentAccount).getChat(-dialog_id);
            if (currentChat != null) {
                if (currentChat.kicked || currentChat instanceof TLRPC.TL_chatForbidden || currentChat instanceof TLRPC.TL_channelForbidden) {
                    enterView.setForbidden(true, LocaleController.getString("YouWereBanned"));
                    return;
                }
                if (currentChat.left) {
                    enterView.setForbidden(true, LocaleController.getString("YouLeftGroup"));
                    return;
                }
                if (currentChat.is_channel && !currentChat.is_supergroup && !currentChat.creator) {
                    if (currentChat.admin_rights == null || !currentChat.admin_rights.post_messages) {
                        enterView.setForbidden(true, LocaleController.getString("ChannelCantWrite"));
                        return;
                    }
                }
                if (!MessagesController.getInstance(currentAccount).canWriteToChat(currentChat)) {
                    enterView.setForbidden(true, LocaleController.getString("ChatWriteForbidden"));
                    return;
                }
            }
        }
        enterView.setForbidden(false, null);
    }

    private void updateActionBarTitle() {
        if (actionBar == null) return;
        if (currentChat != null) {
            actionBar.setTitle(currentChat.title);
            actionBar.setSubtitle(currentChat.participants_count > 0 ? currentChat.participants_count + " members" : "group");
        } else if (currentUser != null) {
            String fullName = (currentUser.first_name != null ? currentUser.first_name : "") + 
                              (currentUser.last_name != null ? " " + currentUser.last_name : "");
            actionBar.setTitle(fullName);
            actionBar.setSubtitle(currentUser.status instanceof TLRPC.UserStatusOnline ? "online" : "last seen recently");
        } else {
            actionBar.setTitle("Chat");
            actionBar.setSubtitle("");
        }
    }

    public void openProfile() {
        if (parentLayout != null) {
            ProfileActivity profileActivity = new ProfileActivity(dialog_id < 0 ? -dialog_id : dialog_id, dialog_id < 0);
            parentLayout.presentFragment(profileActivity);
        }
    }

    @Override
    public void didPressAvatar(long userId, long chatId) {
        if (parentLayout != null) {
            if (userId != 0) {
                parentLayout.presentFragment(new ProfileActivity(userId, false));
            } else if (chatId != 0) {
                parentLayout.presentFragment(new ProfileActivity(chatId, true));
            }
        }
    }

    @Override
    public void didPressReply(int replyMessageId) {
        if (chatListView != null && messagesAdapter != null) {
            for (int i = 0; i < messagesAdapter.getItemCount(); i++) {
                TLRPC.Message msg = messagesAdapter.getItem(i);
                if (msg != null && msg.id == replyMessageId) {
                    chatListView.smoothScrollToPosition(i);
                    break;
                }
            }
        }
    }

    @Override
    public void didLongPressMessage(TLRPC.Message message) {
        if (message != null) {
            this.replyingMessageId = message.id;
            if (enterView != null) {
                enterView.openKeyboard();
            }
        }
    }

    @Override
    public void didPressUrl(String url) {
        if (getParentActivity() != null && url != null) {
            Browser.openUrl(getParentActivity(), url);
        }
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (id == NotificationCenter.messagesDidLoad) {
            if (args != null && args.length >= 2) {
                long receivedDialogId = (long) args[0];
                if (receivedDialogId == dialog_id) {
                    @SuppressWarnings("unchecked")
                    ArrayList<TLRPC.Message> loaded = (ArrayList<TLRPC.Message>) args[1];
                    if (loaded != null) {
                        this.messages = loaded;
                        if (messagesAdapter != null) {
                            messagesAdapter.setMessages(loaded);
                            if (chatListView != null && loaded.size() > 0) {
                                chatListView.scrollToPosition(loaded.size() - 1);
                            }
                        }
                    }
                    updateChatRestrictions();
                }
            }
        } else if (id == NotificationCenter.didReceivedNewMessages) {
            if (args != null && args.length >= 2) {
                long receivedDialogId = (long) args[0];
                if (receivedDialogId == dialog_id) {
                    if (args[1] instanceof TLRPC.Message) {
                        TLRPC.Message newMsg = (TLRPC.Message) args[1];
                        if (messagesAdapter != null) {
                            messagesAdapter.addMessage(newMsg);
                            if (chatListView != null) {
                                chatListView.smoothScrollToPosition(messagesAdapter.getItemCount() - 1);
                            }
                        }
                    } else {
                        loadMessages();
                    }
                }
            }
        } else if (id == NotificationCenter.messagesDeleted) {
            if (args != null && args.length > 0 && args[0] instanceof ArrayList) {
                @SuppressWarnings("unchecked")
                ArrayList<Integer> deletedIds = (ArrayList<Integer>) args[0];
                if (messagesAdapter != null) {
                    messagesAdapter.deleteMessages(deletedIds);
                }
            }
        } else if (id == NotificationCenter.messageReceivedByServer) {
            if (args != null && args.length > 0 && args[0] instanceof Integer) {
                int msgId = (int) args[0];
                if (messagesAdapter != null) {
                    messagesAdapter.updateMessageStatus(msgId, false);
                }
            }
        } else if (id == NotificationCenter.messageSendError) {
            if (args != null && args.length >= 3) {
                String errorReason = (String) args[2];
                if ("CHAT_WRITE_FORBIDDEN".equals(errorReason) || "USER_BANNED_IN_CHANNEL".equals(errorReason)) {
                    updateChatRestrictions();
                }
            }
        } else if (id == NotificationCenter.updateInterfaces) {
            updateActionBarTitle();
            updateChatRestrictions();
            if (messagesAdapter != null) {
                messagesAdapter.notifyDataSetChanged();
            }
        }
    }

    public void loadMessages() {
        // Load chat history through MessagesController (caches first, then fetches via TDLib / MTProto)
        MessagesController.getInstance(currentAccount).loadHistory(dialog_id, 50, 0, true);
    }

    public void sendMessage(String text, long replyToId) {
        if (text == null || text.trim().isEmpty()) return;

        TLRPC.InputPeer peer = MessagesController.getInstance(currentAccount).getInputPeer(dialog_id);
        MessagesController.getInstance(currentAccount).sendMessage(peer, text, replyToId, dialog_id);
    }

    public void reportSpam(int messageId, String reason) {
        MessagesController.getInstance(currentAccount).reportSpam(dialog_id, messageId, reason);
    }
}
