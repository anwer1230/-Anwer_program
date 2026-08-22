/**
 * MessagesController (TypeScript Port of Telegram Android's MessagesController.java)
 *
 * Coordinates business logic for dialogs, messages, permissions,
 * Supergroup administration, spam reporting, and local/cloud synchronization.
 */

import { ConnectionsManager } from './ConnectionsManager';
import { TLRPC, TLObject } from './TLRPC';
import { MessagesStorage } from './MessagesStorage';

export interface TelegramDialog {
  id: string | number;
  title: string;
  name?: string;
  unread_count: number;
  last_message?: any;
  pinned?: boolean;
  type?: 'user' | 'group' | 'supergroup' | 'channel' | 'bot';
  is_channel?: boolean;
  is_supergroup?: boolean;
}

export class MessagesController {
  private static instances: Map<number, MessagesController> = new Map();
  public account: number = 0;
  public dialogs: TelegramDialog[] = [];
  public users: Map<string | number, any> = new Map();
  public chats: Map<string | number, any> = new Map();

  constructor(account: number = 0) {
    this.account = account;
  }

  public static getInstance(account: number = 0): MessagesController {
    if (!this.instances.has(account)) {
      this.instances.set(account, new MessagesController(account));
    }
    return this.instances.get(account)!;
  }

  /**
   * Sends a message through MTProto / ConnectionsManager
   */
  public async sendMessage(
    peerId: string | number,
    text: string,
    replyToMsgId?: number
  ): Promise<any> {
    const connections = ConnectionsManager.getInstance();
    const req = new TLRPC.TL_messages_sendMessage();
    req.message = text;
    req.random_id = BigInt(Date.now());
    if (replyToMsgId) {
      req.reply_to_msg_id = replyToMsgId;
    }

    return new Promise((resolve, reject) => {
      connections.sendRequest(req, (res, err) => {
        if (err) {
          reject(err);
        } else {
          MessagesStorage.getInstance(this.account).putMessage(peerId, {
            id: Date.now(),
            text,
            is_outgoing: true,
            date: Date.now(),
          });
          resolve(res);
        }
      });
    });
  }

  /**
   * Reports spam and clears local dialog history
   */
  public async reportSpam(
    chatId: string | number,
    messageId?: number,
    reason: string = 'spam',
    deleteHistory: boolean = true
  ): Promise<any> {
    const connections = ConnectionsManager.getInstance();
    const req = new TLRPC.TL_messages_reportSpam();
    req.reason = reason;

    if (deleteHistory) {
      MessagesStorage.getInstance(this.account).deleteDialog(chatId);
      this.dialogs = this.dialogs.filter((d) => String(d.id) !== String(chatId));
    }

    return new Promise((resolve) => {
      connections.sendRequest(req, (res) => {
        resolve(res);
      });
    });
  }

  /**
   * Updates Supergroup permissions (TL_channels_editBanned)
   */
  public async editSupergroupPermissions(
    chatId: string | number,
    bannedRights: any,
    slowModeSeconds: number = 0
  ): Promise<boolean> {
    try {
      await fetch('/api/telegram/supergroup/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          permissions: bannedRights,
          slow_mode_seconds: slowModeSeconds,
        }),
      });
      return true;
    } catch (e) {
      console.error('Failed to edit supergroup permissions:', e);
      return false;
    }
  }

  /**
   * Deletes messages locally and remotely
   */
  public async deleteMessages(
    chatId: string | number,
    messageIds: number[],
    revoke: boolean = true
  ): Promise<any> {
    const connections = ConnectionsManager.getInstance();
    const req = new TLRPC.TL_messages_deleteMessages();
    req.id = messageIds;
    req.revoke = revoke;

    MessagesStorage.getInstance(this.account).deleteMessages(chatId, messageIds);

    return new Promise((resolve) => {
      connections.sendRequest(req, (res) => resolve(res));
    });
  }
}
