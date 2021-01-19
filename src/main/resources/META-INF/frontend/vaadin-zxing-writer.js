import { LitElement } from "lit-element";
import * as ZXing from "@zxing/library";

class VaadinZXingWriter extends LitElement {

    static get properties() {
        return { _id: String,
                 value: String,
                 size: Number
                };
    }

    createRenderRoot() {
        return this;
    }

    firstUpdated(changedProperties) {
        super.updated(changedProperties);
        this.id = this._id;
        let codeWriter = new ZXing.BrowserQRCodeSvgWriter();
        codeWriter.writeToDom(this, this.value, this.size, this.size);
    }

}

customElements.get('vaadin-zxing-writer') || customElements.define('vaadin-zxing-writer', VaadinZXingWriter);
