import { html, LitElement } from "lit-element";
import { BrowserQRCodeSvgWriter } from '@zxing/browser';
import '@zxing/library';

class VaadinZXingWriter extends LitElement {

    static get properties() {
        return { id: String,
                 size: Number, //square, size of video window / size of generate QR code
                 from: String, //camera, image, video
                 zxingStyle: String
                };
    }

    createRenderRoot() {
        return this;
    }

    firstUpdated(changedProperties) {
        super.updated(changedProperties);
        let where = document.querySelector("#"+this.id);
        this.decode(this.from, where);
    }

    render() {
        return html`<video
                      id="${this.id}"
                      width="${this.size}"
                      height="${this.size}"
                      style="${this.zxingStyle}"/>`;
    }

}

customElements.get('vaadin-zxing-reader') || customElements.define('vaadin-zxing-reader', VaadinZXingReader);
