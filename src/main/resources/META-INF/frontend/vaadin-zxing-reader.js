import { html, LitElement } from "lit-element";
import { BrowserQRCodeReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';

class VaadinZXingReader extends LitElement {

    static get properties() {
        return { id: String,
                 width: String,
                 height: String,
                 zxingStyle: String,
                 from: String
                };
    }

    createRenderRoot() {
        return this;
    }

    getDecoder(from, where) {
        let codeReader = new BrowserQRCodeReader();
        return from === 'image' ? codeReader.decodeFromImage(undefined, where) :
               codeReader.decodeFromVideoUrlContinuously(where);//defaulted to video url
    }

    videoDevice(codeReader, where){
        codeReader.decodeFromVideoDevice(undefined, where, (result, err) => {
            if (result) {
                console.log(result);
                this.$server.setValue(result.text);
            }
            if (err && err.name !== 'NotFoundException') {
                console.error(err);
                this.$server.setError(err);
            }
        });
    }


    decode(from, where) {
        if(from === 'camera') {
            this.videoDevice(new BrowserQRCodeReader(), where);
        } else {
            this.getDecoder(from, where).then(result => {
                console.log(result.text);
                this.$server.setValue(result.text);
            }).catch(err => {
                console.error(err);
                this.$server.setError(err);
            });
        }
    }

    firstUpdated(changedProperties) {
        super.updated(changedProperties);
        let where = document.querySelector("#"+this.id);
        this.decode(this.from, where);
    }

    render() {
        return html`<video
                      id="${this.id}"
                      width="${this.width}"
                      height="${this.height}"
                      style="${this.zxingStyle}"/>`;
    }

}

customElements.get('vaadin-zxing-reader') || customElements.define('vaadin-zxing-reader', VaadinZXingReader);
