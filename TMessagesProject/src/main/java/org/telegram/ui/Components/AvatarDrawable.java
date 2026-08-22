package org.telegram.ui.Components;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.Drawable;
import android.text.TextPaint;
import org.telegram.messenger.AndroidUtilities;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.Theme;

/**
 * AvatarDrawable
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/ui/Components/AvatarDrawable.java)
 *
 * Generates Telegram's distinctive circular colored gradient avatars with initial
 * letters for users, supergroups, channels, and bots without profile pictures.
 * Supports configurable avatarSize (e.g. 42dp for chat messages, 54dp for dialogs, 64dp for drawer).
 */
public class AvatarDrawable extends Drawable {

    public static final int DEFAULT_AVATAR_SIZE = 42; // Standard 42dp in chat rows

    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final TextPaint textPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    private final RectF rectF = new RectF();
    private final StringBuilder stringBuilder = new StringBuilder(5);
    private int color = 0xff549cdd;
    private int avatarSize = AndroidUtilities.dp(DEFAULT_AVATAR_SIZE);

    // Telegram's official Avatar background color palette
    public static final int[] AVATAR_COLORS = {
        0xffe17076, // Red
        0xfffaa774, // Orange
        0xffa695e7, // Violet
        0xff7bc862, // Green
        0xff6ec9cb, // Cyan
        0xff65aadd, // Light Blue
        0xffee7aae  // Pink
    };

    public AvatarDrawable() {
        super();
        textPaint.setColor(Color.WHITE);
        textPaint.setTypeface(Theme.boldTypeface);
        textPaint.setTextAlign(Paint.Align.CENTER);
        paint.setStyle(Paint.Style.FILL);
        setAvatarSize(AndroidUtilities.dp(DEFAULT_AVATAR_SIZE));
    }

    public void setAvatarSize(int sizeInDpOrPx) {
        this.avatarSize = sizeInDpOrPx;
        textPaint.setTextSize(avatarSize * 0.42f);
        invalidateSelf();
    }

    public int getAvatarSize() {
        return avatarSize;
    }

    public static int getColorForId(long id) {
        int index = (int) Math.abs(id % AVATAR_COLORS.length);
        return AVATAR_COLORS[index];
    }

    public void setInfo(TLRPC.User user) {
        if (user != null) {
            this.color = getColorForId(user.id);
            stringBuilder.setLength(0);
            if (user.first_name != null && !user.first_name.isEmpty()) {
                stringBuilder.appendCodePoint(user.first_name.codePointAt(0));
            } else if (user.last_name != null && !user.last_name.isEmpty()) {
                stringBuilder.appendCodePoint(user.last_name.codePointAt(0));
            }
        }
        invalidateSelf();
    }

    public void setInfo(TLRPC.Chat chat) {
        if (chat != null) {
            this.color = getColorForId(chat.id);
            stringBuilder.setLength(0);
            if (chat.title != null && !chat.title.isEmpty()) {
                stringBuilder.appendCodePoint(chat.title.codePointAt(0));
            }
        }
        invalidateSelf();
    }

    public void setInfo(long id, String firstName, String lastName) {
        this.color = getColorForId(id);
        stringBuilder.setLength(0);
        if (firstName != null && !firstName.isEmpty()) {
            stringBuilder.appendCodePoint(firstName.codePointAt(0));
        } else if (lastName != null && !lastName.isEmpty()) {
            stringBuilder.appendCodePoint(lastName.codePointAt(0));
        }
        invalidateSelf();
    }

    @Override
    public void draw(Canvas canvas) {
        Rect bounds = getBounds();
        if (bounds.isEmpty()) return;

        rectF.set(bounds);
        paint.setColor(color);
        float radius = Math.min(rectF.width(), rectF.height()) / 2.0f;
        canvas.drawRoundRect(rectF, radius, radius, paint);

        if (stringBuilder.length() > 0) {
            String text = stringBuilder.toString().toUpperCase();
            float x = bounds.centerX();
            float y = bounds.centerY() - ((textPaint.descent() + textPaint.ascent()) / 2);
            canvas.drawText(text, x, y, textPaint);
        }
    }

    @Override
    public void setAlpha(int alpha) {
        paint.setAlpha(alpha);
        textPaint.setAlpha(alpha);
    }

    @Override
    public void setColorFilter(android.graphics.ColorFilter colorFilter) {
        paint.setColorFilter(colorFilter);
        textPaint.setColorFilter(colorFilter);
    }

    @Override
    public int getOpacity() {
        return android.graphics.PixelFormat.TRANSLUCENT;
    }
}

