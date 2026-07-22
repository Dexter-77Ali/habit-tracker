package com.hussien.lifetracker;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Home-screen widget: today's habits with one-tap check-off.
 *
 * Data bridge: the web app writes a JSON snapshot to the Capacitor Preferences
 * SharedPreferences file ("CapacitorStorage", key "widget_snapshot"):
 *   { "date": "YYYY-MM-DD", "streak": N, "habits": [{ "id", "name", "icon", "done" }] }
 *
 * A tap flips the row optimistically in the snapshot and appends the habit id to
 * "widget_pending_toggles"; the app drains that queue on resume and applies the
 * toggles through its normal logic so XP/streaks stay correct.
 */
public class HabitWidgetProvider extends AppWidgetProvider {

    static final String ACTION_TOGGLE = "com.hussien.lifetracker.WIDGET_TOGGLE";
    static final String EXTRA_HABIT_ID = "habitId";
    static final String PREFS = "CapacitorStorage";
    static final String KEY_SNAPSHOT = "widget_snapshot";
    static final String KEY_PENDING = "widget_pending_toggles";
    static final int MAX_ROWS = 6;

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] widgetIds) {
        for (int id : widgetIds) updateWidget(context, manager, id);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (!ACTION_TOGGLE.equals(intent.getAction())) return;
        String habitId = intent.getStringExtra(EXTRA_HABIT_ID);
        if (habitId == null) return;
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        try {
            // optimistic flip in the snapshot so the widget reflects the tap instantly
            JSONObject snap = new JSONObject(prefs.getString(KEY_SNAPSHOT, "{}"));
            JSONArray habits = snap.optJSONArray("habits");
            if (habits != null) {
                for (int i = 0; i < habits.length(); i++) {
                    JSONObject h = habits.getJSONObject(i);
                    if (habitId.equals(h.optString("id"))) {
                        h.put("done", !h.optBoolean("done"));
                        break;
                    }
                }
            }
            // queue the toggle for the app to apply with real XP/streak logic
            JSONArray pending = new JSONArray(prefs.getString(KEY_PENDING, "[]"));
            pending.put(habitId);
            prefs.edit()
                .putString(KEY_SNAPSHOT, snap.toString())
                .putString(KEY_PENDING, pending.toString())
                .apply();
        } catch (Exception ignored) { }
        updateAll(context);
    }

    /** Redraw every instance of this widget (also called from WidgetBridgePlugin). */
    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, HabitWidgetProvider.class));
        for (int id : ids) updateWidget(context, manager, id);
    }

    static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_habits);
        int[] rows = { R.id.w_row0, R.id.w_row1, R.id.w_row2, R.id.w_row3, R.id.w_row4, R.id.w_row5 };
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        try {
            JSONObject snap = new JSONObject(prefs.getString(KEY_SNAPSHOT, "{}"));
            views.setTextViewText(R.id.w_streak, "🔥 " + snap.optInt("streak", 0));
            JSONArray habits = snap.optJSONArray("habits");
            int count = habits == null ? 0 : Math.min(habits.length(), MAX_ROWS);
            for (int i = 0; i < MAX_ROWS; i++) {
                if (i < count) {
                    JSONObject h = habits.getJSONObject(i);
                    boolean done = h.optBoolean("done");
                    String icon = h.optString("icon", "");
                    views.setViewVisibility(rows[i], View.VISIBLE);
                    views.setTextViewText(rows[i],
                        (done ? "✅ " : "⬜ ") + (icon.isEmpty() ? "" : icon + " ") + h.optString("name"));
                    views.setFloat(rows[i], "setAlpha", done ? 0.55f : 1f);
                    Intent toggle = new Intent(context, HabitWidgetProvider.class)
                        .setAction(ACTION_TOGGLE)
                        .putExtra(EXTRA_HABIT_ID, h.optString("id"))
                        .setData(Uri.parse("habit://" + h.optString("id"))); // unique data keeps extras distinct
                    views.setOnClickPendingIntent(rows[i], PendingIntent.getBroadcast(
                        context, i, toggle, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
                } else {
                    views.setViewVisibility(rows[i], View.GONE);
                }
            }
            if (count == 0) {
                views.setViewVisibility(R.id.w_row0, View.VISIBLE);
                views.setTextViewText(R.id.w_row0, "Open the app to load habits");
            }
        } catch (Exception e) {
            views.setTextViewText(R.id.w_streak, "");
        }
        Intent open = new Intent(context, MainActivity.class);
        views.setOnClickPendingIntent(R.id.w_header, PendingIntent.getActivity(
            context, 99, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        manager.updateAppWidget(widgetId, views);
    }
}
