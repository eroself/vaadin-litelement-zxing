package com.wontlost.zxing;

import com.github.javaparser.quality.NotNull;
import com.vaadin.flow.component.*;
import com.vaadin.flow.component.customfield.CustomField;
import com.vaadin.flow.component.dependency.JsModule;

import java.util.Optional;
import java.util.Random;

import com.vaadin.flow.component.dependency.NpmPackage;
import com.wontlost.zxing.Constants.*;

@Tag("vaadin-zxing-reader")
@JsModule("./vaadin-zxing-reader.js")
@NpmPackage(value = "@zxing/library", version = "^0.21.3")
public class ZXingVaadinReader extends CustomField<String> {

    private String zxingData;

    private String zxingError;

    private String id;

    private final Random random = new Random();

    public ZXingVaadinReader() {
        this(null);
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
        if(id == null || id.trim().length()==0) {
            id = "zxing_"+Math.abs(random.nextInt(20480));
        }
        this.id = id;
        getElement().setProperty("id", id);
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

    public void reset() {
        getElement().callJsFunction("reset");
    }

    @Override
    public void setWidth(String width) {
        super.setWidth(width);
        getElement().setProperty("width", width==null ? "100%" : width);
    }

    public void setSrc(String src) {
        getElement().setProperty("src", src);
    }

    public void setReadOnly(boolean readOnly) {
        //do nothing
    }

    /**
     * Make component readonly always
     * @return true
     */
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

    public void setFrom(@NotNull From from) {
        getElement().setProperty("from", from.name());
    }

    public String getZxingError() {
        return this.zxingError;
    }

}
