package com.wontlost.zxing;

import com.vaadin.flow.component.*;
import com.vaadin.flow.component.dependency.JsModule;

import java.util.Optional;
import java.util.Random;

@Tag("vaadin-zxing-reader")
@JsModule("./vaadin-zxing-reader.js")
public class ZXingVaadinWriter extends Component implements HasSize, HasStyle{

    private String value;

    private String zxingStyle;

    private Integer size;

    private String id;

    public ZXingVaadinWriter() {
        this("zxing-reader");
    }

    public ZXingVaadinWriter(String id) {
        setId(id);
    }

    @Override
    public Optional<String> getId() {
        return Optional.ofNullable(id);
    }

    @Override
    public void setId(String id) {
        this.id = id;
        getElement().setProperty("id", id==null || id.length()==0? "zxing_"+Math.abs(new Random().nextInt()): id);
    }

    public String getValue() {
        return value;
    }

    @ClientCallable
    private void setValue(String value) {
        this.value = value;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
        getElement().setProperty("size", size==null? Integer.valueOf(100): size);
    }

    public String getZxingStyle() {
        return zxingStyle;
    }

    public void setZxingStyle(String zxingStyle) {
        this.zxingStyle = zxingStyle;
        getElement().setProperty("zxingStyle", zxingStyle);
    }

}
