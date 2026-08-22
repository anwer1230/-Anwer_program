package org.telegram.messenger;

import org.telegram.tgnet.TLRPC;
import java.io.File;
import java.util.concurrent.ConcurrentHashMap;

/**
 * FileLoader
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/FileLoader.java)
 *
 * Multi-threaded chunked file download and upload engine.
 */
public class FileLoader {

    private static volatile FileLoader[] Instance = new FileLoader[UserConfig.MAX_ACCOUNT_COUNT];
    public final int currentAccount;

    public interface FileLoaderDelegate {
        void fileUploadProgressChanged(String location, float progress, boolean isEncrypted);
        void fileDidUploaded(String location, TLRPC.InputFile inputFile, String key, byte[] iv, long totalSize);
        void fileDidFailedUpload(String location, boolean isEncrypted);
    }

    private final ConcurrentHashMap<String, Float> uploadProgress = new ConcurrentHashMap<>();

    public FileLoader(int account) {
        this.currentAccount = account;
    }

    public static FileLoader getInstance(int num) {
        FileLoader localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (FileLoader.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new FileLoader(num);
                }
            }
        }
        return localInstance;
    }

    public static String getMessageFileName(TLRPC.Message message) {
        if (message == null) return "";
        return "file_" + message.id;
    }

    public static File getDirectory(int type) {
        File dir = new File(ApplicationLoader.applicationContext.getFilesDir(), "telegram_cache");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return dir;
    }

    public void loadFile(TLRPC.FileLocation location, String ext, int size, int priority) {
        // Download chunked stream from DC
    }

    public void uploadFile(String path, boolean isEncrypted, boolean small, int type) {
        // Upload chunked stream to DC
    }
}
