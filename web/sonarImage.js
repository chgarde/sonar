var sonarImage = (function () {
    'use strict';

    var maxDistance = 40.0;
    var canvas, ctx, ctx, audio;
    var detected = Array(360);
    var lastPlayedAudioAngle = 0;
    var fadeSonarLines = function () {
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
            pixels = imageData.data,
            fadeStep = 1,
            green,
            fadedGreen;

        for (var i = 0; i < pixels.length; i += 4) {
            green = pixels[i + 1];

            fadedGreen = green - fadeStep;
            pixels[i + 1] = fadedGreen;
        }

        ctx.putImageData(imageData, 0, 0);
    };

    return {
        // clear: function () {
        //     ctx.strokeStyle = '#00FF00';
        //     ctx.fillStyle = "#000000";
        //     ctx.translate(-canvas.width / 2, 0);
        //     ctx.fillRect(0, 0, canvas.width, canvas.height);
        //     ctx.translate(canvas.width / 2, 0);
        // },
        init: function (canvasId) {
            canvas = document.getElementById(canvasId);
            ctx = canvas.getContext('2d');
            console.log(canvas.width)
            ctx.lineWidth = 1;


        },
        drawRange(angle, distance) {
            ctx.save();

            ctx.translate(canvas.width / 2, canvas.height );
            ctx.rotate(-Math.PI / 2 + angle * Math.PI / 180);

            var a = 30 * Math.PI / 180;
            ctx.strokeStyle = '#00FF00';
            ctx.beginPath();
            const grad = ctx.createRadialGradient(1.2 * canvas.height , 0, 0, canvas.height , 0, canvas.height );
            grad.addColorStop(0, "lightgreen");
            grad.addColorStop(1, "black");
            ctx.fillStyle = grad;
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, canvas.height , -a / 2, a / 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

        },
        drawDetected(angle, distance) {
            
            if (distance > 0 && distance < maxDistance) {
                if (detected[90 + angle] == null) {
                    detected[90 + angle] = {};
                }
                detected[90 + angle]["lum"] = 100;
                detected[90 + angle]["dist"] = distance;
                if (Math.abs(lastPlayedAudioAngle - angle) > 10) {
                    detected[90 + angle]["audio"] = new Audio('audio.mp3');
                    detected[90 + angle]["audio"].play();
                    lastPlayedAudioAngle = angle;
                }

            }

            for (var i = 0; i < 360; i++) {

                if (detected[i] != null && detected[i]["lum"] > 1) {
                    var a = i - 90;
                    ctx.save();
                    ctx.translate(canvas.width / 2, canvas.height );
                    ctx.rotate(a * Math.PI / 180);
                    ctx.fillStyle = `rgb(0,${255 * detected[i]["lum"] / 100},0)`;
                    ctx.beginPath();
                    ctx.arc(0, -(canvas.height*detected[i]["dist"]/maxDistance), 10 * detected[i]["lum"] / 100, 0, 2 * Math.PI, true);
                    ctx.fill();
                    ctx.restore();
                    detected[i]["lum"] = detected[i]["lum"] - 1;
                }
            }

        },
        drawBackground() {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height );
            ctx.rotate(Math.PI / 2);
            var meridians = 6;
            ctx.beginPath();
            for (let i = 0; i < meridians + 1; i += 1) {
                ctx.strokeStyle = "#00FF00";
                ctx.fillStyle = "#00FF00";
                ctx.moveTo(0, 0);
                ctx.lineTo(0, canvas.height);

                ctx.rotate(Math.PI / meridians);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            var parallels = 6;
            for (let i = 0; i < parallels + 1; i += 1) {
                ctx.strokeStyle = "#00FF00";
                ctx.fillStyle = "#00FF00";
                ctx.moveTo(0, 0);
                ctx.beginPath();
                ctx.arc(0, 0, i * (canvas.height / parallels), 0, 2 * Math.PI);
                ctx.stroke();
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        },
        draw: function (angle, distance) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            this.drawRange(angle, distance);
            this.drawDetected(angle, distance);
            this.drawBackground();
        }
    }
}());