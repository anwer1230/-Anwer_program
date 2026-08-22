package org.drinkless.tdlib;

/**
 * TDLib API schema objects in Java
 * Ported from DrKLO/Telegram / TDLib Java generator
 */
public final class TdApi {
    public static abstract class Object {
        public abstract int getConstructor();
    }

    public static abstract class Function extends Object {}

    // Core Types
    public static class Ok extends Object {
        public static final int CONSTRUCTOR = 0xd4cda3b;
        @Override
        public int getConstructor() { return CONSTRUCTOR; }
    }

    public static class Error extends Object {
        public static final int CONSTRUCTOR = 0x9cdf40e3;
        public int code;
        public String message;
        @Override
        public int getConstructor() { return CONSTRUCTOR; }
    }

    public static class User extends Object {
        public static final int CONSTRUCTOR = 0x22e49072;
        public long id;
        public String firstName;
        public String lastName;
        public String username;
        public String phoneNumber;
        public boolean isVerified;
        public boolean isPremium;
        @Override
        public int getConstructor() { return CONSTRUCTOR; }
    }

    public static class Message extends Object {
        public static final int CONSTRUCTOR = 0x38116eed;
        public long id;
        public long chatId;
        public boolean isOutgoing;
        public int date;
        public MessageContent content;
        @Override
        public int getConstructor() { return CONSTRUCTOR; }
    }

    public static abstract class MessageContent extends Object {}

    public static class MessageText extends MessageContent {
        public static final int CONSTRUCTOR = 0x1f2b0afd;
        public FormattedText text;
        @Override
        public int getConstructor() { return CONSTRUCTOR; }
    }

    public static class FormattedText extends Object {
        public static final int CONSTRUCTOR = 0xa3557e02;
        public String text;
        @Override
        public int getConstructor() { return CONSTRUCTOR; }
    }

    // Functions
    public static class SetTdlibParameters extends Function {
        public static final int CONSTRUCTOR = 0x6e2c3da;
        public int apiId;
        public String apiHash;
        public String systemLanguageCode;
        public String deviceModel;
        public String systemVersion;
        public String applicationVersion;
        public boolean useMessageDatabase;
        @Override
        public int getConstructor() { return CONSTRUCTOR; }
    }

    public static class SendMessage extends Function {
        public static final int CONSTRUCTOR = 0x8df5a8df;
        public long chatId;
        public MessageContent inputMessageContent;
        @Override
        public int getConstructor() { return CONSTRUCTOR; }
    }

    public static class GetChats extends Function {
        public static final int CONSTRUCTOR = 0x93309a45;
        public int limit;
        @Override
        public int getConstructor() { return CONSTRUCTOR; }
    }
}
