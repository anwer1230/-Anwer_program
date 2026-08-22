/**
 * TDLib (Telegram Database Library) Types & Schema Definition
 * Ported from official TDLib JSON interface & DrKLO/Telegram
 */

export namespace TdApi {
  // Base Type
  export interface Object {
    '@type': string;
    '@extra'?: string | number;
    [key: string]: any;
  }

  // 1. Core Models
  export interface TdlibParameters extends Object {
    '@type': 'tdlibParameters';
    use_test_dc: boolean;
    database_directory: string;
    files_directory: string;
    use_file_database: boolean;
    use_chat_info_database: boolean;
    use_message_database: boolean;
    use_secret_chats: boolean;
    api_id: number;
    api_hash: string;
    system_language_code: string;
    device_model: string;
    system_version: string;
    application_version: string;
    enable_storage_optimizer: boolean;
    ignore_file_names: boolean;
  }

  export interface AuthorizationState extends Object {
    '@type':
      | 'authorizationStateWaitTdlibParameters'
      | 'authorizationStateWaitPhoneNumber'
      | 'authorizationStateWaitCode'
      | 'authorizationStateWaitPassword'
      | 'authorizationStateWaitRegistration'
      | 'authorizationStateReady'
      | 'authorizationStateLoggingOut'
      | 'authorizationStateClosing'
      | 'authorizationStateClosed';
  }

  export interface User extends Object {
    '@type': 'user';
    id: number | string;
    first_name: string;
    last_name: string;
    username: string;
    phone_number: string;
    status: UserStatus;
    profile_photo?: ProfilePhoto;
    is_contact: boolean;
    is_mutual_contact: boolean;
    is_verified: boolean;
    is_premium: boolean;
    have_access: boolean;
    type: UserType;
  }

  export interface UserStatus extends Object {
    '@type': 'userStatusOnline' | 'userStatusOffline' | 'userStatusRecently' | 'userStatusLastWeek' | 'userStatusLastMonth';
    expires?: number;
    was_online?: number;
  }

  export interface UserType extends Object {
    '@type': 'userTypeRegular' | 'userTypeBot' | 'userTypeDeleted' | 'userTypeUnknown';
  }

  export interface ProfilePhoto extends Object {
    '@type': 'profilePhoto';
    id: string;
    small: File;
    big: File;
  }

  export interface File extends Object {
    '@type': 'file';
    id: number;
    size: number;
    expected_size: number;
    local: LocalFile;
    remote: RemoteFile;
  }

  export interface LocalFile extends Object {
    '@type': 'localFile';
    path: string;
    can_be_downloaded: boolean;
    can_be_deleted: boolean;
    is_downloading_active: boolean;
    is_downloading_completed: boolean;
    download_offset: number;
    downloaded_prefix_size: number;
    downloaded_size: number;
  }

  export interface RemoteFile extends Object {
    '@type': 'remoteFile';
    id: string;
    unique_id: string;
    is_uploading_active: boolean;
    is_uploading_completed: boolean;
    uploaded_size: number;
  }

  export interface Chat extends Object {
    '@type': 'chat';
    id: number | string;
    type: ChatType;
    title: string;
    photo?: ChatPhotoInfo;
    permissions?: ChatPermissions;
    last_message?: Message;
    positions: ChatPosition[];
    unread_count: number;
    last_read_inbox_message_id: number;
    last_read_outbox_message_id: number;
    unread_mention_count: number;
    notification_settings: ChatNotificationSettings;
    available_reactions: string[];
    has_scheduled_messages: boolean;
  }

  export interface ChatPosition extends Object {
    '@type': 'chatPosition';
    list: ChatList;
    order: string | number;
    is_pinned: boolean;
  }

  export interface ChatList extends Object {
    '@type': 'chatListMain' | 'chatListArchive' | 'chatListFolder';
    chat_folder_id?: number;
  }

  export interface ChatType extends Object {
    '@type': 'chatTypePrivate' | 'chatTypeBasicGroup' | 'chatTypeSupergroup' | 'chatTypeSecret';
    user_id?: number | string;
    basic_group_id?: number;
    supergroup_id?: number;
    is_channel?: boolean;
    secret_chat_id?: number;
  }

  export interface ChatPhotoInfo extends Object {
    '@type': 'chatPhotoInfo';
    small: File;
    big: File;
    has_animation: boolean;
  }

  export interface ChatPermissions extends Object {
    '@type': 'chatPermissions';
    can_send_basic_messages: boolean;
    can_send_audios: boolean;
    can_send_documents: boolean;
    can_send_photos: boolean;
    can_send_videos: boolean;
    can_send_video_notes: boolean;
    can_send_voice_notes: boolean;
    can_send_polls: boolean;
    can_send_other_messages: boolean;
    can_add_web_page_previews: boolean;
    can_change_info: boolean;
    can_invite_users: boolean;
    can_pin_messages: boolean;
  }

  export interface ChatNotificationSettings extends Object {
    '@type': 'chatNotificationSettings';
    use_default_mute_for: boolean;
    mute_for: number;
    sound_id: string;
    show_preview: boolean;
  }

  export interface Message extends Object {
    '@type': 'message';
    id: number;
    sender_id: MessageSender;
    chat_id: number | string;
    is_outgoing: boolean;
    is_pinned: boolean;
    can_be_edited: boolean;
    can_be_forwarded: boolean;
    can_be_saved: boolean;
    can_be_deleted_only_for_self: boolean;
    can_be_deleted_for_all_users: boolean;
    can_get_added_reactions: boolean;
    can_get_statistics: boolean;
    can_get_message_thread: boolean;
    can_get_viewers: boolean;
    can_get_media_timestamp_links: boolean;
    has_timestamped_media: boolean;
    is_channel_post: boolean;
    contains_unread_mention: boolean;
    date: number;
    edit_date: number;
    content: MessageContent;
    reply_markup?: ReplyMarkup;
  }

  export interface MessageSender extends Object {
    '@type': 'messageSenderUser' | 'messageSenderChat';
    user_id?: number | string;
    chat_id?: number | string;
  }

  export interface MessageContent extends Object {
    '@type':
      | 'messageText'
      | 'messagePhoto'
      | 'messageVideo'
      | 'messageVoiceNote'
      | 'messageAudio'
      | 'messageDocument'
      | 'messageSticker'
      | 'messageAnimation'
      | 'messageContact'
      | 'messageLocation'
      | 'messagePoll'
      | 'messageCall';
    text?: FormattedText;
    caption?: FormattedText;
  }

  export interface FormattedText extends Object {
    '@type': 'formattedText';
    text: string;
    entities: TextEntity[];
  }

  export interface TextEntity extends Object {
    '@type': 'textEntity';
    offset: number;
    length: number;
    type: TextEntityType;
  }

  export interface TextEntityType extends Object {
    '@type':
      | 'textEntityTypeBold'
      | 'textEntityTypeItalic'
      | 'textEntityTypeUnderline'
      | 'textEntityTypeStrikethrough'
      | 'textEntityTypeCode'
      | 'textEntityTypePre'
      | 'textEntityTypeTextUrl'
      | 'textEntityTypeMention'
      | 'textEntityTypeHashtag'
      | 'textEntityTypeBotCommand'
      | 'textEntityTypeUrl'
      | 'textEntityTypeEmailAddress'
      | 'textEntityTypePhoneNumber'
      | 'textEntityTypeSpoiler'
      | 'textEntityTypeCustomEmoji';
  }

  export interface ReplyMarkup extends Object {
    '@type':
      | 'replyMarkupInlineKeyboard'
      | 'replyMarkupShowKeyboard'
      | 'replyMarkupForceReply'
      | 'replyMarkupRemoveKeyboard';
  }

  // 2. TDLib Function Requests (td_send & td_execute)
  export interface Function extends Object {}

  export interface SetTdlibParameters extends Function {
    '@type': 'setTdlibParameters';
    database_directory?: string;
    files_directory?: string;
    database_encryption_key?: string;
    use_test_dc?: boolean;
    use_file_database?: boolean;
    use_chat_info_database?: boolean;
    use_message_database?: boolean;
    use_secret_chats?: boolean;
    api_id: number;
    api_hash: string;
    system_language_code: string;
    device_model: string;
    system_version: string;
    application_version: string;
  }

  export interface CheckDatabaseEncryptionKey extends Function {
    '@type': 'checkDatabaseEncryptionKey';
    encryption_key: string;
  }

  export interface SetAuthenticationPhoneNumber extends Function {
    '@type': 'setAuthenticationPhoneNumber';
    phone_number: string;
    settings?: any;
  }

  export interface CheckAuthenticationCode extends Function {
    '@type': 'checkAuthenticationCode';
    code: string;
  }

  export interface CheckAuthenticationPassword extends Function {
    '@type': 'checkAuthenticationPassword';
    password: string;
  }

  export interface LogOut extends Function {
    '@type': 'logOut';
  }

  export interface GetChats extends Function {
    '@type': 'getChats';
    chat_list?: ChatList;
    limit: number;
  }

  export interface GetChat extends Function {
    '@type': 'getChat';
    chat_id: number | string;
  }

  export interface GetChatHistory extends Function {
    '@type': 'getChatHistory';
    chat_id: number | string;
    from_message_id: number;
    offset: number;
    limit: number;
    only_local: boolean;
  }

  export interface SendMessage extends Function {
    '@type': 'sendMessage';
    chat_id: number | string;
    message_thread_id?: number;
    reply_to?: any;
    options?: any;
    reply_markup?: ReplyMarkup;
    input_message_content: InputMessageContent;
  }

  export interface InputMessageContent extends Object {
    '@type': 'inputMessageText' | 'inputMessagePhoto' | 'inputMessageDocument' | 'inputMessageVoiceNote';
    text?: FormattedText;
    caption?: FormattedText;
    clear_draft?: boolean;
  }

  export interface OpenChat extends Function {
    '@type': 'openChat';
    chat_id: number | string;
  }

  export interface CloseChat extends Function {
    '@type': 'closeChat';
    chat_id: number | string;
  }

  export interface SetChatTitle extends Function {
    '@type': 'setChatTitle';
    chat_id: number | string;
    title: string;
  }

  export interface CreateNewBasicGroupChat extends Function {
    '@type': 'createNewBasicGroupChat';
    user_ids: (number | string)[];
    title: string;
  }

  export interface CreateNewSupergroupChat extends Function {
    '@type': 'createNewSupergroupChat';
    title: string;
    is_channel: boolean;
    description: string;
  }

  export interface SearchPublicChat extends Function {
    '@type': 'searchPublicChat';
    username: string;
  }

  export interface GetMe extends Function {
    '@type': 'getMe';
  }

  // 3. TDLib Updates (td_receive)
  export interface Update extends Object {}

  export interface UpdateAuthorizationState extends Update {
    '@type': 'updateAuthorizationState';
    authorization_state: AuthorizationState;
  }

  export interface UpdateNewChat extends Update {
    '@type': 'updateNewChat';
    chat: Chat;
  }

  export interface UpdateNewMessage extends Update {
    '@type': 'updateNewMessage';
    message: Message;
  }

  export interface UpdateChatLastMessage extends Update {
    '@type': 'updateChatLastMessage';
    chat_id: number | string;
    last_message?: Message;
    positions: ChatPosition[];
  }

  export interface UpdateUser extends Update {
    '@type': 'updateUser';
    user: User;
  }

  export interface UpdateUserStatus extends Update {
    '@type': 'updateUserStatus';
    user_id: number | string;
    status: UserStatus;
  }

  export interface UpdateConnectionState extends Update {
    '@type': 'updateConnectionState';
    state: {
      '@type':
        | 'connectionStateConnecting'
        | 'connectionStateConnectingToProxy'
        | 'connectionStateReady'
        | 'connectionStateUpdating'
        | 'connectionStateWaitingForNetwork';
    };
  }

  export interface Ok extends Object {
    '@type': 'ok';
  }

  export interface Error extends Object {
    '@type': 'error';
    code: number;
    message: string;
  }
}
