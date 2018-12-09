package rick.com.luci.utility;

import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.util.Log;

import java.util.ArrayList;

import rick.com.luci.bluetooth.Bluetooth;
import rick.com.luci.bluetooth.BluetoothCallback;
import rick.com.luci.bluetooth.DeviceCallback;
import rick.com.luci.bluetooth.DiscoveryCallback;


public class MyBluetooth {

    private static final String TAG = "MyBluetooth ";
    private static final String bluetoothName = "HC-05";
    //SETUP
    private static MyBluetooth instance = null;
    private boolean isConnecting;
    private Bluetooth bt;
    private ArrayList<PrintHandler> handlers;
    private ConnectionStateHandler btStateHandler;
    private ConnectionStateHandler elStateHandler;
    private MyColor mColor;

    private MyBluetooth(Context context) {
        mColor = new MyColor();
        bt = new Bluetooth(context);
        handlers = new ArrayList<>();
        setup();
    }

    public static void createNewInstance(Context context) {
        if (instance == null) {
            instance = new MyBluetooth(context);
        }
    }

    public static MyBluetooth getInstance() {
        return instance;
    }

    private void setup() {
        if (!bt.isEnabled()) {
            bt.enable();
        }

        bt.setDiscoveryCallback(new DiscoveryCallback() {
            @Override
            public void onDiscoveryStarted() {
            }

            @Override
            public void onDiscoveryFinished() {
            }

            @Override
            public void onDeviceFound(BluetoothDevice device) {
            }

            @Override
            public void onDevicePaired(BluetoothDevice device) {
            }

            @Override
            public void onDeviceUnpaired(BluetoothDevice device) {
            }

            @Override
            public void onError(String message) {
                snackPrint("error " + message);
            }
        });
        bt.setBluetoothCallback(new BluetoothCallback() {
            @Override
            public void onBluetoothTurningOn() {
                snackPrint("Buetooth is turning on");
            }

            @Override
            public void onBluetoothOn() {
                snackPrint("Bluetooth is on");
            }

            @Override
            public void onBluetoothTurningOff() {
            }

            @Override
            public void onBluetoothOff() {
            }

            @Override
            public void onUserDeniedActivation() {
                // when using bluetooth.showEnableDialog()
                // you will also have to call bluetooth.onActivityResult()
            }
        });
        bt.setDeviceCallback(new DeviceCallback() {
            @Override
            public void onDeviceConnected(BluetoothDevice device) {
                snackPrint("Connected to " + device.getName());
                changeConnectionState(true);
                onConnect();
            }

            @Override
            public void onDeviceDisconnected(BluetoothDevice device, String message) {
                snackPrint("Disconnetted from " + device.getName());
                changeConnectionState(false);
            }

            @Override
            public void onMessage(String message) {
            }

            @Override
            public void onError(String message) {
            }

            @Override
            public void onConnectError(BluetoothDevice device, String message) {
                snackPrint("Device not aviable");
                Log.d(TAG, "Error " + message + " on device " + device.getName());
                changeConnectionState(false);
            }
        });
    }

    //UTILITY

    //CONNECTION
    public void connect() {
        if (!isConnecting) {
            isConnecting = true;
            //longPrint("Connecting to " + bluetoothName);
            bt.connectToName(bluetoothName);
        }
    }

    private void onConnect(){
        sendColorName("white");
        switchEl(true);
    }

    public void disconnect() {
        sendColorName("off");
        switchEl(false);
        bt.disconnect();
    }

    //MESSAGES
    public void sendMessage(String s) {
        if (bt.isConnected()) {
            bt.send("<" + s + ">");
            Log.d(TAG, s);
        } else {
            Log.d(TAG, "No device connected");
        }
    }

    public void sendColorMessage() {
        sendMessage(mColor.getMessage());
    }

    public void sendColorName(String s) {
        mColor.setColorByName(s);
        //snackPrint("Color is set to " + s);
        sendColorMessage();
    }

    public void sendColorRGB(int r, int g, int b) {
        mColor.setColorRGB(r, g, b);
        sendColorMessage();
    }

    public void sendLux(int lux){
        mColor.setLux(lux);
        sendColorMessage();
    }

    public MyColor getColor() {
        return mColor;
    }

    //HANDLERS
    public void addBtListener(PrintHandler handler) {
        handlers.add(handler);
    }

    public void addConnectButtonListener(ConnectionStateHandler handler) {
        btStateHandler = handler;
        changeConnectionState(false);
    }

    public void addElStatusHandler(ConnectionStateHandler handler){
        elStateHandler = handler;
    }

    private void changeConnectionState(Boolean status) {
        btStateHandler.changeState(status);
        isConnecting = status;

    }

    public void switchEl(boolean b){
        if (b){
            sendMessage("eli");
            //snackPrint("El Wire on");
        } else {
            sendMessage("elo");
            //snackPrint("El Wire off");
        }
        elStateHandler.changeState(b);
    }

    private void snackPrint(String s) {
        for (PrintHandler p : handlers) {
            p.print(s);
        }
    }

    private void longPrint(String s) {
        for (PrintHandler p : handlers) {
            p.longPrint(s);
        }
    }

    //OVERRIDE
    public boolean isConnected() {
        return bt.isConnected();
    }


}
