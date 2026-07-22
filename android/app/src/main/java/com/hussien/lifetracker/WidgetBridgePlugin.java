package com.hussien.lifetracker;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

/** Lets the web app redraw the home-screen widget after it rewrites the snapshot. */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void refresh(PluginCall call) {
        HabitWidgetProvider.updateAll(getContext());
        call.resolve();
    }
}
