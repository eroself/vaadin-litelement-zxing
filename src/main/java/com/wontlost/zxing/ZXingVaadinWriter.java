package com.wontlost.zxing;

import com.vaadin.flow.component.*;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;

import java.util.Optional;
import java.util.Random;

@Tag("vaadin-zxing-writer")
@JsModule("./vaadin-zxing-writer.js")
@NpmPackage(value = "@zxing/browser", version = "0.0.8")
public class ZXingVaadinWriter extends Component implements HasSize {

    private String value;

    private Integer size;

    private String id;

    public ZXingVaadinWriter() {
        this("zxing-writer");
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
        getElement().setProperty("_id", id==null || id.length()==0? "zxing_"+Math.abs(new Random().nextInt()): id);
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
        getElement().setProperty("value", value);
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
        getElement().setProperty("size", size==null? Integer.valueOf(100): size);
    }

}
