class Color {

  r: number;
  g: number;
  b: number;

  constructor(r: number = 0, g: number = 0, b: number = 0) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  toString(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  static add(col1: Color, col2: Color): Color {
    return new Color(col1.r + col2.r, col1.g + col2.g, col1.b + col2.b);
  }

  static subtract(col1: Color, col2: Color): Color {
    return new Color(col1.r - col2.r, col1.g - col2.g, col1.b - col2.b);
  }

  static divide(col1: Color, col2: Color): Color {
    return new Color(col1.r / col2.r, col1.g / col2.g, col1.b / col2.b);
  }
}

class Canvas {

  width: number;
  height: number;

  pixels: Array<Color>;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.pixels = [];

    for (let i = 0; i < width * height; i++) {
      this.pixels.push(new Color());
    }
  }

  clear(col: Color): void {
    for (let i = 0; i < this.width * this.height; i++) {
      this.pixels[i] = col;
    }
  }

  draw(canvas: HTMLCanvasElement): void {

    let context = canvas.getContext("2d");
    context!.clearRect(0, 0, this.width, this.height);

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {

        let i = x + y * this.width;

        context!.fillStyle = this.pixels[i].toString();
        context!.fillRect(10 * x, 10 * y, 10, 10);
      }
    }

  }

  fadeIn(canvas: HTMLCanvasElement): void {
    let adders = new Array<Color>();

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

  fadeOut(canvas: HTMLCanvasElement): void {

    let adders = new Array<Color>();

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

  scrollLeft(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width - 1; x++) {
        this.pixels[x + y * this.width] = this.pixels[(x + y * this.width) + 1];
      }

      this.pixels[this.width - 1 + y * this.width] = new Color();
    }
  }

  scrollRight(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = this.width - 1; x >= 0; x--) {
        this.pixels[x + y * this.width] = this.pixels[(x + y * this.width) - 1];
      }

      this.pixels[0 + y * this.width] = new Color();
    }
  }

  putPixel(x: number, y: number, col: Color): void {
    this.pixels[x + y * this.width] = col;
  }

  line(x1: number, y1: number, x2: number, y2: number, col: Color): void {

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


  circle(x: number, y: number, radius: number, col: Color): void {
    for (let i = 0; i < 360; i++) {
      // Enhetscirkel, stulen från Christoffer
      this.putPixel(Math.round(Math.cos(i) * radius) + x, Math.round(Math.sin(i) * radius) + y, col);
    }
  }
}

let htmlCanvas = document.querySelector("canvas") as HTMLCanvasElement;

let canvas = new Canvas(40, 40);

canvas.clear(new Color(0, 255, 128));
canvas.putPixel(10, 10, new Color(0, 0, 0));
// canvas.line(1, 1, 30, 30, new Color(0, 0, 0));

canvas.circle(10, 10, 9, new Color(0, 0, 0));
// canvas.fadeIn(htmlCanvas);
canvas.draw(htmlCanvas);

// canvas.fadeOut(htmlCanvas);
