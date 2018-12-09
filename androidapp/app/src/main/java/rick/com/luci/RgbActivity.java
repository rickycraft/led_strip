package rick.com.luci;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import com.shawnlin.numberpicker.NumberPicker;

import rick.com.luci.utility.MyUtility;


public class RgbActivity extends MyUtility {
    private NumberPicker redNumberPicker;
    private NumberPicker greenNumberPicker;
    private NumberPicker bluNumberPicker;
    private Button showColor;
    private Button fadeButton;
    private static boolean addedHandler = true;
    private int redValue;
    private int greenValue;
    private int bluValue;
    private boolean isFading;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_number_picker);
        superclass(findViewById(R.id.numbPickerLayout), "NUMBER PICKER");
        setup();
        setCounter();
    }

    private void setup() {
        if (!addedHandler) {
            mBluetooth.addBtListener(new MyBtHandler());
            addedHandler = true;
        }

        mColor.setLux(10);
        isFading = false;
        ValChanged valChanged = new ValChanged();
        redNumberPicker = findViewById(R.id.number_picker_red);
        greenNumberPicker = findViewById(R.id.number_picker_green);
        bluNumberPicker = findViewById(R.id.number_picker_blu);
        showColor = findViewById(R.id.showColor);
        fadeButton = findViewById(R.id.fadeButton);

        redNumberPicker.setOnValueChangedListener(valChanged);
        greenNumberPicker.setOnValueChangedListener(valChanged);
        bluNumberPicker.setOnValueChangedListener(valChanged);
        showColor.setClickable(false);

        fadeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                fade();
            }
        });
    }

    private void setCounter() {
        redNumberPicker.setValue(mColor.getRed());
        redValue = mColor.getRed();
        greenNumberPicker.setValue(mColor.getGreen());
        greenValue = mColor.getGreen();
        bluNumberPicker.setValue(mColor.getBlu());
        bluValue = mColor.getBlu();
        updateBackgroundColor();
    }

    private void updateBackgroundColor() {
        showColor.setBackgroundColor(Color.rgb(redValue * 10, greenValue * 10, bluValue * 10));
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        finish();
    }

    private class ValChanged implements NumberPicker.OnValueChangeListener {

        @Override
        public void onValueChange(NumberPicker picker, int oldVal, int newVal) {
            int id = picker.getId();
            switch (id) {
                case R.id.number_picker_red:
                    redValue = newVal;
                    break;
                case R.id.number_picker_green:
                    greenValue = newVal;
                    break;
                case R.id.number_picker_blu:
                    bluValue = newVal;
                    break;
            }
            mBluetooth.sendColorRGB(redValue, greenValue, bluValue);
            updateBackgroundColor();
        }
    }

    private void fade() { //TODO fix rgb
        if (!isFading) {
            mBluetooth.sendRawColorRGB(255,0,0);
            mBluetooth.sendMessage("fdi");
            fadeButton.setText(R.string.fade_off);
            snackPrint("Start fading");
        } else {
            mBluetooth.sendMessage("fdo");
            fadeButton.setText(R.string.fade_on);
            snackPrint("Stop fading");
            mBluetooth.sendColorMessage();
        }
        isFading = !isFading;
    }

}
