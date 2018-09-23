package rick.com.luci.utility;

import android.graphics.Color;
import android.util.Log;

public class MyColor {

    private final String TAG = "COLOR";
    private int red;
    private int green;
    private int blu;
    private int lux;
    private boolean isOn;
    private String colorName;

    public MyColor() {
        red = 0;
        green = 0;
        blu = 0;
        lux = 10;
        isOn = false;
    }

    public String getColorName() {
        return colorName;
    }

    public int getRed() {
        return red / lux;
    }

    private void setRed(int nRed) {
        red = checkInt(nRed) * lux;
    }

    public int getGreen() {
        return green / lux;
    }

    private void setGreen(int nGreen) {
        green = checkInt(nGreen) * lux;
    }

    public int getBlu() {
        return blu / lux;
    }

    private void setBlu(int nBlu) {
        blu = checkInt(nBlu) * lux;
    }

    public int getRawRed() {
        return red;
    }

    public int getRawGreen() {
        return green;
    }

    public int getRawBlu() {
        return blu;
    }

    public void setLux(int i) {
        if (i > 10) {
            i = 10;
        } else if (i < 1) {
            i = 1;
        }
        lux = i;
        setColorRGB(red, green, blu); //update all color lux
    }

    public int getLux() {
        return lux;
    }

    private int checkInt(int check) {
        if (check > 25) {
            check = 25;
        } else if (check < 0) {
            check = 0;
        }
        return check;
    }

    public void setColorByName(String color) {
        // Log.d(TAG, "color is "+color);
        colorName = color;
        switch (color) {
            case "red":
                setColorRGB(25, 0, 0);
                break;
            case "green":
                setColorRGB(0, 25, 0);
                break;
            case "blu":
                setColorRGB(0, 0, 25);
                break;
            case "white":
                setColorRGB(25, 25, 25);
                break;
            case "orange":
                setColorRGB(25, 9, 3);
                break;
            case "pink":
                setColorRGB(25, 3, 10);
                break;
            case "purple":
                setColorRGB(16, 4, 18);
                break;
        }
    }

    public void setColorInt(int val) { //TODO check funcionality
        Color c = Color.valueOf(val);
        Log.d(TAG, "red " + c.red() + " green " + c.green() + " blue " + c.blue());
        setColorRGB((int) c.red(), (int) c.green(), (int) c.blue());
    }

    public void setColorRGB(int r, int g, int b) {
        isOn = (r + g + b != 0);
        setRed(r);
        setGreen(g);
        setBlu(b);

        Log.d(TAG, "red set to " + red);
        Log.d(TAG, "green set to " + green);
        Log.d(TAG, "blu set to " + blu);
        Log.d(TAG, "lux is " + lux);

    }

    public String getMessage() {
        return checkZero(red) + ":" + checkZero(green) + ":" + checkZero(blu);
    }

    private String checkZero(int colorPrimary) {
        String color = String.valueOf(colorPrimary);
        if (colorPrimary < 10) {
            color = "00" + color;
        } else if (colorPrimary < 100) {
            color = "0" + color;
        }
        return color;
    }

    public boolean isOn() {
        return isOn;
    } //the led strip
}
