<<<<<<< HEAD
# Vue3 Camera QR Code Reader for Laravel + Vue + ShadCn projects

This laravel component is only applicable to projects made in Laravel + Vue + ShadCn
It functions both as a camera to take pictures and a QR Code Reader. The component contains
1 button that will emit an event whenever it is clicked and output parameters for the picuture URL and file.
And also whenever QRCode is shoved into it, another kind of event will be triggered outputing the text that is
contained in the QR Code.

## Installation To Your Project

```sh
npm install vue3-camera-qrcode-reader
npm install @zxing/browser
```

## Project Use Case

```sh

<script setup lang="ts">

import {ref} from 'vue';
import {Vue3CameraQrcodeReader} from 'vue3-camera-qrcode-reader';

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

</script>

<template>

<Vue3CameraQrcodeReader ref="camera" visible="false" @onTakePicture="handleTakePix" @onEncodeQRCode="handleEncodeQRCode"/>
<Button @click="startCam" >Open Camera</Button>

</template>

```

## Installing to npm package

```sh
```

