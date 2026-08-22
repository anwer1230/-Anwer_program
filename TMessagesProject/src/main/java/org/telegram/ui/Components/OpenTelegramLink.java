package org.telegram.ui.Components;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Toast;
import org.telegram.messenger.LocaleController;
import org.telegram.messenger.MessagesController;
import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.BaseFragment;
import org.telegram.ui.ChatActivity;
import org.telegram.ui.ChatInviteActivity;
import org.telegram.ui.LaunchActivity;
import org.telegram.ui.ProfileActivity;
import org.telegram.ui.SettingsActivity;

/**
 * OpenTelegramLink
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/Components/OpenTelegramLink.java)
 *
 * Universal deep link parser and resolver:
 * - Parses @username, t.me/username, tg://resolve?domain=...
 * - Parses private invite links (t.me/+hash, t.me/joinchat/hash, tg://join?invite=hash)
 * - Queries MTProto via contacts_resolveUsername and messages_checkChatInvite
 * - Routes user seamlessly to ChatActivity, ProfileActivity, ChatInviteActivity, or Settings.
 */
public class OpenTelegramLink {

    public static void openLink(Context context, String link, boolean autoJoin) {
        if (context == null || link == null || link.trim().isEmpty()) return;

        String url = link.trim();
        int currentAccount = 0;

        // 1. Handle @username
        if (url.startsWith("@")) {
            resolveUsername(context, url.substring(1), currentAccount);
            return;
        }

        // 2. Normalize tg:// or https:// schemes
        Uri uri;
        try {
            uri = Uri.parse(url);
        } catch (Exception e) {
            return;
        }

        String scheme = uri.getScheme();
        String host = uri.getHost();
        String path = uri.getPath();

        // 3. Handle tg:// custom schemes
        if ("tg".equalsIgnoreCase(scheme)) {
            String hostOrPath = uri.getHost();
            if ("resolve".equals(hostOrPath)) {
                String domain = uri.getQueryParameter("domain");
                if (domain != null && !domain.isEmpty()) {
                    resolveUsername(context, domain, currentAccount);
                    return;
                }
            } else if ("join".equals(hostOrPath)) {
                String invite = uri.getQueryParameter("invite");
                if (invite != null && !invite.isEmpty()) {
                    checkChatInvite(context, invite, currentAccount, autoJoin);
                    return;
                }
            } else if ("settings".equals(hostOrPath)) {
                LaunchActivity activity = LaunchActivity.instance;
                if (activity != null) {
                    activity.presentFragment(new SettingsActivity());
                }
                return;
            }
        }

        // 4. Handle t.me, telegram.me, telegram.dog domains
        if (host != null && (host.endsWith("t.me") || host.endsWith("telegram.me") || host.endsWith("telegram.dog"))) {
            if (path != null && path.length() > 1) {
                String rawPath = path.substring(1); // remove leading slash

                // 4a. Private invite link (t.me/+hash or t.me/joinchat/hash)
                if (rawPath.startsWith("+")) {
                    String hash = rawPath.substring(1);
                    checkChatInvite(context, hash, currentAccount, autoJoin);
                    return;
                } else if (rawPath.startsWith("joinchat/")) {
                    String hash = rawPath.substring(9);
                    checkChatInvite(context, hash, currentAccount, autoJoin);
                    return;
                }

                // 4b. Channel message link (t.me/c/chat_id/msg_id)
                if (rawPath.startsWith("c/")) {
                    String[] parts = rawPath.substring(2).split("/");
                    if (parts.length >= 1) {
                        try {
                            long chatId = Long.parseLong(parts[0]);
                            Bundle args = new Bundle();
                            args.putLong("chat_id", chatId);
                            LaunchActivity activity = LaunchActivity.instance;
                            if (activity != null) {
                                activity.presentFragment(new ChatActivity(args));
                            }
                            return;
                        } catch (Exception ignored) {}
                    }
                }

                // 4c. Username or bot link (t.me/username)
                String username = rawPath;
                if (username.contains("/")) {
                    username = username.substring(0, username.indexOf("/"));
                }
                if (username.contains("?")) {
                    username = username.substring(0, username.indexOf("?"));
                }
                resolveUsername(context, username, currentAccount);
                return;
            }
        }
    }

    /**
     * Resolve username via TLRPC.TL_contacts_resolveUsername
     */
    public static void resolveUsername(Context context, String username, int currentAccount) {
        if (username == null || username.isEmpty()) return;

        MessagesController.getInstance(currentAccount).resolveUsername(username, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                if (error == null && response instanceof TLRPC.TL_contacts_resolvedPeer) {
                    TLRPC.TL_contacts_resolvedPeer resolved = (TLRPC.TL_contacts_resolvedPeer) response;
                    
                    LaunchActivity activity = LaunchActivity.instance;
                    if (activity == null) return;

                    if (!resolved.chats.isEmpty()) {
                        TLRPC.Chat chat = resolved.chats.get(0);
                        Bundle args = new Bundle();
                        args.putLong("chat_id", chat.id);
                        activity.presentFragment(new ChatActivity(args));
                    } else if (!resolved.users.isEmpty()) {
                        TLRPC.User user = resolved.users.get(0);
                        Bundle args = new Bundle();
                        args.putLong("user_id", user.id);
                        activity.presentFragment(new ChatActivity(args));
                    }
                } else {
                    try {
                        Toast.makeText(context, LocaleController.getString("UsernameNotFound"), Toast.LENGTH_SHORT).show();
                    } catch (Exception ignored) {}
                }
            }
        });
    }

    /**
     * Check chat invite link via TLRPC.TL_messages_checkChatInvite
     */
    public static void checkChatInvite(Context context, String hash, int currentAccount, boolean autoJoin) {
        if (hash == null || hash.isEmpty()) return;

        MessagesController.getInstance(currentAccount).checkChatInvite(hash, new ConnectionsManager.RequestDelegate() {
            @Override
            public void run(TLRPC.TLObject response, TLRPC.TL_error error) {
                LaunchActivity activity = LaunchActivity.instance;
                if (activity == null) return;

                if (error == null && response instanceof TLRPC.TL_chatInviteAlready) {
                    TLRPC.TL_chatInviteAlready already = (TLRPC.TL_chatInviteAlready) response;
                    if (already.chat != null) {
                        Bundle args = new Bundle();
                        args.putLong("chat_id", already.chat.id);
                        activity.presentFragment(new ChatActivity(args));
                    }
                } else if (error == null && response instanceof TLRPC.ChatInvite) {
                    TLRPC.ChatInvite invite = (TLRPC.ChatInvite) response;
                    if (autoJoin && !invite.is_request_needed) {
                        MessagesController.getInstance(currentAccount).importChatInvite(hash);
                    } else {
                        activity.presentFragment(new ChatInviteActivity(hash, invite));
                    }
                } else {
                    try {
                        Toast.makeText(context, LocaleController.getString("InviteExpired"), Toast.LENGTH_SHORT).show();
                    } catch (Exception ignored) {}
                }
            }
        });
    }
}
