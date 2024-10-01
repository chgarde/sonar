import { parseJsonStream, streamToIterable } from "json-stream-es";

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export const sonarConnection = (function () {
    'use strict';

    var startTime, numberOfMessages, numberOfSamples, c;

    var processSonarData = function (sonarData) {
        numberOfMessages++;
        $.each(sonarData, function (index, item) {
            numberOfSamples++;
            sonarImage.draw(item.angle, item.distance);
            //console.log(item)
            sonarStats.fillTable(item.angle, item.distance, startTime, numberOfMessages, numberOfSamples);
        });
    };

    return {
        init: async function () {
            startTime = new Date();
            numberOfMessages = 0;
            numberOfSamples = 0;

            // https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API
            // https://github.com/UnJavaScripter/web-serial-example/blob/master/src/serial-handler.ts
            navigator.serial.addEventListener("connect", (e) => {
                // Connect to `e.target` or add it to a list of available ports.
                console.log('connect event')
            });

            navigator.serial.addEventListener("disconnect", (e) => {
                // Remove `e.target` from the list of available ports.
                console.log('disconnect event')
            });

            navigator.serial.getPorts().then((ports) => {
                // Initialize the list of available ports with `ports` on page load.
            });
            var button = document.getElementsByTagName('button')[0]
            button.addEventListener("click", () => {
                const usbVendorId = 0x2a03;
                let decoder = new TextDecoder("utf-8");
                navigator.serial
                    .requestPort({
                        filters: [{
                            usbVendorId
                        }]
                    })
                    .then((port) => {
                        port.open({
                            baudRate: 115200
                        }).then(async () => {
                            await new Promise(r => setTimeout(r, 2000));
                            //          Connect to `port` or add it to the list of available ports.
                            // on attend d'avoir une lecture qui se termine par un '}' 
                            // pour que la suite puisse démarrer la lecture sur un JSON qui commence par '{'
                            console.log("start reading serial port")
                            const reader = port.readable.getReader();
                            console.log("got reader")
                            try {
                                while (true) {
                                    const {
                                        value,
                                        done
                                    } = await reader.read();
                                    if (done) {
                                        // |reader| has been canceled.
                                        console.log("reader has ben cancelled")
                                        break;
                                    } else {
                                        var res = decoder.decode(value);
                                        if (res.endsWith("}")) {
                                            reader.releaseLock();
                                            break;
                                        }
                                    }
                                }
                            }catch(error){
                                console.log("oups");
                                console.log(error);
                                port.close();
                                throw(error);
                            }
                            // lecture de la stream "propre"
                            const stream = port.readable
                                .pipeThrough(new TextDecoderStream())
                                // TODO : rajouter le filtrage du junk ici
                                .pipeThrough(parseJsonStream(undefined, { multi: true }));


                            for await (const value of streamToIterable(stream)) {
                                const t = [];
                                t.push(value);
                                processSonarData(t);

                            }


                        })
                    }
                    )
                    .catch((e) => {
                        console.log("user didn't select a port.");
                        // The user didn't select a port.

                    })
            })

            //const t = [];
            //t.push({ "angle": -90, "distance": ((c == 30 || c == 40) ? 250 : 600) });
            //t.push({ "angle": 45, "distance": 250 });
            //processSonarData(t);            
            // while (true) {
            //     for (c = -90; c < 90; c++) {
            //         const t = [];
            //         //t.push({ "angle": c, "distance": getRandomInt(200) });
            //         t.push({ "angle": c, "distance": ((c == 30 || c == 40) ? 250 : 600) });
            //         processSonarData(t);
            //         await new Promise(r => setTimeout(r, 20));
            //     }
            //     for (c = 90; c > -90; c--) {
            //         const t = [];
            //         //t.push({ "angle": c, "distance": getRandomInt(200) });
            //         t.push({ "angle": c, "distance": ((c == 30 || c == 40) ? 250 : 600) });
            //         processSonarData(t);
            //         await new Promise(r => setTimeout(r, 20));
            //     }

            // }



        }
    };
}());

