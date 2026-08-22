/**
 * Telegram MTProto Type Language (TL) Schema & RPC Objects
 * Ported from DrKLO/Telegram (Telegram for Android - TLRPC.java)
 * Contains Constructor IDs, Serialization/Deserialization, and Type Definitions.
 */

// ==========================================
// 1. TL CORE SERIALIZATION INTERFACES
// ==========================================

export class TLObject {
  public static constructorId: number = 0;

  serialize(): Uint8Array {
    const buffer = new TLBuffer();
    this.serializeToStream(buffer);
    return buffer.getBytes();
  }

  serializeToStream(buffer: TLBuffer): void {
    // Override in subclasses
  }

  readParams(buffer: TLBuffer, test: boolean = false): void {
    // Override in subclasses
  }
}

export class TLBuffer {
  private buffer: Uint8Array;
  private view: DataView;
  private position: number = 0;

  constructor(data?: Uint8Array | number) {
    if (typeof data === 'number') {
      this.buffer = new Uint8Array(data);
    } else if (data instanceof Uint8Array) {
      this.buffer = data;
    } else {
      this.buffer = new Uint8Array(2048);
    }
    this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
  }

  private ensureCapacity(needed: number) {
    if (this.position + needed > this.buffer.length) {
      const nextSize = Math.max(this.buffer.length * 2, this.position + needed + 1024);
      const newBuf = new Uint8Array(nextSize);
      newBuf.set(this.buffer);
      this.buffer = newBuf;
      this.view = new DataView(this.buffer.buffer);
    }
  }

  writeInt32(value: number) {
    this.ensureCapacity(4);
    this.view.setInt32(this.position, value, true);
    this.position += 4;
  }

  readInt32(): number {
    const val = this.view.getInt32(this.position, true);
    this.position += 4;
    return val;
  }

  writeInt64(value: bigint | number) {
    this.ensureCapacity(8);
    this.view.setBigInt64(this.position, BigInt(value), true);
    this.position += 8;
  }

  readInt64(): bigint {
    const val = this.view.getBigInt64(this.position, true);
    this.position += 8;
    return val;
  }

  writeDouble(value: number) {
    this.ensureCapacity(8);
    this.view.setFloat64(this.position, value, true);
    this.position += 8;
  }

  readDouble(): number {
    const val = this.view.getFloat64(this.position, true);
    this.position += 8;
    return val;
  }

  writeBool(value: boolean) {
    this.writeInt32(value ? 0x997275b5 : 0xbc799737);
  }

  readBool(): boolean {
    const constructor = this.readInt32();
    return constructor === 0x997275b5;
  }

  writeString(value: string) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    this.writeByteArray(bytes);
  }

  readString(): string {
    const bytes = this.readByteArray();
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  writeByteArray(bytes: Uint8Array) {
    const len = bytes.length;
    if (len <= 253) {
      this.ensureCapacity(len + 4);
      this.buffer[this.position++] = len;
      this.buffer.set(bytes, this.position);
      this.position += len;
      // Padding to 4 bytes
      const padding = (4 - ((len + 1) % 4)) % 4;
      for (let i = 0; i < padding; i++) this.buffer[this.position++] = 0;
    } else {
      this.ensureCapacity(len + 8);
      this.buffer[this.position++] = 254;
      this.buffer[this.position++] = len & 0xff;
      this.buffer[this.position++] = (len >> 8) & 0xff;
      this.buffer[this.position++] = (len >> 16) & 0xff;
      this.buffer.set(bytes, this.position);
      this.position += len;
      const padding = (4 - (len % 4)) % 4;
      for (let i = 0; i < padding; i++) this.buffer[this.position++] = 0;
    }
  }

  readByteArray(): Uint8Array {
    let len = this.buffer[this.position++];
    if (len === 254) {
      len = this.buffer[this.position++] | (this.buffer[this.position++] << 8) | (this.buffer[this.position++] << 16);
    }
    const res = this.buffer.slice(this.position, this.position + len);
    this.position += len;
    const padding = (4 - ((len + (len > 253 ? 0 : 1)) % 4)) % 4;
    this.position += padding;
    return res;
  }

  writeVector(list: TLObject[]) {
    this.writeInt32(0x1cb5c415); // Vector constructor
    this.writeInt32(list.length);
    for (const item of list) {
      item.serializeToStream(this);
    }
  }

  getBytes(): Uint8Array {
    return this.buffer.slice(0, this.position);
  }

  getPosition(): number {
    return this.position;
  }
}

// ==========================================
// 2. CONSTRUCTOR CODES (CRC32 from TLRPC.java)
// ==========================================

export const TL_CONSTRUCTORS = {
  // Auth
  auth_sendCode: 0xa677244f,
  auth_sentCode: 0x5e002502,
  auth_signIn: 0x8d52a95d,
  auth_signUp: 0x80eee427,
  auth_authorization: 0x2ea2c0d4,
  auth_logOut: 0x3e72ba14,
  auth_importAuthorization: 0xe3ef9613,
  auth_exportAuthorization: 0xe5b29d41,

  // Account & Users
  account_getPrivacy: 0xdadbc950,
  account_setPrivacy: 0xc9f81ce8,
  account_updateProfile: 0x78515775,
  account_updateStatus: 0x6628562c,
  account_registerDevice: 0xec86017a,
  account_unregisterDevice: 0x3076c4bf,
  account_updateNotifySettings: 0x84be5b93,

  users_getUsers: 0x0d91a548,
  users_getFullUser: 0xb60f5918,
  user_full: 0x8d641490,
  user: 0x22e49072,

  // Messages & Dialogs
  messages_getDialogs: 0xa0f4cb4f,
  messages_dialogs: 0x15ba6c40,
  messages_getHistory: 0x4423e6c5,
  messages_messages: 0x8c718e87,
  messages_sendMessage: 0x983f956f,
  messages_sendMedia: 0x78528866,
  messages_editMessage: 0x48f71778,
  messages_deleteMessages: 0xe58e953d,
  messages_readHistory: 0x0e306d3a,
  messages_sendReaction: 0xd30d78d4,
  messages_search: 0x8614ef68,
  messages_searchGlobal: 0x4e627408,
  messages_affectedMessages: 0x84d19185,
  messages_affectedHistory: 0xb45c69d1,

  // Channels & Groups
  messages_createChat: 0x9cb126e7,
  channels_createChannel: 0x9100f93a,
  channels_joinChannel: 0x24b524c5,
  channels_leaveChannel: 0xf836aa95,
  channels_getChannels: 0x0a7f6bbb,
  channels_editTitle: 0x566decd0,
  channels_editPhoto: 0xf0217723,
  channels_inviteToChannel: 0x199f3a14,
  channels_kickFromChannel: 0xa672e3ee,
  channels_getParticipants: 0x77ced9d0,
  channels_channelParticipants: 0x9ab0fe02,
  messages_migrateChat: 0x15a3819a,

  // Contacts
  contacts_getContacts: 0x5dd69944,
  contacts_contacts: 0xeae87f39,
  contacts_importContacts: 0x2c800be5,
  contacts_search: 0x11f812d8,

  // Upload & Photos
  upload_saveFilePart: 0xb304a621,
  upload_getFile: 0xbe250264,
  upload_file: 0x096a18d5,
  photos_uploadProfilePhoto: 0x89f30f69,
  photos_deletePhotos: 0x87cf7f2f,

  // Phone / Calls
  phone_getCallConfig: 0x55451fa9,
  phone_requestCall: 0x42ff96ed,
  phone_acceptCall: 0x3bd2b4a0,
  phone_discardCall: 0xb2cbc1c0,
  phone_phoneCall: 0xec82e140,

  // Stories
  stories_sendStory: 0xe4e6694b,
  stories_getAllStories: 0xeeb0d625,
  stories_readStories: 0xa556dac8,
  stories_deleteStories: 0xb3f0a95a,
  stories_allStories: 0x6efc5e81,

  // Updates
  updates: 0x74ae4240,
  updates_difference: 0x00f49ca0,
  updateNewMessage: 0x1f2b0afd,
  updateNewChannelMessage: 0x62ba04d9,
  updateEditMessage: 0xe40370a9,
  updateDeleteMessages: 0xa20db0e5,
};

// ==========================================
// 3. COMPLETE TLRPC CLASS DEFINITIONS
// ==========================================

export namespace TLRPC {
  // Base Peers
  export class TL_peerUser extends TLObject {
    public static constructorId = 0x59511761;
    public user_id: bigint | number | string = 0;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_peerUser.constructorId);
      b.writeInt64(typeof this.user_id === 'string' ? BigInt(parseInt(this.user_id, 10) || 0) : BigInt(this.user_id));
    }
  }

  export class TL_peerChat extends TLObject {
    public static constructorId = 0x36c6088a;
    public chat_id: bigint | number | string = 0;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_peerChat.constructorId);
      b.writeInt64(typeof this.chat_id === 'string' ? BigInt(parseInt(this.chat_id, 10) || 0) : BigInt(this.chat_id));
    }
  }

  export class TL_peerChannel extends TLObject {
    public static constructorId = 0xa2a5371e;
    public channel_id: bigint | number | string = 0;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_peerChannel.constructorId);
      b.writeInt64(typeof this.channel_id === 'string' ? BigInt(parseInt(this.channel_id, 10) || 0) : BigInt(this.channel_id));
    }
  }

  // Input Peers
  export class TL_inputPeerUser extends TLObject {
    public static constructorId = 0xdde8a54c;
    public user_id: bigint | number = 0;
    public access_hash: bigint = 0n;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_inputPeerUser.constructorId);
      b.writeInt64(this.user_id);
      b.writeInt64(this.access_hash);
    }
  }

  export class TL_inputPeerChannel extends TLObject {
    public static constructorId = 0x27bcbbfc;
    public channel_id: bigint | number = 0;
    public access_hash: bigint = 0n;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_inputPeerChannel.constructorId);
      b.writeInt64(this.channel_id);
      b.writeInt64(this.access_hash);
    }
  }

  // Users & Profiles
  export class TL_user extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.user;
    public id: bigint | number | string = 0;
    public first_name: string = '';
    public last_name?: string = '';
    public username?: string = '';
    public phone?: string = '';
    public photo?: any = null;
    public status?: any = null;
    public bot: boolean = false;
    public verified: boolean = false;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_user.constructorId);
      b.writeInt64(typeof this.id === 'string' ? BigInt(parseInt(this.id, 10) || 0) : BigInt(this.id));
      b.writeString(this.first_name);
      b.writeString(this.last_name || '');
      b.writeString(this.username || '');
      b.writeString(this.phone || '');
      b.writeBool(this.bot);
      b.writeBool(this.verified);
    }
  }

  export class TL_userFull extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.user_full;
    public id: bigint | number = 0;
    public about: string = '';
    public settings?: any = null;
    public profile_photo?: any = null;
    public notify_settings?: any = null;
    public common_chats_count: number = 0;
    public pinned_msg_id?: number = 0;
  }

  // Messages
  export class TL_message extends TLObject {
    public static constructorId = 0x38116eed;
    public id: number = 0;
    public from_id?: any = null;
    public peer_id?: any = null;
    public date: number = Math.floor(Date.now() / 1000);
    public message: string = '';
    public out: boolean = false;
    public media?: any = null;
    public reply_markup?: any = null;
    public reactions?: any = null;
    public views?: number = 0;
    public forwards?: number = 0;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_message.constructorId);
      b.writeInt32(this.id);
      b.writeInt32(this.date);
      b.writeString(this.message);
      b.writeBool(this.out);
    }
  }

  // Dialogs
  export class TL_dialog extends TLObject {
    public static constructorId = 0xd58a08c6;
    public peer: any;
    public top_message: number = 0;
    public unread_count: number = 0;
    public read_inbox_max_id: number = 0;
    public read_outbox_max_id: number = 0;
    public pinned: boolean = false;
  }

  // Updates & Sync
  export class TL_updates extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.updates;
    public updates: any[] = [];
    public users: TL_user[] = [];
    public chats: any[] = [];
    public date: number = Math.floor(Date.now() / 1000);
    public seq: number = 0;
  }

  export class TL_updates_difference extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.updates_difference;
    public new_messages: TL_message[] = [];
    public other_updates: any[] = [];
    public users: TL_user[] = [];
    public chats: any[] = [];
    public intermediate_state?: any = null;
    public is_slice: boolean = false;
  }

  // ==========================================
  // RPC METHODS (Matching DrKLO/Telegram TLRPC)
  // ==========================================

  // 1. Auth RPCs
  export class TL_auth_sendCode extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.auth_sendCode;
    public phone_number: string = '';
    public api_id: number = 22043994;
    public api_hash: string = '56f64582b363d367280db96586b97801';
    public settings?: any = null;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_auth_sendCode.constructorId);
      b.writeString(this.phone_number);
      b.writeInt32(this.api_id);
      b.writeString(this.api_hash);
    }
  }

  export class TL_auth_signIn extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.auth_signIn;
    public phone_number: string = '';
    public phone_code_hash: string = '';
    public phone_code: string = '';

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_auth_signIn.constructorId);
      b.writeString(this.phone_number);
      b.writeString(this.phone_code_hash);
      b.writeString(this.phone_code);
    }
  }

  export class TL_auth_logOut extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.auth_logOut;
    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_auth_logOut.constructorId);
    }
  }

  // 2. Messages RPCs
  export class TL_messages_getDialogs extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.messages_getDialogs;
    public offset_date: number = 0;
    public offset_id: number = 0;
    public offset_peer: any = null;
    public limit: number = 100;
    public hash: bigint = 0n;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_messages_getDialogs.constructorId);
      b.writeInt32(this.offset_date);
      b.writeInt32(this.offset_id);
      b.writeInt32(this.limit);
      b.writeInt64(this.hash);
    }
  }

  export class TL_messages_getHistory extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.messages_getHistory;
    public peer: any;
    public offset_id: number = 0;
    public offset_date: number = 0;
    public add_offset: number = 0;
    public limit: number = 50;
    public max_id: number = 0;
    public min_id: number = 0;
    public hash: bigint = 0n;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_messages_getHistory.constructorId);
      if (this.peer) this.peer.serializeToStream(b);
      b.writeInt32(this.offset_id);
      b.writeInt32(this.offset_date);
      b.writeInt32(this.add_offset);
      b.writeInt32(this.limit);
      b.writeInt32(this.max_id);
      b.writeInt32(this.min_id);
      b.writeInt64(this.hash);
    }
  }

  export class TL_messages_sendMessage extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.messages_sendMessage;
    public peer: any;
    public message: string = '';
    public random_id: bigint = BigInt(Math.floor(Math.random() * 1e12));
    public reply_to_msg_id?: number = 0;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_messages_sendMessage.constructorId);
      if (this.peer) this.peer.serializeToStream(b);
      b.writeString(this.message);
      b.writeInt64(this.random_id);
    }
  }

  export class TL_messages_sendReaction extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.messages_sendReaction;
    public peer: any;
    public msg_id: number = 0;
    public reaction: string = '';

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_messages_sendReaction.constructorId);
      if (this.peer) this.peer.serializeToStream(b);
      b.writeInt32(this.msg_id);
      b.writeString(this.reaction);
    }
  }

  export class TL_messages_deleteMessages extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.messages_deleteMessages;
    public id: number[] = [];
    public revoke: boolean = true;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_messages_deleteMessages.constructorId);
      b.writeBool(this.revoke);
      b.writeInt32(0x1cb5c415);
      b.writeInt32(this.id.length);
      for (const msgId of this.id) {
        b.writeInt32(msgId);
      }
    }
  }

  export class TL_messages_reportSpam extends TLObject {
    public static constructorId = 0xc5562589;
    public peer: any;
    public reason: string = 'spam';

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_messages_reportSpam.constructorId);
      if (this.peer) this.peer.serializeToStream(b);
      b.writeString(this.reason);
    }
  }

  export class TL_channels_editBanned extends TLObject {
    public static constructorId = 0x96e6ced3;
    public channel: any;
    public participant: any;
    public banned_rights: any;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_channels_editBanned.constructorId);
    }
  }

  export class TL_messages_readHistory extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.messages_readHistory;
    public peer: any;
    public max_id: number = 0;

    serializeToStream(b: TLBuffer) {
      b.writeInt32(TL_messages_readHistory.constructorId);
      if (this.peer) this.peer.serializeToStream(b);
      b.writeInt32(this.max_id);
    }
  }

  // 3. Channels & Groups RPCs
  export class TL_channels_createChannel extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.channels_createChannel;
    public title: string = '';
    public about: string = '';
    public broadcast: boolean = false;
    public megagroup: boolean = false;
  }

  export class TL_channels_joinChannel extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.channels_joinChannel;
    public channel: any;
  }

  export class TL_channels_leaveChannel extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.channels_leaveChannel;
    public channel: any;
  }

  // 4. Contacts & Users RPCs
  export class TL_contacts_getContacts extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.contacts_getContacts;
    public hash: bigint = 0n;
  }

  export class TL_users_getFullUser extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.users_getFullUser;
    public id: any;
  }

  export class TL_account_updateProfile extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.account_updateProfile;
    public first_name?: string;
    public last_name?: string;
    public about?: string;
  }

  // 5. Stories RPCs
  export class TL_stories_getAllStories extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.stories_getAllStories;
    public next_state?: string;
  }

  export class TL_stories_sendStory extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.stories_sendStory;
    public peer: any;
    public media: any;
    public caption?: string;
    public period: number = 86400; // 24 hours
  }

  // 6. Calls RPCs
  export class TL_phone_requestCall extends TLObject {
    public static constructorId = TL_CONSTRUCTORS.phone_requestCall;
    public user_id: any;
    public random_id: number = Math.floor(Math.random() * 1e9);
    public g_a_hash: Uint8Array = new Uint8Array(32);
    public protocol: any;
  }
}
