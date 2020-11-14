"use strict";
class Color {
    constructor(r = 0, g = 0, b = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    toString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
    static add(col1, col2) {
        return new Color(col1.r + col2.r, col1.g + col2.g, col1.b + col2.b);
    }
    static subtract(col1, col2) {
        return new Color(col1.r - col2.r, col1.g - col2.g, col1.b - col2.b);
    }
    static divide(col1, col2) {
        return new Color(col1.r / col2.r, col1.g / col2.g, col1.b / col2.b);
    }
    static multiply(col1, col2) {
        return new Color(col1.r * col2.r, col1.g * col2.g, col1.b * col2.b);
    }
}
class Bitmap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.pixels = [];
        for (let i = 0; i < width * height; i++) {
            this.pixels.push(new Color());
        }
    }
    putPixel(x, y, col) {
        this.pixels[x + y * this.width] = col;
    }
}
class Canvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.pixels = [];
        for (let i = 0; i < width * height; i++) {
            this.pixels.push(new Color());
        }
    }
    clear(col) {
        for (let i = 0; i < this.width * this.height; i++) {
            this.pixels[i] = col;
        }
    }
    draw(canvas) {
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, this.width, this.height);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let i = x + y * this.width;
                context.fillStyle = this.pixels[i].toString();
                context.fillRect(10 * x, 10 * y, 10, 10);
            }
        }
    }
    fadeIn(canvas) {
        let adders = new Array();
        for (let i = 0; i < this.width * this.height; i++) {
            adders.push(Color.divide(Color.subtract(new Color(255, 255, 255), this.pixels[i]), new Color(16, 16, 16)));
        }
        let i = 0;
        let interval = setInterval(() => {
            if (i++ >= 16) {
                clearInterval(interval);
                return;
            }
            for (let i = 0; i < this.width * this.height; i++) {
                this.pixels[i] = Color.add(this.pixels[i], adders[i]);
            }
            this.draw(canvas);
        }, 100);
    }
    fadeOut(canvas) {
        let adders = new Array();
        for (let i = 0; i < this.width * this.height; i++) {
            adders.push(Color.divide(this.pixels[i], new Color(16, 16, 16)));
        }
        let i = 0;
        let interval = setInterval(() => {
            if (i++ >= 16) {
                clearInterval(interval);
                return;
            }
            for (let i = 0; i < this.width * this.height; i++) {
                this.pixels[i] = Color.subtract(this.pixels[i], adders[i]);
            }
            this.draw(canvas);
        }, 100);
    }
    scrollLeft() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width - 1; x++) {
                this.pixels[x + y * this.width] = this.pixels[(x + y * this.width) + 1];
            }
            this.pixels[this.width - 1 + y * this.width] = new Color();
        }
    }
    scrollRight() {
        for (let y = 0; y < this.height; y++) {
            for (let x = this.width - 1; x >= 0; x--) {
                this.pixels[x + y * this.width] = this.pixels[(x + y * this.width) - 1];
            }
            this.pixels[0 + y * this.width] = new Color();
        }
    }
    putPixel(x, y, col) {
        this.pixels[x + y * this.width] = col;
    }
    line(x1, y1, x2, y2, col) {
        if (x1 > x2) {
            let temp = x1;
            x1 = x2;
            x2 = temp;
        }
        if (y1 > y2) {
            let temp = y1;
            y1 = y2;
            y2 = temp;
        }
        // Bresenham's Line Algorithm
        // https://classic.csunplugged.org/wp-content/uploads/2014/12/Lines.pdf
        // https://www.thecrazyprogrammer.com/2017/01/bresenhams-line-drawing-algorithm-c-c.html
        let dx = x2 - x1;
        let dy = y2 - y1;
        let P = 2 * dy - dx;
        let currentX = x1;
        let currentY = y1;
        while (currentX < x2) {
            if (P >= 0) {
                P += 2 * dy - 2 * dx;
                currentY++;
                this.putPixel(currentY, currentX, col);
            }
            else {
                this.putPixel(currentY, currentX, col);
                P += 2 * dy;
            }
            currentX++;
        }
    }
    circle(x, y, radius, col) {
        for (let i = 0; i < 360; i++) {
            // Enhetscirkel, stulen från Christoffer
            this.putPixel(Math.round(Math.cos(i) * radius) + x, Math.round(Math.sin(i) * radius) + y, col);
        }
    }
    blit(src, srcX, srcY, width, height, canvasX, canvasY, col = undefined) {
        for (let y = srcY; y < srcY + height; y++) {
            for (let x = srcX; x < srcX + width; x++) {
                if (col != undefined) {
                    this.pixels[(x - srcX + canvasX) + (y - srcY + canvasY) * this.width] = Color.multiply(Color.divide(src.pixels[x + y * src.width], new Color(255, 255, 255)), col);
                }
                else {
                    this.pixels[(x - srcX + canvasX) + (y - srcY + canvasY) * this.width] = src.pixels[x + y * src.width];
                }
            }
        }
    }
    charAt(src, tkn, x, y, col) {
        let charCode = tkn.charCodeAt(0);
        let subtracted = charCode - 65;
        let charY = 0;
        if (subtracted > 25) {
            charY = 1;
            subtracted = charCode - 97;
        }
        this.blit(src, subtracted * 5, charY * 7, 5, 7, x, y, col);
        // console.log((charCode - 65) * 5);
    }
    textAt(src, text, x, y, col) {
        let steps = 0;
        let maxChars = -1;
        for (let i = 0; i < text.length; i++) {
            let newX = i * (5 + 1) + x;
            if (newX + (5 + 1) > this.width) {
                if (maxChars == -1) {
                    maxChars = i;
                }
                if (i % maxChars == 0) {
                    steps++;
                    y += 7 + 1;
                }
                newX = (i - maxChars * steps) * (5 + 1) + x;
            }
            this.charAt(src, text.charAt(i), newX, y, col);
        }
    }
}
let htmlCanvas = document.querySelector("canvas");
let canvas = new Canvas(40, 40);
canvas.clear(new Color(0, 255, 128));
let bm = new Bitmap(125, 14);
// a
// översta raden
bm.putPixel(0, 7 + 2, new Color(255, 255, 255));
bm.putPixel(1, 7 + 2, new Color(255, 255, 255));
bm.putPixel(2, 7 + 2, new Color(255, 255, 255));
bm.putPixel(3, 7 + 2, new Color(255, 255, 255));
// Nästa rad
bm.putPixel(4, 7 + 3, new Color(255, 255, 255));
// Nästa rad
bm.putPixel(1, 7 + 4, new Color(255, 255, 255));
bm.putPixel(2, 7 + 4, new Color(255, 255, 255));
bm.putPixel(3, 7 + 4, new Color(255, 255, 255));
bm.putPixel(4, 7 + 4, new Color(255, 255, 255));
// Nästa rad
bm.putPixel(0, 7 + 5, new Color(255, 255, 255));
bm.putPixel(4, 7 + 5, new Color(255, 255, 255));
// Nästa rad
bm.putPixel(1, 7 + 6, new Color(255, 255, 255));
bm.putPixel(2, 7 + 6, new Color(255, 255, 255));
bm.putPixel(3, 7 + 6, new Color(255, 255, 255));
bm.putPixel(4, 7 + 6, new Color(255, 255, 255));
// b
bm.putPixel(0 + 5 * 1, 7 + 0, new Color(255, 255, 255));
bm.putPixel(0 + 5 * 1, 7 + 1, new Color(255, 255, 255));
// nästa rad
bm.putPixel(0 + 5 * 1, 7 + 2, new Color(255, 255, 255));
bm.putPixel(1 + 5 * 1, 7 + 2, new Color(255, 255, 255));
bm.putPixel(2 + 5 * 1, 7 + 2, new Color(255, 255, 255));
bm.putPixel(3 + 5 * 1, 7 + 2, new Color(255, 255, 255));
bm.putPixel(0 + 5 * 1, 7 + 3, new Color(255, 255, 255));
bm.putPixel(4 + 5 * 1, 7 + 3, new Color(255, 255, 255));
bm.putPixel(0 + 5 * 1, 7 + 4, new Color(255, 255, 255));
bm.putPixel(4 + 5 * 1, 7 + 4, new Color(255, 255, 255));
bm.putPixel(0 + 5 * 1, 7 + 5, new Color(255, 255, 255));
bm.putPixel(4 + 5 * 1, 7 + 5, new Color(255, 255, 255));
bm.putPixel(0 + 5 * 1, 7 + 6, new Color(255, 255, 255));
bm.putPixel(1 + 5 * 1, 7 + 6, new Color(255, 255, 255));
bm.putPixel(2 + 5 * 1, 7 + 6, new Color(255, 255, 255));
bm.putPixel(3 + 5 * 1, 7 + 6, new Color(255, 255, 255));
// c
bm.putPixel(1 + 5 * 2, 7 + 2, new Color(255, 255, 255));
bm.putPixel(2 + 5 * 2, 7 + 2, new Color(255, 255, 255));
bm.putPixel(3 + 5 * 2, 7 + 2, new Color(255, 255, 255));
bm.putPixel(0 + 5 * 2, 7 + 3, new Color(255, 255, 255));
bm.putPixel(4 + 5 * 2, 7 + 3, new Color(255, 255, 255));
bm.putPixel(0 + 5 * 2, 7 + 4, new Color(255, 255, 255));
bm.putPixel(0 + 5 * 2, 7 + 5, new Color(255, 255, 255));
bm.putPixel(1 + 5 * 2, 7 + 6, new Color(255, 255, 255));
bm.putPixel(2 + 5 * 2, 7 + 6, new Color(255, 255, 255));
bm.putPixel(3 + 5 * 2, 7 + 6, new Color(255, 255, 255));
bm.putPixel(4 + 5 * 2, 7 + 6, new Color(255, 255, 255));
// d
bm.putPixel(4 + 5 * 3, 7 + 0, new Color(255, 255, 255));
bm.putPixel(4 + 5 * 3, 7 + 1, new Color(255, 255, 255));
bm.putPixel(1 + 5 * 3, 7 + 2, new Color(255, 255, 255));
bm.putPixel(2 + 5 * 3, 7 + 2, new Color(255, 255, 255));
bm.putPixel(3 + 5 * 3, 7 + 2, new Color(255, 255, 255));
bm.putPixel(4 + 5 * 3, 7 + 2, new Color(255, 255, 255));
bm.putPixel(0 + 5 * 3, 7 + 3, new Color(255, 255, 255));
bm.putPixel(4 + 5 * 3, 7 + 3, new Color(255, 255, 255));
bm.putPixel(0 + 5 * 3, 7 + 4, new Color(255, 255, 255));
bm.putPixel(4 + 5 * 3, 7 + 4, new Color(255, 255, 255));
bm.putPixel(0 + 5 * 3, 7 + 5, new Color(255, 255, 255));
bm.putPixel(4 + 5 * 3, 7 + 5, new Color(255, 255, 255));
bm.putPixel(1 + 5 * 3, 7 + 6, new Color(255, 255, 255));
bm.putPixel(2 + 5 * 3, 7 + 6, new Color(255, 255, 255));
bm.putPixel(3 + 5 * 3, 7 + 6, new Color(255, 255, 255));
bm.putPixel(4 + 5 * 3, 7 + 6, new Color(255, 255, 255));
// canvas.putPixel(10, 10, new Color(0, 0, 0));
// canvas.line(1, 1, 30, 30, new Color(0, 0, 0));
canvas.clear(new Color());
// har bara bokstäverna a, b och c i små bokstäver
canvas.textAt(bm, "abcabcabcabcabcabcabcabcabcabc", 8, 0, new Color(128, 0, 255));
canvas.draw(htmlCanvas);
