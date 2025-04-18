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

<style>
@import 'tailwindcss';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans:
    Instrument Sans, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);

  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);

  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);

  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);

  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);

  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);

  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);

  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --color-sidebar: var(--sidebar-background);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

/*
  The default border color has changed to `currentColor` in Tailwind CSS v4,
  so we've added these compatibility styles to make sure everything still
  looks the same as it did with Tailwind CSS v3.

  If we ever want to remove these styles, we need to add an explicit border
  color utility to any element that depends on these defaults.
*/
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
}

@layer utilities {
  body,
  html {
    --font-sans:
      'Instrument Sans', ui-sans-serif, system-ui, sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji';
  }
}

:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(0 0% 3.9%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(0 0% 3.9%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(0 0% 3.9%);
  --primary: hsl(0 0% 9%);
  --primary-foreground: hsl(0 0% 98%);
  --secondary: hsl(0 0% 92.1%);
  --secondary-foreground: hsl(0 0% 9%);
  --muted: hsl(0 0% 96.1%);
  --muted-foreground: hsl(0 0% 45.1%);
  --accent: hsl(0 0% 96.1%);
  --accent-foreground: hsl(0 0% 9%);
  --destructive: hsl(0 84.2% 60.2%);
  --destructive-foreground: hsl(0 0% 98%);
  --border: hsl(0 0% 92.8%);
  --input: hsl(0 0% 89.8%);
  --ring: hsl(0 0% 3.9%);
  --chart-1: hsl(12 76% 61%);
  --chart-2: hsl(173 58% 39%);
  --chart-3: hsl(197 37% 24%);
  --chart-4: hsl(43 74% 66%);
  --chart-5: hsl(27 87% 67%);
  --radius: 0.5rem;
  --sidebar-background: hsl(0 0% 98%);
  --sidebar-foreground: hsl(240 5.3% 26.1%);
  --sidebar-primary: hsl(0 0% 10%);
  --sidebar-primary-foreground: hsl(0 0% 98%);
  --sidebar-accent: hsl(0 0% 94%);
  --sidebar-accent-foreground: hsl(0 0% 30%);
  --sidebar-border: hsl(0 0% 91%);
  --sidebar-ring: hsl(217.2 91.2% 59.8%);
  --sidebar:
    hsl(0 0% 98%);
}

.dark {
  --background: hsl(0 0% 3.9%);
  --foreground: hsl(0 0% 98%);
  --card: hsl(0 0% 3.9%);
  --card-foreground: hsl(0 0% 98%);
  --popover: hsl(0 0% 3.9%);
  --popover-foreground: 0 0% 98%;
  --primary: hsl(0 0% 98%);
  --primary-foreground: hsl(0 0% 9%);
  --secondary: hsl(0 0% 14.9%);
  --secondary-foreground: hsl(0 0% 98%);
  --muted: hsl(0 0% 16.08%);
  --muted-foreground: hsl(0 0% 63.9%);
  --accent: hsl(0 0% 14.9%);
  --accent-foreground: hsl(0 0% 98%);
  --destructive: hsl(0 84% 60%);
  --destructive-foreground: hsl(0 0% 98%);
  --border: hsl(0 0% 14.9%);
  --input: hsl(0 0% 14.9%);
  --ring: hsl(0 0% 83.1%);
  --chart-1: hsl(220 70% 50%);
  --chart-2: hsl(160 60% 45%);
  --chart-3: hsl(30 80% 55%);
  --chart-4: hsl(280 65% 60%);
  --chart-5: hsl(340 75% 55%);
  --sidebar-background: hsl(0 0% 7%);
  --sidebar-foreground: hsl(0 0% 95.9%);
  --sidebar-primary: hsl(360, 100%, 100%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(0 0% 15.9%);
  --sidebar-accent-foreground: hsl(240 4.8% 95.9%);
  --sidebar-border: hsl(0 0% 15.9%);
  --sidebar-ring: hsl(217.2 91.2% 59.8%);
  --sidebar:
    hsl(240 5.9% 10%);
}

@layer base {
    * {
        @apply border-border;
    }

    body {
        @apply bg-background text-foreground;
    }
}

/*
  ---break---
*/

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

</style>