import { html, LitElement } from "lit-element";
import { BrowserQRCodeReader } from '@zxing/browser';
import '@zxing/library';

class VaadinZXingReader extends LitElement {

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

    getDecoder(from, where) {
        let codeReader = new BrowserQRCodeReader()
        return from === 'camera' ? codeReader.decodeOnceFromVideoDevice(undefined, where) :
               from === 'image' ? codeReader.decodeFromImage(undefined, where) :
               codeReader.decodeFromVideoUrl(where);//defaulted to video url
    }


    decode(from, where) {
        this.getDecoder(from, where).then(result => {
            console.log(result.text);
            this.$server.setValue(result.text);
        }).catch(err => console.error(err));
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
