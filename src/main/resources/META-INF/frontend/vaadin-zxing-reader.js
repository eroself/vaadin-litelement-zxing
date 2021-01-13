import { html, LitElement } from "lit-element";
import { BrowserQRCodeReader } from '@zxing/browser';

class VaadinZXingReader extends LitElement {

    static get properties() {
        return { id: String,
                 width: String,
                 height: String,
                 from: String,
                 zxingStyle: String,
                 zxingData:{
                     type: String,
                     hasChanged(newVal, oldVal) {
                         if (newVal !== oldVal) {
                             console.log(`${newVal} != ${oldVal}. hasChanged: true.`);
                             if(window.changeServer !== undefined) {
                                 window.changeServer.setZxingData(newVal);
                             }
                             return true;
                         } else {
                             console.log(`${newVal} == ${oldVal}. hasChanged: false.`);
                             return false;
                         }
                     }
                 }
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

    videoDevice(where){
        new BrowserQRCodeReader().decodeFromVideoDevice(undefined, where, (result, err) => {
            if (result) {
                this.zxingData = result.text;
                window.changeServer = this.$server;
            }
            if (err && err.name !== 'NotFoundException' && err.name !== 'ChecksumException') {
                console.error(err);
                this.$server.setZxingError(err);
            }
        });
    }


    decode(from, where) {
        if(from === 'camera') {
            this.videoDevice(where);
        } else {
            this.getDecoder(from, where).then(result => {
                console.log(result.text);
                this.zxingData = result.text;
                this.$server.setValue(result.text);
            }).catch(err => {
                console.error(err);
                this.$server.setError(err);
            });
        }
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        console.log("updated")
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
