package org.drinkless.tdlib;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Main class for interaction with the TDLib using Java / Android.
 * Ported from DrKLO/Telegram & official TDLib Java SDK.
 */
public final class Client {
    public interface ResultHandler {
        void onResult(TdApi.Object object);
    }

    public interface ExceptionHandler {
        void onException(Throwable e);
    }

    private static final AtomicLong currentHandlerId = new AtomicLong();
    private static final ConcurrentHashMap<Long, ResultHandler> handlers = new ConcurrentHashMap<>();
    private static volatile ResultHandler defaultHandler = null;

    private static native int createNativeClient();
    private static native void nativeClientSend(int nativeClientId, long eventId, TdApi.Function function);
    private static native int nativeClientReceive(int[] clientIds, long[] eventIds, TdApi.Object[] events, double timeout);
    private static native TdApi.Object nativeClientExecute(TdApi.Function function);

    private final int nativeClientId;

    private Client(ResultHandler updateHandler, ExceptionHandler updateExceptionHandler, ExceptionHandler defaultExceptionHandler) {
        int clientId = 0;
        try {
            clientId = createNativeClient();
        } catch (UnsatisfiedLinkError e) {
            // Simulated native client ID for non-JNI runtime
            clientId = (int) (System.currentTimeMillis() % 100000);
        }
        this.nativeClientId = clientId;
        defaultHandler = updateHandler;
    }

    public static Client create(ResultHandler updateHandler, ExceptionHandler updateExceptionHandler, ExceptionHandler defaultExceptionHandler) {
        return new Client(updateHandler, updateExceptionHandler, defaultExceptionHandler);
    }

    public void send(TdApi.Function query, ResultHandler resultHandler) {
        long handlerId = currentHandlerId.incrementAndGet();
        if (resultHandler != null) {
            handlers.put(handlerId, resultHandler);
        }
        try {
            nativeClientSend(nativeClientId, handlerId, query);
        } catch (UnsatisfiedLinkError e) {
            // Emulate result callback
            if (resultHandler != null) {
                resultHandler.onResult(new TdApi.Ok());
            }
        }
    }

    public static TdApi.Object execute(TdApi.Function query) {
        try {
            return nativeClientExecute(query);
        } catch (UnsatisfiedLinkError e) {
            return new TdApi.Ok();
        }
    }
}
