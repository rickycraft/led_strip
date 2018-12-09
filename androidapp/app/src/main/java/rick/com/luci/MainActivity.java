package rick.com.luci;


import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.Switch;

import com.shawnlin.numberpicker.NumberPicker;

import rick.com.luci.utility.ConnectionStateHandler;
import rick.com.luci.utility.MyBluetooth;
import rick.com.luci.utility.MyUtility;

public class MainActivity extends MyUtility {

    private Button connectButton;
    private Button redButton;
    private Button greenButton;
    private Button bluButton;
    private Button whiteButton;
    private Button rgbButton;
    private Button colorsButton;
    private NumberPicker luxPicker;
    private Switch elwireSwitch;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        permission();
        MyBluetooth.createNewInstance(getApplicationContext());
        superclass(findViewById(R.id.my_layout), "Main activity");
        mBluetooth.addBtListener(new MyBtHandler());
        layoutSetup();
        listenerSetup();
        //mBluetooth.connect(); TODO to test
    }

    @Override
    protected void onStop() {
        super.onStop();
        //mBluetooth.onStop();
    }

    private void permission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.d(TAG, "permission non granted");
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_COARSE_LOCATION}, 1);
        } else {
            Log.d(TAG, "permission granted");
        }
    }

    private void layoutSetup() {
        connectButton = findViewById(R.id.connectButton);
        connectButton.setText(R.string.connect);
        rgbButton = findViewById(R.id.rgbButton);
        colorsButton = findViewById(R.id.colorsButton);
        redButton = findViewById(R.id.redButton);
        greenButton = findViewById(R.id.greenButton);
        bluButton = findViewById(R.id.bluButton);
        whiteButton = findViewById(R.id.whiteButton);

        currentView = findViewById(R.id.my_layout);
        luxPicker = findViewById(R.id.number_picker_lux);
        elwireSwitch = findViewById(R.id.elwireSwitch);
    }

    private void listenerSetup() {
        mBluetooth.addConnectButtonListener(new ConnectButtonHandler());
        mBluetooth.addElStatusHandler(new ElWireHandler());
        connectButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mBluetooth.isConnected()) {
                    mBluetooth.disconnect();
                } else {
                    connectButton.setText(R.string.connecting);
                    mBluetooth.connect();
                }
            }
        });
        rgbButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startRGBActivity();
            }
        });
        colorsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startColorsActivity();
            }
        });
        luxPicker.setOnValueChangedListener(new NumberPicker.OnValueChangeListener() {
            @Override
            public void onValueChange(NumberPicker picker, int oldVal, int newVal) {
                mBluetooth.sendLux(newVal);
            }
        });
        elwireSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (mBluetooth.isConnected()) {
                    mBluetooth.switchEl(isChecked);
                }
            }
        });
        View.OnClickListener listener = new colorListener();
        greenButton.setOnClickListener(listener);
        bluButton.setOnClickListener(listener);
        whiteButton.setOnClickListener(listener);
        redButton.setOnClickListener(listener);
    }


    private void startRGBActivity() {
        Intent rgbIntent = new Intent(this, NumberPickerActivity.class);
        startActivity(rgbIntent);
        luxPicker.setValue(10);
    }

    private void startColorsActivity() {
        startActivity(new Intent(this, ButtonsActivity.class));
    }

    //BT HANDLER


    private class ConnectButtonHandler implements ConnectionStateHandler {
        @Override
        public void changeState(boolean b) {
            final boolean status = b;
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (status) {
                        connectButton.setText(R.string.disconnect);
                    } else {
                        connectButton.setText(R.string.connect);
                    }
                    elwireSwitch.setClickable(status);
                    elwireSwitch.setActivated(status);
                }
            });
        }
    }

    private class ElWireHandler implements ConnectionStateHandler {
        @Override
        public void changeState(boolean b) {
            final boolean status = b;
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    elwireSwitch.setChecked(status);
                }
            });
        }
    }


    private class colorListener implements View.OnClickListener {
        @Override
        public void onClick(View v) {
            Button b = (Button) v;
            String text = String.valueOf(b.getText());
            mBluetooth.sendColorName(text);
        }
    }

}
