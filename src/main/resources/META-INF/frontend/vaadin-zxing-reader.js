import { html, LitElement } from "lit";
import * as ZXing from "@zxing/library";

class VaadinZXingReader extends LitElement {

    constructor() {
        super();
        this.excludes = ['NotFoundException', 'ChecksumException', 'FormatException'];
        this.codeReader = new ZXing.BrowserMultiFormatReader();
        this.videoElement = undefined;
        this.showScanLine = false;
        this.defaultDeviceId = undefined;
    }

    static get properties() {
        return { id: String,
                 width: String,
                 height: String,
                 from: String,
                 src: String,
                 codeReader: Object,
                 defaultDeviceId: String,
                 showScanLine: Boolean,
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

    windowServer(result) {
        if(window.changeServer === undefined) {
            window.changeServer = this.$server;
            window.changeServer.setZxingData(result.text);
        }
    }

    async decode(from, where) {
        try {
            if(from === 'camera') {
                await this.startScanner(this.defaultDeviceId).then(()=>{console.log("camera updated with device id:"+this.defaultDeviceId)});
            } else {
                const result = await this.getDecoder(from, where);
                this.zxingData = result.text;
                console.log("***************"+this.zxingData);
                this.windowServer(result);
            }
        } catch (err) {
            console.error("Decode error:", err);
            this.$server.setZxingError(err.name, err.message);
        }

    }

    //if image, only update once
    firstUpdated(changedProperties) {
        window.changeServer = this.$server;
        super.firstUpdated(changedProperties);
        this.videoElement = this.querySelector("#"+this.id);
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {ideal: "environment"}
            }
        }).then(stream => {
            this.videoElement.srcObject = stream;  // Set the video stream

            // Only access video tracks after the stream is set
            stream.getVideoTracks().forEach(track => {
                track.applyConstraints({ facingMode: {ideal: "environment"},
                    width: this.videoElement.width,
                    height: this.videoElement.height})
                .then(r => {
                    console.log("Focus mode set successfully to all videos");
                }); // Apply constraints to each video track
            });
        }).catch(error => {
            console.error("Error accessing media devices:", error);
        });

        if(this.from === 'image' || this.from === 'video') {
            this.decode(this.from, this.videoElement).then(()=>console.log("decoded from image/video"));
        } else if(this.from === 'camera'){
            //From camera, initialize settings
            const self = this;
            this.loadDevices().then(()=>{console.debug("devices loaded.")});
            this.querySelector("#zxing-svg-overlay").addEventListener("click", ()=>self.showSettingsPanel());
            this.querySelector("#zxing-video-selector").addEventListener('change', function () {
                self.changeVideoSource(this.value).then(()=>{
                    self.defaultDeviceId = this.value;
                    console.log("Selected video source:", self.defaultDeviceId);
                });
            });
            this.querySelector("#zxing-close").addEventListener("click", ()=>self.hideSettingsPanel());
            this.querySelector("#zxing-scanner-toggle").addEventListener("click", ()=>self.toggleScanner());
            this.querySelector("#zxing-reset").addEventListener("click", ()=>{
                self.reset();
                self.hideSettingsPanel();
            });
        }
    }

    async loadDevices() {
        await this.codeReader.listVideoInputDevices()
            .then(videoInputDevices => {
                if (videoInputDevices === undefined || videoInputDevices.length === 0) {
                    console.warn("No camera found.");
                    this.$server.setZxingError("general", "No camera found.");
                }
                this.defaultDeviceId = videoInputDevices[0].deviceId; //set the 1 camera as default
                if(videoInputDevices.length >= 1) {
                    //Enable select options in settings and user could choose which camera to use
                    this.availableDevices = videoInputDevices;

                    let videoSourceSelector = this.querySelector("#zxing-video-selector");
                    //Clear options before adding new ones
                    videoSourceSelector.innerHTML = '';
                    //Append options to select widget based on videoInputDevices, value is the deviceId.
                    videoInputDevices.forEach(device => {
                        const option = document.createElement('option');
                        option.value = device.deviceId;
                        option.text = device.label || `Camera ${videoInputDevices.indexOf(device) + 1}`;
                        videoSourceSelector.appendChild(option);
                    });
                }
            });
    }

    reset() {
        this.codeReader.reset();
        window.changeServer = undefined;
        this.decode(this.from, this.querySelector("#"+this.id)).then(()=>{
            console.log("reset done for device "+this.defaultDeviceId);
        });
        this.loadDevices().then(()=>{console.log("devices re-loaded.")});
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        if(this.from === 'camera') {
            window.changeServer = this.$server;
            this.startScanner(this.defaultDeviceId).then(()=>{console.log("camera updated")});
        }
    }

    async startScanner(deviceId) {
        await this.codeReader.decodeFromVideoDevice(deviceId,  this.videoElement, (result, err) => {
            if (result) {
                this.zxingData = result.text;
                this.windowServer(result);
            }
            // check that the err.name starts with the excluded exceptions. Fixes https://github.com/eroself/vaadin-litelement-zxing/issues/20
            if (err && !this.excludes.some((element) => err.name.startsWith(element))) {
                console.warn(err);
                this.$server.setZxingError(err.name, err.message);
            }
        }).then(result => {}, reason => {
            console.warn(reason);
            this.$server.setZxingError(reason.name, reason.message);
        });
    }

    stopVideoStream() {
        const stream = this.videoElement.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null; // Clear the current stream
        }
    }

    async changeVideoSource(newDeviceId) {
        if (this.defaultDeviceId === newDeviceId) return;
        this.stopVideoStream();
        this.defaultDeviceId = newDeviceId;
        await this.startScanner(newDeviceId);
    }

    disconnectedCallback() {
        this.codeReader.reset();//reset the reader on disconnected.
        this.stopVideoStream();//stop the video stream on disconnected.
    }

    showSettingsPanel() {
        const panel = this.querySelector('#zxing-settings');
        panel.classList.add('fade-in');
        panel.style.display = 'flex';
    }

    toggleScanner() {
        const checkbox = this.querySelector('#zxing-scanner-toggle');
        const scanner = this.querySelector("#zxing-scanner");
        if (checkbox.checked) {
            scanner.style.display = 'block';
        } else {
            scanner.style.display = 'none';
        }
    }

    hideSettingsPanel() {
        const panel = this.querySelector('#zxing-settings');
        panel.classList.remove('fade-in');
        setTimeout(() => {
            panel.style.display = 'none';
        }, 500);
    }

    render() {
        return html`${this.from==='image'?html`<img 
                          id="${this.id}" 
                          src="${this.src}"
                          alt="qrcode image"
                          width="${this.width}"
                          height="${this.height}"
                          style="${this.zxingStyle}"/>`:html`<div class="zxing-video-wrapper" style="width:${this.width}px;height:${this.height}px"><video
                          id="${this.id}"
                          src="${this.src}"
                          width="${this.width}"
                          height="${this.height}"
                          style="${this.zxingStyle}"></video>
                             <div id="zxing-scanner" class="zxing-scanner-interface" style="display: none">
                                <div class="zxing-scan-line"></div>
                            </div>
                            <svg id="zxing-svg-overlay"  xmlns="http://www.w3.org/2000/svg"
                                 width="15px" height="15px" viewBox="0 0 15 15">
                                <g transform="translate(0.000000,15.000000) scale(0.001171875,-0.0011731875)"
                                   fill="#000000" stroke="none">
                                    <path d="M7235 12766 c-16 -8 -42 -26 -56 -42 -14 -16 -153 -267 -309 -559
                                    -156 -291 -298 -553 -316 -582 -53 -84 -49 -83 -328 -94 l-247 -11 -53 26
                                    c-53 26 -59 34 -416 549 -200 287 -373 536 -386 553 -29 39 -80 64 -132 64
                                    -43 0 -1174 -376 -1213 -403 -58 -41 -70 -89 -59 -235 24 -296 71 -892 81
                                    -1029 l12 -153 -29 -57 c-28 -55 -38 -64 -234 -200 -113 -78 -221 -147 -240
                                    -153 -82 -24 -92 -21 -736 246 -661 274 -642 267 -720 232 -38 -18 -781 -942
                                    -796 -990 -8 -29 -8 -48 0 -77 8 -25 152 -223 402 -552 338 -446 391 -521 401
                                    -564 14 -65 14 -65 -116 -375 -115 -277 -141 -316 -219 -344 -23 -8 -324 -66
                                    -671 -128 -660 -118 -663 -119 -707 -179 -52 -70 -181 -1268 -139 -1293 6 -4
                                    293 -110 637 -236 344 -126 640 -238 657 -248 66 -38 81 -81 141 -413 31 -169
                                    56 -328 56 -355 0 -31 -9 -65 -23 -91 -15 -29 -167 -177 -492 -479 -259 -240
                                    -479 -451 -490 -467 -13 -21 -19 -47 -18 -81 0 -46 25 -97 255 -544 141 -271
                                    268 -506 283 -522 14 -15 45 -33 68 -39 39 -11 87 -2 667 129 654 148 677 151
                                    750 117 39 -19 504 -499 532 -549 38 -70 36 -90 -66 -488 -235 -917 -230 -897
                                    -217 -940 6 -22 22 -51 34 -65 12 -14 242 -149 511 -300 443 -249 494 -275
                                    535 -275 27 0 59 8 76 18 17 11 230 222 475 471 245 249 461 461 482 471 73
                                    39 93 37 459 -45 189 -42 355 -83 368 -92 69 -45 73 -54 286 -694 201 -603
                                    207 -619 245 -653 22 -20 55 -38 77 -42 91 -17 658 19 1020 65 164 21 199 38
                                    227 113 9 24 75 322 146 662 86 406 137 630 149 650 39 62 68 77 373 193 329
                                    126 371 135 444 96 18 -10 248 -191 510 -403 263 -212 491 -393 508 -403 22
                                    -13 45 -17 83 -14 51 3 62 11 349 228 583 441 638 484 657 511 11 14 22 48 24
                                    75 5 44 -15 102 -227 658 -128 336 -235 626 -237 645 -10 69 13 112 173 332
                                    86 117 166 224 178 236 35 39 95 65 151 64 27 0 326 -30 663 -67 l612 -66 43
                                    19 c23 11 50 28 60 39 14 16 364 954 422 1131 22 65 8 120 -43 172 -20 21
                                    -268 208 -551 416 -508 373 -514 378 -539 433 l-25 55 12 215 c16 281 18 294
                                    55 348 30 43 53 56 613 337 321 161 590 299 599 306 22 19 54 85 54 112 0 42
                                    -259 1217 -275 1248 -9 17 -32 41 -53 55 -42 27 1 24 -1013 89 -389 25 -396
                                    27 -455 83 -43 41 -223 380 -230 434 -4 27 0 60 8 84 8 22 162 289 342 593
                                    314 528 328 554 328 602 -1 27 -7 60 -14 74 -13 25 -850 884 -898 921 -15 12
                                    -45 21 -80 23 l-57 4 -564 -313 c-310 -172 -582 -319 -604 -327 -69 -24 -114
                                    -9 -300 95 -188 105 -208 120 -237 177 -26 50 -25 37 -49 751 -20 590 -21 611
                                    -43 655 -37 75 36 53 -984 296 -172 40 -323 74 -335 74 -12 -1 -35 -7 -52 -14z
                                    m-385 -2650 c275 -36 503 -87 740 -166 1259 -416 2223 -1500 2484 -2792 57
                                    -283 70 -419 70 -748 1 -310 -4 -386 -45 -635 -192 -1169 -955 -2197 -2024
                                    -2725 -405 -200 -755 -305 -1245 -372 -153 -21 -711 -17 -880 5 -874 119
                                    -1636 499 -2230 1113 -849 878 -1212 2088 -990 3300 146 797 579 1558 1196
                                    2103 609 537 1352 856 2169 930 151 14 608 6 755 -13z"/>
                                </g>
                            </svg>
                            <div id="zxing-settings" style="display: none;">
                                <button id="zxing-close">✖</button>

                                <div class="zxing-setting-content">
                                    <label>
                                        <input type="checkbox" id="zxing-scanner-toggle"> Show Scanner
                                    </label>
                                    
                                    <label for="zxing-video-selector">Video Source</label>
                                    <select id="zxing-video-selector" class="zxing-select">
                                    </select>
                                </div>

                                <button id="zxing-reset">Reset Reader</button>
                            </div>
                          </div>`}`;
    }

}

customElements.get('vaadin-zxing-reader') || customElements.define('vaadin-zxing-reader', VaadinZXingReader);
