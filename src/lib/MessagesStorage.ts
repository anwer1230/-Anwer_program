/**
 * MessagesStorage (TypeScript Port of Telegram Android's MessagesStorage.java)
 *
 * Local caching and persistence engine simulating SQLite database tables:
 * - dialogs
 * - messages
 * - users
 * - chats
 * - media
 */

export class MessagesStorage {
  private static instances: Map<number, MessagesStorage> = new Map();
  public account: number = 0;

  private messagesCache: Map<string | number, any[]> = new Map();
  private dialogsCache: Map<string | number, any> = new Map();
  private usersCache: Map<string | number, any> = new Map();
  private chatsCache: Map<string | number, any> = new Map();

  constructor(account: number = 0) {
    this.account = account;
    this.restoreFromLocalStorage();
  }

  public static getInstance(account: number = 0): MessagesStorage {
    if (!this.instances.has(account)) {
      this.instances.set(account, new MessagesStorage(account));
    }
    return this.instances.get(account)!;
  }

  private restoreFromLocalStorage() {
    try {
      const saved = localStorage.getItem(`tg_storage_acc_${this.account}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dialogs) {
          for (const d of parsed.dialogs) this.dialogsCache.set(d.id, d);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  private persist() {
    try {
      const data = {
        dialogs: Array.from(this.dialogsCache.values()),
        updated_at: Date.now(),
      };
      localStorage.setItem(`tg_storage_acc_${this.account}`, JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  }

  public putMessage(chatId: string | number, message: any) {
    const list = this.messagesCache.get(chatId) || [];
    list.push(message);
    this.messagesCache.set(chatId, list);
    this.persist();
  }

  public putMessages(chatId: string | number, messages: any[]) {
    this.messagesCache.set(chatId, messages);
    this.persist();
  }

  public getMessages(chatId: string | number): any[] {
    return this.messagesCache.get(chatId) || [];
  }

  public deleteMessages(chatId: string | number, messageIds: number[]) {
    const list = this.messagesCache.get(chatId);
    if (list) {
      const filtered = list.filter((m) => !messageIds.includes(m.id));
      this.messagesCache.set(chatId, filtered);
      this.persist();
    }
  }

  public deleteDialog(chatId: string | number) {
    this.messagesCache.delete(chatId);
    this.dialogsCache.delete(chatId);
    this.chatsCache.delete(chatId);
    this.persist();
  }
}
