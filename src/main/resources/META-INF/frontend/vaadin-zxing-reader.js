import { html, LitElement } from "lit-element";
import * as ZXing from "@zxing/library";

class VaadinZXingReader extends LitElement {

    constructor() {
        super();
        this.zxingData = '';
        this.excludes = ['NotFoundException', 'ChecksumException', 'FormatException'];
        this.codeReader = new ZXing.BrowserMultiFormatReader();
    }

    static get properties() {
        return { id: String,
                 width: String,
                 height: String,
                 from: String,
                 imageSrc: String,
                 codeReader: Object,
                 excludes: Array,
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
        return from === 'image' ? this.codeReader.decodeFromImage(where) :
               this.codeReader.decodeFromVideoUrlContinuously(where);//defaulted to video url
    }

    videoDevice(where){
        this.codeReader.decodeFromVideoDevice(undefined, where, (result, err) => {
            if (result) {
                this.zxingData = result.text;
                this.windowServer(result);
            }

            if (err && !this.excludes.includes(err.name)) {
                this.$server.setZxingError(err);
            }
        });
    }

    windowServer(result) {
        if(window.changeServer === undefined) {
            window.changeServer = this.$server;
            window.changeServer.setZxingData(result.text);
        }
    }


    decode(from, where) {
        if(from === 'camera') {
            this.videoDevice(where);
        } else {
            this.getDecoder(from, where).then(result => {
                this.zxingData = result.text;
                this.windowServer(result);
            }).catch(err => {
                this.$server.setZxingError(err);
            });
        }
    }

    updated(changedProperties) {
        window.changeServer = this.$server;
        super.updated(changedProperties);
        console.log("updated")
        let where = document.querySelector("#"+this.id);
        this.decode(this.from, where);
    }

    render() {
        return html`${this.from==='image'?html`<img 
                          id="${this.id}" 
                          src="${this.imageSrc}"
                          alt="qrcode image"
                          width="${this.width}"
                          height="${this.height}"
<!--                          crossOrigin = "" for cross origin issue -->
                          style="${this.zxingStyle}"/>`:html`<video
                          id="${this.id}"
                          width="${this.width}"
                          height="${this.height}"
                          style="${this.zxingStyle}"/>`}`;
    }

}

customElements.get('vaadin-zxing-reader') || customElements.define('vaadin-zxing-reader', VaadinZXingReader);
