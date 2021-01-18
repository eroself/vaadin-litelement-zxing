import { html, LitElement } from "lit-element";
import { BrowserQRCodeSvgWriter } from '@zxing/browser';

class VaadinZXingWriter extends LitElement {

    static get properties() {
        return { id: String,
                 value: String,
                 size: Number
                };
    }

    createRenderRoot() {
        return this;
    }

    firstUpdated(changedProperties) {
        super.updated(changedProperties);
        let codeWriter = new BrowserQRCodeSvgWriter();
        codeWriter.writeToDom(document.querySelector("#"+this.id), this.value, this.size, this.size);
    }

    render() {
        return html`<div id="${this.id}"></div>`;
    }

}

customElements.get('vaadin-zxing-writer') || customElements.define('vaadin-zxing-writer', VaadinZXingWriter);
