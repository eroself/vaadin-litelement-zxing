import { html, LitElement } from "lit-element";
import * as ZXing from "@zxing/library";

class VaadinZXingReader extends LitElement {

    constructor() {
        super();
        this.excludes = ['NotFoundException', 'ChecksumException', 'FormatException'];
        this.codeReader = new ZXing.BrowserMultiFormatReader();
    }

    static get properties() {
        return { id: String,
                 width: String,
                 height: String,
                 from: String,
                 src: String,
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
               this.codeReader.decodeFromVideo(where);//defaulted to video url
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
                console.log("***************"+this.zxingData);
                this.windowServer(result);
            }).catch(err => {
                this.$server.setZxingError(err);
            });
        }
    }

    //if image, only update once
    firstUpdated(changedProperties) {
        window.changeServer = this.$server;
        super.firstUpdated(changedProperties);
        if(this.from === 'image' || this.from === 'video') {
            console.log("image/video updated")
            let where = document.querySelector("#"+this.id);
            this.decode(this.from, where);
        }
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        if(this.from === 'camera') {
            window.changeServer = this.$server;
            console.log("camera updated")
            let where = document.querySelector("#"+this.id);
            this.videoDevice(where);
        }
    }

    disconnectedCallback() {
        this.codeReader.reset();//reset the reader on disconnected.
    }

    render() {
        return html`${this.from==='image'?html`<img 
                          id="${this.id}" 
                          src="${this.src}"
                          alt="qrcode image"
                          width="${this.width}"
                          height="${this.height}"
                          style="${this.zxingStyle}"/>`:html`<video
                          id="${this.id}"
                          src="${this.src}"
                          width="${this.width}"
                          height="${this.height}"
                          style="${this.zxingStyle}"/>`}`;
    }

}

customElements.get('vaadin-zxing-reader') || customElements.define('vaadin-zxing-reader', VaadinZXingReader);
