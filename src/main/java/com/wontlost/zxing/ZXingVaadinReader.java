package com.wontlost.zxing;

import com.vaadin.flow.component.*;
import com.vaadin.flow.component.customfield.CustomField;
import com.vaadin.flow.component.dependency.JsModule;

import java.io.Serializable;
import java.util.Optional;
import java.util.Random;

import com.vaadin.flow.component.dependency.NpmPackage;
import com.vaadin.flow.function.SerializableConsumer;
import com.wontlost.zxing.Constants.*;

@Tag("vaadin-zxing-reader")
@JsModule("./vaadin-zxing-reader.js")
@NpmPackage(value = "@zxing/library", version = "^0.20.0")
public class ZXingVaadinReader extends CustomField<String> {

    private String zxingData;

    private DOMError zxingError;

    /**
     * Invoked whenever ZXing reports an error. You must assume that the video stream has stopped;
     * the best thing is to show an appropriate error notification to the user and possibly
     * restart the streaming via {@link #reset()}.
     */
    public SerializableConsumer<DOMError> onZxingErrorListener = e -> {};

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

    public static class DOMError implements Serializable {
        /**
         * This is NotAllowedError if the access is rejected by the user. For other names, please check
         * <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia">getUserMedia()</a>
         */
        public final String name;
        public final String message;

        public DOMError(String name, String message) {
            this.name = name;
            this.message = message;
        }

        @Override
        public String toString() {
            return "DOMError{" + name + ": " + message + "}";
        }
    }

    @ClientCallable
    private void setZxingError(String type, String message) {
        this.zxingError = new DOMError(type, message);
        onZxingErrorListener.accept(zxingError);
    }

    /**
     * Restarts the decoding process.
     */
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

    public void setFrom(From from) {
        getElement().setProperty("from", from.name());
        //if(From.camera.equals(from)) { //id needs to be 'video'
        //    this.setId("video");
        //}
    }

    public DOMError getZxingError() {
        return this.zxingError;
    }
}
