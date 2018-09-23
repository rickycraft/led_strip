package rick.com.luci.utility;

import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;

public abstract class MyUtility extends AppCompatActivity {
    public View currentView;
    public MyBluetooth mBluetooth;
    public MyColor mColor;
    public String TAG;
    public final String notConnected = "No device connected";

    public void snackPrint(String s) {
        Log.d(TAG, s);
        Snackbar.make(currentView, s, Snackbar.LENGTH_SHORT).show();
    }

    public void snackLongPrint(String s) {
        Log.d(TAG, s);
        Snackbar.make(currentView, s, Snackbar.LENGTH_INDEFINITE).show();
    }

    public void superclass(View currentView, String TAG) {
        this.currentView = currentView;
        this.mBluetooth = MyBluetooth.getInstance();
        this.mColor = mBluetooth.getColor();
        this.TAG = TAG;

    }

    public void updateLux(int i) {
        mColor.setLux(i);
        if (mBluetooth.isConnected() && mColor.isOn()) {
            mBluetooth.sendColorMessage();
        }
    }

    public void turnOff() {
        mBluetooth.sendColorRGB(0, 0, 0);
        snackPrint("Led strip OFF");
    }

    public void notConnected() {
        snackPrint("No device connected");
    }

    public class MyBtHandler implements PrintHandler {
        @Override
        public void print(String s) {
            snackPrint(s);
        }

        @Override
        public void longPrint(String s) {
            snackLongPrint(s);
        }
    }
}
