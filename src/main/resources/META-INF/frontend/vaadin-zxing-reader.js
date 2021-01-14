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
        return from === 'image' ? this.codeReader.decodeFromImage(undefined, where) :
               this.codeReader.decodeFromVideoUrlContinuously(where);//defaulted to video url
    }

    videoDevice(where){
        this.codeReader.decodeFromVideoDevice(undefined, where, (result, err) => {
            if (result) {
                this.zxingData = result.text;
                if(window.changeServer === undefined) {
                    window.changeServer = this.$server;
                    this.$server.setZxingData(result.text);
                }

            }

            // if (err) {
            //     // As long as this error belongs into one of the following categories
            //     // the code reader is going to continue as excepted. Any other error
            //     // will stop the decoding loop.
            //     //
            //     // Excepted Exceptions:
            //     //
            //     //  - NotFoundException
            //     //  - ChecksumException
            //     //  - FormatException
            //
            //     if (err instanceof Zxing.NotFoundException) {
            //         console.log('No QR code found.');
            //         this.$server.setZxingError(err);
            //     }
            //
            //     if (err instanceof Zxing.ChecksumException) {
            //         console.log('A code was found, but it\'s read value was not valid.')
            //
            //     }
            //
            //     if (err instanceof Zxing.FormatException) {
            //         console.log('A code was found, but it was in a invalid format.')
            //     }
            // }

            if (err && !this.excludes.includes(err.name)) {
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
        window.changeServer = this.$server;
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
