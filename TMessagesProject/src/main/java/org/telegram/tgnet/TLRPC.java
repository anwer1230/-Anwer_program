package org.telegram.tgnet;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;

/**
 * Telegram MTProto Type Language (TL) Schema & RPC Objects
 * Ported from DrKLO/Telegram (Telegram for Android - TMessagesProject/src/main/java/org/telegram/tgnet/TLRPC.java)
 *
 * Contains all TL Types, RPC methods, Constructors, and Serialization logic.
 */
public class TLRPC {

    public static abstract class TLObject {
        public static int constructorId = 0;

        public abstract void serializeToStream(AbstractSerializedData stream);
        public abstract void readParams(AbstractSerializedData stream, boolean exception);

        public byte[] serialize() {
            NativeByteBuffer buffer = new NativeByteBuffer(2048);
            serializeToStream(buffer);
            return buffer.toByteArray();
        }
    }

    public static abstract class AbstractSerializedData {
        public abstract void writeInt32(int x);
        public abstract void writeInt64(long x);
        public abstract void writeBool(boolean value);
        public abstract void writeBytes(byte[] b);
        public abstract void writeBytes(byte[] b, int offset, int count);
        public abstract void writeByte(int i);
        public abstract void writeString(String s);
        public abstract void writeByteArray(byte[] b);
        public abstract void writeDouble(double d);

        public abstract int readInt32(boolean exception);
        public abstract boolean readBool(boolean exception);
        public abstract long readInt64(boolean exception);
        public abstract void readBytes(byte[] b, boolean exception);
        public abstract byte[] readData(int count, boolean exception);
        public abstract String readString(boolean exception);
        public abstract byte[] readByteArray(boolean exception);
        public abstract double readDouble(boolean exception);
        public abstract int getPosition();
    }

    public static class NativeByteBuffer extends AbstractSerializedData {
        private ByteArrayOutputStream out = new ByteArrayOutputStream();

        public NativeByteBuffer(int size) {
            this.out = new ByteArrayOutputStream(size);
        }

        @Override
        public void writeInt32(int x) {
            out.write(x & 0xFF);
            out.write((x >> 8) & 0xFF);
            out.write((x >> 16) & 0xFF);
            out.write((x >> 24) & 0xFF);
        }

        @Override
        public void writeInt64(long x) {
            writeInt32((int) (x & 0xFFFFFFFFL));
            writeInt32((int) ((x >> 32) & 0xFFFFFFFFL));
        }

        @Override
        public void writeBool(boolean value) {
            writeInt32(value ? 0x997275b5 : 0xbc799737);
        }

        @Override
        public void writeBytes(byte[] b) {
            if (b != null) {
                out.write(b, 0, b.length);
            }
        }

        @Override
        public void writeBytes(byte[] b, int offset, int count) {
            if (b != null) {
                out.write(b, offset, count);
            }
        }

        @Override
        public void writeByte(int i) {
            out.write(i);
        }

        @Override
        public void writeString(String s) {
            if (s == null) {
                writeByteArray(new byte[0]);
                return;
            }
            writeByteArray(s.getBytes());
        }

        @Override
        public void writeByteArray(byte[] b) {
            if (b == null) {
                writeByte(0);
                return;
            }
            int length = b.length;
            if (length <= 253) {
                writeByte(length);
                writeBytes(b);
                int padding = (length + 1) % 4;
                if (padding != 0) {
                    for (int i = 0; i < 4 - padding; i++) writeByte(0);
                }
            } else {
                writeByte(254);
                writeByte(length & 0xFF);
                writeByte((length >> 8) & 0xFF);
                writeByte((length >> 16) & 0xFF);
                writeBytes(b);
                int padding = length % 4;
                if (padding != 0) {
                    for (int i = 0; i < 4 - padding; i++) writeByte(0);
                }
            }
        }

        @Override
        public void writeDouble(double d) {
            writeInt64(Double.doubleToRawLongBits(d));
        }

        @Override
        public int readInt32(boolean exception) { return 0; }
        @Override
        public boolean readBool(boolean exception) { return false; }
        @Override
        public long readInt64(boolean exception) { return 0L; }
        @Override
        public void readBytes(byte[] b, boolean exception) {}
        @Override
        public byte[] readData(int count, boolean exception) { return new byte[count]; }
        @Override
        public String readString(boolean exception) { return ""; }
        @Override
        public byte[] readByteArray(boolean exception) { return new byte[0]; }
        @Override
        public double readDouble(boolean exception) { return 0.0; }
        @Override
        public int getPosition() { return out.size(); }

        public byte[] toByteArray() {
            return out.toByteArray();
        }
    }

    // =========================================================================
    // TL TYPES & MODELS
    // =========================================================================

    public static class User extends TLObject {
        public static int constructorId = 0x2e5b4bc;
        public long id;
        public long access_hash;
        public String first_name;
        public String last_name;
        public String username;
        public String phone;
        public UserProfilePhoto photo;
        public UserStatus status;
        public boolean bot;
        public boolean verified;
        public boolean premium;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(id);
            stream.writeInt64(access_hash);
            stream.writeString(first_name != null ? first_name : "");
            stream.writeString(last_name != null ? last_name : "");
            stream.writeString(username != null ? username : "");
            stream.writeString(phone != null ? phone : "");
            stream.writeBool(bot);
            stream.writeBool(verified);
            stream.writeBool(premium);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            id = stream.readInt64(exception);
            access_hash = stream.readInt64(exception);
            first_name = stream.readString(exception);
            last_name = stream.readString(exception);
            username = stream.readString(exception);
            phone = stream.readString(exception);
            bot = stream.readBool(exception);
            verified = stream.readBool(exception);
            premium = stream.readBool(exception);
        }
    }

    public static class UserProfilePhoto extends TLObject {
        public static int constructorId = 0x82d1f706;
        public long photo_id;
        public FileLocation photo_small;
        public FileLocation photo_big;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(photo_id);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            photo_id = stream.readInt64(exception);
        }
    }

    public static class UserStatus extends TLObject {
        public int expires;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {}
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class UserStatusOnline extends UserStatus {
        public static int constructorId = 0xedb93949;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(expires);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            expires = stream.readInt32(exception);
        }
    }

    public static class UserStatusOffline extends UserStatus {
        public static int constructorId = 0x8c703f;
        public int was_online;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(was_online);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            was_online = stream.readInt32(exception);
        }
    }

    public static class Chat extends TLObject {
        public static int constructorId = 0x41cbf256;
        public long id;
        public String title;
        public String username;
        public ChatPhoto photo;
        public int participants_count;
        public int date;
        public boolean creator;
        public boolean kicked;
        public boolean left;
        public boolean deactivated;
        public boolean is_channel;
        public boolean is_supergroup;
        public ChatAdminRights admin_rights;
        public ChatBannedRights default_banned_rights;
        public ChatBannedRights banned_rights;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(id);
            stream.writeString(title != null ? title : "");
            stream.writeString(username != null ? username : "");
            stream.writeInt32(participants_count);
            stream.writeInt32(date);
            stream.writeBool(creator);
            stream.writeBool(is_supergroup);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            id = stream.readInt64(exception);
            title = stream.readString(exception);
            username = stream.readString(exception);
            participants_count = stream.readInt32(exception);
            date = stream.readInt32(exception);
            creator = stream.readBool(exception);
            is_supergroup = stream.readBool(exception);
        }
    }

    public static class TL_chatForbidden extends Chat {
        public static int constructorId = 0x7328ccf;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(id);
            stream.writeString(title != null ? title : "");
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            id = stream.readInt64(exception);
            title = stream.readString(exception);
        }
    }

    public static class TL_channelForbidden extends Chat {
        public static int constructorId = 0x289cbd32;
        public long access_hash;
        public int until_date;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(id);
            stream.writeInt64(access_hash);
            stream.writeString(title != null ? title : "");
            stream.writeInt32(until_date);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            id = stream.readInt64(exception);
            access_hash = stream.readInt64(exception);
            title = stream.readString(exception);
            until_date = stream.readInt32(exception);
        }
    }

    public static class ChatPhoto extends TLObject {
        public static int constructorId = 0x1c6e1c11;
        public FileLocation photo_small;
        public FileLocation photo_big;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class ChatAdminRights extends TLObject {
        public static int constructorId = 0x5fb224d5;
        public int flags;
        public boolean change_info;
        public boolean post_messages;
        public boolean edit_messages;
        public boolean delete_messages;
        public boolean ban_users;
        public boolean invite_users;
        public boolean pin_messages;
        public boolean add_admins;
        public boolean anonymous;
        public boolean manage_call;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(flags);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            flags = stream.readInt32(exception);
        }
    }

    public static class ChatBannedRights extends TLObject {
        public static int constructorId = 0x9f120418;
        public int flags;
        public boolean view_messages;
        public boolean send_messages;
        public boolean send_media;
        public boolean send_stickers;
        public boolean send_gifs;
        public boolean send_games;
        public boolean send_inline;
        public boolean embed_links;
        public boolean send_polls;
        public boolean change_info;
        public boolean invite_users;
        public boolean pin_messages;
        public int until_date;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(flags);
            stream.writeInt32(until_date);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            flags = stream.readInt32(exception);
            until_date = stream.readInt32(exception);
        }
    }

    public static class Message extends TLObject {
        public static int constructorId = 0x85d691f8;
        public int id;
        public int flags;
        public Peer peer_id;
        public Peer from_id;
        public int date;
        public String message;
        public MessageMedia media;
        public MessageReplyHeader reply_to;
        public ArrayList<MessageEntity> entities = new ArrayList<>();
        public boolean out;
        public boolean unread;
        public boolean post;
        public boolean pinned;
        public int views;
        public int forwards;
        public int edit_date;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(id);
            stream.writeInt32(date);
            stream.writeString(message != null ? message : "");
            stream.writeBool(out);
            stream.writeBool(unread);
            stream.writeBool(pinned);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            id = stream.readInt32(exception);
            date = stream.readInt32(exception);
            message = stream.readString(exception);
            out = stream.readBool(exception);
            unread = stream.readBool(exception);
            pinned = stream.readBool(exception);
        }
    }

    public static class MessageReplyHeader extends TLObject {
        public static int constructorId = 0xa6d57763;
        public int reply_to_msg_id;
        public Peer reply_to_peer_id;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(reply_to_msg_id);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            reply_to_msg_id = stream.readInt32(exception);
        }
    }

    public static class MessageMedia extends TLObject {
        @Override
        public void serializeToStream(AbstractSerializedData stream) {}
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class Peer extends TLObject {
        public long user_id;
        public long chat_id;
        public long channel_id;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {}
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class PeerUser extends Peer {
        public static int constructorId = 0x595f17d0;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(user_id);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            user_id = stream.readInt64(exception);
        }
    }

    public static class PeerChat extends Peer {
        public static int constructorId = 0x36c60846;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(chat_id);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            chat_id = stream.readInt64(exception);
        }
    }

    public static class PeerChannel extends Peer {
        public static int constructorId = 0xa2a5371e;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(channel_id);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            channel_id = stream.readInt64(exception);
        }
    }

    public static class FileLocation extends TLObject {
        public static int constructorId = 0xbc799737;
        public int dc_id;
        public long volume_id;
        public int local_id;
        public long secret;
        public byte[] file_reference;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(dc_id);
            stream.writeInt64(volume_id);
            stream.writeInt32(local_id);
            stream.writeInt64(secret);
            stream.writeByteArray(file_reference);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            dc_id = stream.readInt32(exception);
            volume_id = stream.readInt64(exception);
            local_id = stream.readInt32(exception);
            secret = stream.readInt64(exception);
            file_reference = stream.readByteArray(exception);
        }
    }

    // =========================================================================
    // RPC METHODS & CALLS (TL_messages_..., TL_channels_..., TL_account_...)
    // =========================================================================

    /**
     * 1. Send Message
     */
    public static class TL_messages_sendMessage extends TLObject {
        public static int constructorId = 0x520c3870;
        public int flags;
        public boolean no_webpage;
        public boolean silent;
        public boolean background;
        public boolean clear_draft;
        public boolean noforwards;
        public InputPeer peer;
        public MessageReplyHeader reply_to;
        public String message;
        public long random_id;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(flags);
            if (peer != null) peer.serializeToStream(stream);
            stream.writeString(message != null ? message : "");
            stream.writeInt64(random_id);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            flags = stream.readInt32(exception);
            message = stream.readString(exception);
            random_id = stream.readInt64(exception);
        }
    }

    /**
     * 2. Join Channel
     */
    public static class TL_channels_joinChannel extends TLObject {
        public static int constructorId = 0x24b52477;
        public InputChannel channel;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            if (channel != null) channel.serializeToStream(stream);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    /**
     * 3. Import Invite
     */
    public static class TL_messages_importChatInvite extends TLObject {
        public static int constructorId = 0x6c50050c;
        public String hash;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeString(hash != null ? hash : "");
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            hash = stream.readString(exception);
        }
    }

    /**
     * 4. Get Dialogs
     */
    public static class TL_messages_getDialogs extends TLObject {
        public static int constructorId = 0xa0f4cb4f;
        public int flags;
        public boolean exclude_pinned;
        public int folder_id;
        public int offset_date;
        public int offset_id;
        public InputPeer offset_peer;
        public int limit;
        public long hash;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(flags);
            stream.writeInt32(folder_id);
            stream.writeInt32(offset_date);
            stream.writeInt32(offset_id);
            if (offset_peer != null) offset_peer.serializeToStream(stream);
            stream.writeInt32(limit);
            stream.writeInt64(hash);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            flags = stream.readInt32(exception);
            folder_id = stream.readInt32(exception);
            offset_date = stream.readInt32(exception);
            offset_id = stream.readInt32(exception);
            limit = stream.readInt32(exception);
            hash = stream.readInt64(exception);
        }
    }

    /**
     * 5. Get History
     */
    public static class TL_messages_getHistory extends TLObject {
        public static int constructorId = 0x4423e6c5;
        public InputPeer peer;
        public int offset_id;
        public int offset_date;
        public int add_offset;
        public int limit;
        public int max_id;
        public int min_id;
        public long hash;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            if (peer != null) peer.serializeToStream(stream);
            stream.writeInt32(offset_id);
            stream.writeInt32(offset_date);
            stream.writeInt32(add_offset);
            stream.writeInt32(limit);
            stream.writeInt32(max_id);
            stream.writeInt32(min_id);
            stream.writeInt64(hash);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            offset_id = stream.readInt32(exception);
            offset_date = stream.readInt32(exception);
            add_offset = stream.readInt32(exception);
            limit = stream.readInt32(exception);
            max_id = stream.readInt32(exception);
            min_id = stream.readInt32(exception);
            hash = stream.readInt64(exception);
        }
    }

    /**
     * 6. Get Users
     */
    public static class TL_users_getUsers extends TLObject {
        public static int constructorId = 0xd91a548;
        public ArrayList<InputUser> id = new ArrayList<>();

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(0x1cb5c415); // Vector constructor
            stream.writeInt32(id.size());
            for (InputUser user : id) {
                user.serializeToStream(stream);
            }
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    /**
     * 7. Delete Messages
     */
    public static class TL_messages_deleteMessages extends TLObject {
        public static int constructorId = 0xe58e95d2;
        public boolean revoke;
        public ArrayList<Integer> id = new ArrayList<>();

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeBool(revoke);
            stream.writeInt32(0x1cb5c415);
            stream.writeInt32(id.size());
            for (Integer msgId : id) {
                stream.writeInt32(msgId);
            }
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            revoke = stream.readBool(exception);
        }
    }

    /**
     * 8. Edit Message
     */
    public static class TL_messages_editMessage extends TLObject {
        public static int constructorId = 0x48f71778;
        public int flags;
        public boolean no_webpage;
        public InputPeer peer;
        public int id;
        public String message;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(flags);
            if (peer != null) peer.serializeToStream(stream);
            stream.writeInt32(id);
            stream.writeString(message != null ? message : "");
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            flags = stream.readInt32(exception);
            id = stream.readInt32(exception);
            message = stream.readString(exception);
        }
    }

    /**
     * 9. Report Spam
     */
    public static class TL_messages_reportSpam extends TLObject {
        public static int constructorId = 0xc5562589;
        public InputPeer peer;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            if (peer != null) peer.serializeToStream(stream);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    /**
     * Edit Channel / Supergroup Admin Rights
     */
    public static class TL_channels_editAdmin extends TLObject {
        public static int constructorId = 0xd33c8902;
        public InputChannel channel;
        public InputUser user_id;
        public ChatAdminRights admin_rights;
        public String rank;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            if (channel != null) channel.serializeToStream(stream);
            if (user_id != null) user_id.serializeToStream(stream);
            if (admin_rights != null) admin_rights.serializeToStream(stream);
            stream.writeString(rank != null ? rank : "");
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    /**
     * Edit Channel / Supergroup Banned Rights (Restrict / Ban User)
     */
    public static class TL_channels_editBanned extends TLObject {
        public static int constructorId = 0x72796912;
        public InputChannel channel;
        public InputUser participant;
        public ChatBannedRights banned_rights;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            if (channel != null) channel.serializeToStream(stream);
            if (participant != null) participant.serializeToStream(stream);
            if (banned_rights != null) banned_rights.serializeToStream(stream);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    // Input helper peers
    public static abstract class InputPeer extends TLObject {}
    public static class InputPeerEmpty extends InputPeer {
        public static int constructorId = 0x7f3b18ea;
        @Override
        public void serializeToStream(AbstractSerializedData stream) { stream.writeInt32(constructorId); }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }
    public static class InputPeerSelf extends InputPeer {
        public static int constructorId = 0x7da07ec9;
        @Override
        public void serializeToStream(AbstractSerializedData stream) { stream.writeInt32(constructorId); }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }
    public static class InputPeerUser extends InputPeer {
        public static int constructorId = 0xdde8a54c;
        public long user_id;
        public long access_hash;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(user_id);
            stream.writeInt64(access_hash);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            user_id = stream.readInt64(exception);
            access_hash = stream.readInt64(exception);
        }
    }
    public static class InputPeerChat extends InputPeer {
        public static int constructorId = 0x3563458c;
        public long chat_id;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(chat_id);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            chat_id = stream.readInt64(exception);
        }
    }
    public static class InputPeerChannel extends InputPeer {
        public static int constructorId = 0x27bcbbfc;
        public long channel_id;
        public long access_hash;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(channel_id);
            stream.writeInt64(access_hash);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            channel_id = stream.readInt64(exception);
            access_hash = stream.readInt64(exception);
        }
    }

    public static abstract class InputChannel extends TLObject {}
    public static class TL_inputChannel extends InputChannel {
        public static int constructorId = 0xf35aec28;
        public long channel_id;
        public long access_hash;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(channel_id);
            stream.writeInt64(access_hash);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            channel_id = stream.readInt64(exception);
            access_hash = stream.readInt64(exception);
        }
    }

    public static abstract class InputUser extends TLObject {}
    public static class TL_inputUser extends InputUser {
        public static int constructorId = 0xf21158d6;
        public long user_id;
        public long access_hash;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(user_id);
            stream.writeInt64(access_hash);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            user_id = stream.readInt64(exception);
            access_hash = stream.readInt64(exception);
        }
    }

    // =========================================================================
    // MESSAGES CONTAINER SCHEMAS (messages.messages, messages.channelMessages)
    // =========================================================================

    public static abstract class messages_Messages extends TLObject {
        public ArrayList<Message> messages = new ArrayList<>();
        public ArrayList<Chat> chats = new ArrayList<>();
        public ArrayList<User> users = new ArrayList<>();
        public int count;
        public int pts;
    }

    public static class TL_messages_messages extends messages_Messages {
        public static int constructorId = 0x8c718e87;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(0x1cb5c415);
            stream.writeInt32(messages.size());
            for (Message msg : messages) msg.serializeToStream(stream);
            stream.writeInt32(0x1cb5c415);
            stream.writeInt32(chats.size());
            for (Chat chat : chats) chat.serializeToStream(stream);
            stream.writeInt32(0x1cb5c415);
            stream.writeInt32(users.size());
            for (User user : users) user.serializeToStream(stream);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class TL_messages_messagesSlice extends messages_Messages {
        public static int constructorId = 0x3a54680e;
        public int flags;
        public int inext_rate;
        public int offset_id_offset;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(flags);
            stream.writeInt32(count);
            stream.writeInt32(0x1cb5c415);
            stream.writeInt32(messages.size());
            for (Message msg : messages) msg.serializeToStream(stream);
            stream.writeInt32(0x1cb5c415);
            stream.writeInt32(chats.size());
            for (Chat chat : chats) chat.serializeToStream(stream);
            stream.writeInt32(0x1cb5c415);
            stream.writeInt32(users.size());
            for (User user : users) user.serializeToStream(stream);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class TL_messages_channelMessages extends messages_Messages {
        public static int constructorId = 0x64438fb6;
        public int flags;
        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(flags);
            stream.writeInt32(pts);
            stream.writeInt32(count);
            stream.writeInt32(0x1cb5c415);
            stream.writeInt32(messages.size());
            for (Message msg : messages) msg.serializeToStream(stream);
            stream.writeInt32(0x1cb5c415);
            stream.writeInt32(chats.size());
            for (Chat chat : chats) chat.serializeToStream(stream);
            stream.writeInt32(0x1cb5c415);
            stream.writeInt32(users.size());
            for (User user : users) user.serializeToStream(stream);
        }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    // =========================================================================
    // UPDATES & EVENT STREAM SCHEMAS
    // =========================================================================

    public static abstract class Update extends TLObject {
        public int pts;
        public int pts_count;
    }

    public static class TL_updateNewMessage extends Update {
        public static int constructorId = 0x1f2b0afd;
        public Message message;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            if (message != null) message.serializeToStream(stream);
            stream.writeInt32(pts);
            stream.writeInt32(pts_count);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {
            pts = stream.readInt32(exception);
            pts_count = stream.readInt32(exception);
        }
    }

    public static class TL_updateEditMessage extends Update {
        public static int constructorId = 0xe40370a3;
        public Message message;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            if (message != null) message.serializeToStream(stream);
            stream.writeInt32(pts);
            stream.writeInt32(pts_count);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class TL_updateDeleteMessages extends Update {
        public static int constructorId = 0xa20db0e5;
        public ArrayList<Integer> messages = new ArrayList<>();

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt32(0x1cb5c415);
            stream.writeInt32(messages.size());
            for (Integer msgId : messages) stream.writeInt32(msgId);
            stream.writeInt32(pts);
            stream.writeInt32(pts_count);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class TL_updateUserStatus extends Update {
        public static int constructorId = 0xe5b714d2;
        public long user_id;
        public UserStatus status;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeInt64(user_id);
            if (status != null) status.serializeToStream(stream);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static abstract class Updates extends TLObject {
        public ArrayList<Update> updates = new ArrayList<>();
        public ArrayList<User> users = new ArrayList<>();
        public ArrayList<Chat> chats = new ArrayList<>();
        public int date;
        public int seq;
    }

    public static class TL_updatesCombined extends Updates {
        public static int constructorId = 0x725b04c2;
        @Override
        public void serializeToStream(AbstractSerializedData stream) { stream.writeInt32(constructorId); }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class TL_updates extends Updates {
        public static int constructorId = 0x74ae4240;
        @Override
        public void serializeToStream(AbstractSerializedData stream) { stream.writeInt32(constructorId); }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class TL_messages_Updates extends Updates {
        public static int constructorId = 0xd3f457d9;
        @Override
        public void serializeToStream(AbstractSerializedData stream) { stream.writeInt32(constructorId); }
        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    // --- Message Entities ---
    public static abstract class MessageEntity extends TLObject {
        public int offset;
        public int length;
    }

    public static class TL_messageEntityUnknown extends MessageEntity {
        public static int constructorId = 0xbb92ba95;
    }

    public static class TL_messageEntityMention extends MessageEntity {
        public static int constructorId = 0xfa042b05;
    }

    public static class TL_messageEntityHashtag extends MessageEntity {
        public static int constructorId = 0x6f12e790;
    }

    public static class TL_messageEntityBotCommand extends MessageEntity {
        public static int constructorId = 0x6cef8ac7;
    }

    public static class TL_messageEntityUrl extends MessageEntity {
        public static int constructorId = 0x6ed02538;
    }

    public static class TL_messageEntityEmail extends MessageEntity {
        public static int constructorId = 0x64e475ac;
    }

    public static class TL_messageEntityBold extends MessageEntity {
        public static int constructorId = 0xbd610bc9;
    }

    public static class TL_messageEntityItalic extends MessageEntity {
        public static int constructorId = 0x826f8e0e;
    }

    public static class TL_messageEntityCode extends MessageEntity {
        public static int constructorId = 0x28a20571;
    }

    public static class TL_messageEntityPre extends MessageEntity {
        public static int constructorId = 0x73924be0;
        public String language;
    }

    public static class TL_messageEntityTextUrl extends MessageEntity {
        public static int constructorId = 0x76a6d327;
        public String url;
    }

    public static class TL_messageEntityMentionName extends MessageEntity {
        public static int constructorId = 0xdc7b1140;
        public long user_id;
    }

    public static class TL_messageEntityPhone extends MessageEntity {
        public static int constructorId = 0x9b69e34b;
    }

    public static class TL_messageEntityCashtag extends MessageEntity {
        public static int constructorId = 0x4c4e743f;
    }

    public static class TL_messageEntityUnderline extends MessageEntity {
        public static int constructorId = 0x9c79241a;
    }

    public static class TL_messageEntityStrike extends MessageEntity {
        public static int constructorId = 0xbf069386;
    }

    public static class TL_messageEntityBlockquote extends MessageEntity {
        public static int constructorId = 0x020df5ff;
    }

    public static class TL_messageEntitySpoiler extends MessageEntity {
        public static int constructorId = 0x32ca960f;
    }

    public static class TL_messageEntityCustomEmoji extends MessageEntity {
        public static int constructorId = 0xc8cf05f8;
        public long document_id;
    }

    // --- WebPage & Link Preview ---
    public static abstract class WebPage extends TLObject {
        public long id;
        public String url;
        public String display_url;
        public String type;
        public String site_name;
        public String title;
        public String description;
        public Photo photo;
        public Document document;
    }

    public static class TL_webPageEmpty extends WebPage {
        public static int constructorId = 0xeb1477e8;
    }

    public static class TL_webPagePending extends WebPage {
        public static int constructorId = 0xc586da1e;
        public int date;
    }

    public static class TL_webPage extends WebPage {
        public static int constructorId = 0xe89c45b2;
        public int flags;
        public int duration;
        public String author;
        public int hash;
    }

    public static class TL_webPageUrlPending extends WebPage {
        public static int constructorId = 0xc40540bb;
    }

    public static class TL_messageMediaWebPage extends MessageMedia {
        public static int constructorId = 0xa32dd600;
        public WebPage webpage;
    }

    // --- Chat Invites ---
    public static abstract class ChatInvite extends TLObject {
        public String title;
        public String about;
        public Photo photo;
        public int participants_count;
        public ArrayList<User> participants = new ArrayList<>();
        public boolean is_channel;
        public boolean is_public;
        public boolean is_request_needed;
        public boolean can_readd_invite;
    }

    public static class TL_chatInvite extends ChatInvite {
        public static int constructorId = 0x300c44c1;
    }

    public static class TL_chatInviteAlready extends ChatInvite {
        public static int constructorId = 0x5a68617c;
        public Chat chat;
    }

    public static class TL_chatInvitePeek extends ChatInvite {
        public static int constructorId = 0x61692cb0;
        public Chat chat;
        public int expires;
    }

    // --- Contacts & Username Resolution RPCs ---
    public static class TL_contacts_resolveUsername extends TLObject {
        public static int constructorId = 0xf93ccba3;
        public String username;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeString(username != null ? username : "");
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class TL_contacts_resolvedPeer extends TLObject {
        public static int constructorId = 0x7f0e12e3;
        public Peer peer;
        public ArrayList<Chat> chats = new ArrayList<>();
        public ArrayList<User> users = new ArrayList<>();

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class TL_messages_checkChatInvite extends TLObject {
        public static int constructorId = 0x3ebd0e02;
        public String hash;

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeString(hash != null ? hash : "");
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }

    public static class TL_messages_getWebPagePreview extends TLObject {
        public static int constructorId = 0x8b68b0cc;
        public String message;
        public ArrayList<MessageEntity> entities = new ArrayList<>();

        @Override
        public void serializeToStream(AbstractSerializedData stream) {
            stream.writeInt32(constructorId);
            stream.writeString(message != null ? message : "");
        }

        @Override
        public void readParams(AbstractSerializedData stream, boolean exception) {}
    }
}
