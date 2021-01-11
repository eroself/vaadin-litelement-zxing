package com.wontlost.zxing;

import com.vaadin.flow.component.*;
import com.vaadin.flow.component.dependency.JsModule;

import java.util.Optional;
import java.util.Random;

@Tag("vaadin-zxing-reader")
@JsModule("./vaadin-zxing-reader.js")
public class ZXingVaadinReader extends Component implements HasSize {

    private String value;

    private String error;

    private String id;

    public ZXingVaadinReader() {
        this("zxing-reader");
    }

    public ZXingVaadinReader(String id) {
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

    @ClientCallable
    private void setError(String error) {
        this.error = error;
    }

    @Override
    public void setWidth(String width) {
        HasSize.super.setWidth(width);
        getElement().setProperty("width", width==null ? "100%" : width);
    }

    @Override
    public void setHeight(String height) {
        HasSize.super.setHeight(height);
        getElement().setProperty("height", height==null ? "100%" : height);
    }

    public void setStyle(String style) {
        getElement().setProperty("zxingStyle", style);
    }

    public void setFrom(String from) {
        getElement().setProperty("from", from);
    }

}
