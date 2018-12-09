package rick.com.luci.utility;

import android.graphics.Color;
import android.util.Log;

public class MyColor {

    private final String TAG = "COLOR";
    private int red;
    private int green;
    private int blu;
    private int lux;
    private String colorName;

    public MyColor() {
        red = 0;
        green = 0;
        blu = 0;
        lux = 10;
    }

    public int getRed() {
        return red;
    }

    public int getGreen() {
        return green;
    }

    public int getBlu() {
        return blu;
    }

    public int getLuxRed() {
        return red * lux;
    }

    public int getLuxGreen() {
        return green * lux;
    }

    public int getLuxBlu() {
        return blu * lux;
    }

    public void setLux(int i) {
        if (i > 10) {
            i = 10;
        } else if (i < 0) {
            i = 0;
        }
        lux = i;
    }

    public int getLux() {
        return lux;
    }

    public void setColorByName(String color) {
        Log.d(TAG, "color is "+color);
        switch (color) {
            case "red":
                setColorRGB(25, 0, 0);
                Log.d(TAG, "red");
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
            case "off":
                setColorRGB(0,0,0);
                break;
        }
    }

    public void setColorInt(int val) { //TODO check funcionality
        Color c = Color.valueOf(val);
        Log.d(TAG, "red " + c.red() + " green " + c.green() + " blue " + c.blue());
        setColorRGB((int) c.red(), (int) c.green(), (int) c.blue());
    }

    public void setColorRGB(int r, int g, int b) {
        Log.d(TAG, "r set to " + r);
        Log.d(TAG, "g set to " + g);
        Log.d(TAG, "b set to " + b);
        red = checkInt(r);
        green = checkInt(g);
        blu = checkInt(b);

    }

    public String getRawColor(int r, int b, int g){
        return getRaw(r) + ":" + getRaw(b) + ":" + getRaw(g);
    }

    public String getMessage() {
        return checkZero(red * lux) + ":" + checkZero(green * lux) + ":" + checkZero(blu * lux);
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

    private int checkInt(int check) {
        if (check > 25) {
            check = 25;
        } else if (check < 0) {
            check = 0;
        }
        return check;
    }

    private String getRaw(int check){
        if (check > 255){
            check = 255;
        } else if (check < 0) {
            check = 0;
        }
        return checkZero(check);
    }
}
