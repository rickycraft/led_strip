package rick.com.luci;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import com.shawnlin.numberpicker.NumberPicker;

import rick.com.luci.utility.MyUtility;

public class ButtonsActivity extends MyUtility {
    private Button[] buttonMap;
    private Button offColorButton;
    private static boolean addedHandler = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_buttons);
        superclass(findViewById(R.id.buttonPickerLayout), "BUTTONS");
        setup();
    }


    private Button findButtonById(int id) {
        return (Button) findViewById(id);
    }

    private void setup() {
        if (!addedHandler) {
            mBluetooth.addBtListener(new MyBtHandler());
            addedHandler = true;
        }
        addButton(new int[]{R.id.purpleButton, R.id.orangeButton, R.id.pinkButton});
        NumberPicker luxPicker = findViewById(R.id.np_lux);
        offColorButton = findButtonById(R.id.offColorButton);
        luxPicker.setOnValueChangedListener(new NumberPicker.OnValueChangeListener() {
            @Override
            public void onValueChange(NumberPicker picker, int oldVal, int newVal) {
                updateLux(newVal);
            }
        });
        luxPicker.setValue(mColor.getLux());
        offColorButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                turnOff();
            }
        });
    }

    private void addButton(int[] id) {
        buttonMap = new Button[id.length];
        int index = 0;
        for (int i : id) {
            buttonMap[index] = findButtonById(i);
            buttonMap[index].setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    String text = (String) ((Button) v).getText();
                    mBluetooth.sendColorName(text);
                }
            });
            index++;
        }
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        finish();
    }

}
