package rick.com.luci.bluetooth;

public interface BluetoothCallback {
    void onBluetoothTurningOn();

    void onBluetoothOn();

    void onBluetoothTurningOff();

    void onBluetoothOff();

    void onUserDeniedActivation();
}
