<script setup lang="ts">
import { ref } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/browser';

const emit = defineEmits([
    'onTakePicture',
    'onEncodeQRCode',
]);

const props = defineProps([
    'visible',
])

const showme = ref(props.visible=="true");

// Start Declaration of Web Cam Function to take photo
// find <!-- Start of Web Cam Component --> to see the html component
// find #WebCam to see the css file component. it requires scss
const URL = ref(null);
const FILE = ref(null);
const showcam = ref(showme.value);
const video_ = ref(null);
const canvas_ = ref(null);
const startbutton_ = ref(null);
const streamSrc = ref(null);
const codeReader = ref(null);
const runReaderOnce = ref(false);

const stopVideo = (stream) => {
    stream.getTracks().forEach((track) => {
        if (track.readyState == 'live' && track.kind === 'video') {
            track.stop();
        }
    });
}

const startWebCam = () => {
    let width = 620; // We will scale the photo width to this
    let height = 0; // This will be computed based on the input stream
    let streaming = false;
    let video = null;
    let canvas = null;
    let startbutton = null;
    const startup = () => {
        video = video_.value;
        canvas = canvas_.value;
        startbutton = startbutton_.value;
        navigator.mediaDevices.getUserMedia({
            'video': true,
            'audio': false
        }).then((stream) => {
            streamSrc.value = stream;
            video.srcObject = stream;
            //video.play(); //used by qrcode reading
        }).catch((err) => {
            console.log("An error occurred: " + err);
        });
        video.addEventListener('canplay', (ev) => {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);
                if (isNaN(height)) {
                    height = width * 3/4;
                }
                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);
        startbutton.addEventListener('click', function (ev) {
            takepicture();
            ev.preventDefault();
        }, false);
        clearphoto();
    };
    const clearphoto = () => {
        let context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);
        let data = canvas.toDataURL('image/png');
    };
    const takepicture = () => {
        let context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);
            let data = canvas.toDataURL('image/png');
            URL.value = data;  ///////////////////////////////////////////////// for <img :src="imagURL">
            canvas.toBlob((blob) => {
                FILE.value = blob;  //////////////////////////////////////////// for form.image_file
                emit("onTakePicture",{
                    'URL'  : URL.value,
                    'File' : FILE.value,
                });
            });
        } else {
            clearphoto();
        }
    };
    startup();
};
const startCam = () => {
    if (!runReaderOnce.value){
        startWebCam();
        runReaderOnce.value = true;
        codeReader.value = new BrowserMultiFormatReader();
        codeReader.value.decodeFromVideoDevice(streamSrc.value, 'videoerwyterwgwe', (result: { text: string | null; }, err: string | null) => {
            if (result) {
                if (showcam.value === true){
                    localStorage.setItem("accountnumber_jaed", result.text);
                    //////////////////////////////////////////////////////////// emits callback function
                    emit("onEncodeQRCode",{
                        'QRCode': result.text,
                    });
                    flip();
                }
            }
            if (err && !(err)) {
                console.error(err);
            }
        });
    }
};
// End Declaration of Web Cam Function

const flip = () => {
    startCam();
    showcam.value = !showcam.value;
};

const btnClick = () => {
    showcam.value = !showcam.value;
};

defineExpose({
    flip,
});

/*
// Usage:

import Camera from '@/components/ui/Camera.vue';
const camera = ref(null);

const startCam = () => {
    camera.value.flip();
};

const handleTakePix = (event: { URL: object, File: object }) => {
    imageURL.value = event.URL;   // url
    form.image_file = event.File; // file
};

const handleEncodeQRCode = (event: { QRCode: string }) => {
        console.log(event.QRCode); // QR Code Value in Text/string form
};

    <!-- Start of Web Cam Component -->
    <Camera ref="camera" visible="false" @onTakePicture="handleTakePix" @onEncodeQRCode="handleEncodeQRCode"/>
    <!-- End of Web Cam Component -->
*/
</script>

<template>
<div class="relative" v-show="showcam">
    <div id="WebCam" class="text-white absolute bottom-0 bg-gray-800 p-2 rounded-xl border">
        <div class="text-sm text-center relative">
            <h1 class="text-amber-400 -translate-">
                Active Webcam Video
            </h1>
            <canvas ref="canvas_"
                class="hidden border-4 absolute top-0 left-0 z-0 rounded-lg overflow-hidden">
            </canvas>
            <div class="w-[320px] inline-block border-4 z-10 rounded-lg overflow-hidden">
                <video ref="video_" id="videoerwyterwgwe" class=" border border-black w-[320px] h-[240px]">Video stream not available.</video>
            </div>
            <div class="z-100 -translate-y-0">
                <button ref="startbutton_" @click="btnClick" type="button"
                    class="p-2 rounded-full my-auto text-white bg-green-600 hover:bg-green-400 active:bg-violet-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-instagram-icon lucide-instagram">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>
</template>
