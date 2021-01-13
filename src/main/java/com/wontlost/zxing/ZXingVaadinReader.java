package com.wontlost.zxing;

import com.vaadin.flow.component.*;
import com.vaadin.flow.component.customfield.CustomField;
import com.vaadin.flow.component.dependency.JsModule;

import java.util.Optional;
import java.util.Random;

@Tag("vaadin-zxing-reader")
@JsModule("./vaadin-zxing-reader.js")
public class ZXingVaadinReader extends CustomField<String> {

    private String zxingData;

    private String zxingError;

    private String id;

    public ZXingVaadinReader() {
        this("zxing-reader");
    }

    public ZXingVaadinReader(String id) {
        setId(id);
    }

    @Override
    protected String generateModelValue() {
        return zxingData;
    }

    @Override
    protected void setPresentationValue(String newPresentationValue) {
        this.zxingData = newPresentationValue;
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
        return zxingData;
    }

    public void setValue(String zxingData) {
        super.setValue(zxingData);
        this.zxingData = zxingData;
        getElement().setProperty("zxingData", zxingData);
    }

    protected void setModelValue(String value, boolean fromClient){
        super.setModelValue(value, fromClient);
        String oldEditorData = this.zxingData;
        this.zxingData = value;
        fireEvent(new ComponentValueChangeEvent<>(this, this, oldEditorData, fromClient));
    }

    @ClientCallable
    private void setZxingData(String zxingData) {
        setModelValue(zxingData, true);
    }

    @ClientCallable
    private void setZxingError(String error) {
        this.zxingError = error;
    }

    @Override
    public void setWidth(String width) {
        super.setWidth(width);
        getElement().setProperty("width", width==null ? "100%" : width);
    }

    public void setReadOnly(boolean readOnly) {
        //do nothing
    }

    public boolean isReadOnly() {
        return true;
    }

    @Override
    public void setHeight(String height) {
        super.setHeight(height);
        getElement().setProperty("height", height==null ? "100%" : height);
    }

    public void setStyle(String style) {
        getElement().setProperty("zxingStyle", style);
    }

    public void setFrom(String from) {
        getElement().setProperty("from", from);
    }

}
