import { html, LitElement } from "lit";
import * as ZXing from "@zxing/library";

class VaadinZXingReader extends LitElement {

    constructor() {
        super();
        // ZXing will throw "NotFoundException2: No MultiFormat Readers were able to detect the code." for
        // every frame where there's no QR code. We have to ignore those exceptions in order to not to spam server-side.
        // I'm also frequently getting "DOMException: IndexSizeError : Index or size is negative or greater than the allowed amount",
        // let's also ignore those. See https://github.com/eroself/vaadin-litelement-zxing/issues/20 for more details.
        this.excludes = ['NotFoundException', 'ChecksumException', 'FormatException', 'IndexSizeError'];
        // fix for https://github.com/eroself/vaadin-litelement-zxing/issues/20
        this.excludeMessages = ['No MultiFormat Readers were able to detect the code.'];
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
            excludeMessages: Array,
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

    maybeHandleVideoError(err) {
        // check that the err.name starts with the excluded exceptions. Fixes https://github.com/eroself/vaadin-litelement-zxing/issues/20
        if (err && !this.excludes.some((element) => err.name.startsWith(element)) && !this.excludeMessages.includes(err.message)) {
            console.error("Caught video error: ", err.name, ": ", err.message);
            console.error(err);
            this.$server.setZxingError(err.name, err.message);
        }
    }

    videoDevice(where) {
        this.codeReader.decodeFromVideoDevice(undefined, where, (result, err) => {
            if (result) {
                this.zxingData = result.text;
                this.windowServer(result);
            } else {
                this.maybeHandleVideoError(err);
            }
        }).then(result => {}, reason => {
            this.maybeHandleVideoError(reason);
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
                console.log("error:"+err);
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
            let where = this.querySelector("#"+this.id);
            this.decode(this.from, where);
        }
    }

    reset() {
        this.codeReader.reset();
        window.changeServer = undefined;
        this.decode(this.from, this.querySelector("#"+this.id));
        console.log("reader reset");
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        if(this.from === 'camera') {
            window.changeServer = this.$server;
            console.log("camera updated")
            let where = this.querySelector("#"+this.id);
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
