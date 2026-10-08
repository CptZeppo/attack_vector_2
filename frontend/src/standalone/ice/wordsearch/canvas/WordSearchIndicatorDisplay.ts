import {fabric} from "fabric";
import {Canvas, Line} from "fabric/fabric-impl";
import {isIceMobile} from "../../common/iceMobile";

// The desktop width renders as a ~1px hairline once iceCanvasFit scales the grid down on a phone
// (weak = 15x15 -> ~0.6x); the mobile width compensates (same idea as the Tangle line widths).
const STROKE_WIDTH = 2
const STROKE_WIDTH_MOBILE = 6

export class WordSearchIndicatorDisplay {

    line: Line
    canvas: Canvas

    x1: number
    y1: number

    constructor(canvas: Canvas, x: number, y: number) {
        this.canvas = canvas;

        this.x1 = x
        this.y1 = y

        const mobile = isIceMobile()
        this.line = new fabric.Line(
            [x,y,x,y], {
                stroke: "#31708f",
                strokeWidth: mobile ? STROKE_WIDTH_MOBILE : STROKE_WIDTH,
                strokeDashArray: mobile ? [10, 10] : [4, 4],
                selectable: false,
                hoverCursor: 'default',
                opacity: 0.8,
            });
        this.canvas.add(this.line)
        this.canvas.renderAll()
    }

    moved(x2: number, y2: number) {
        const newCoordinates = { x1: this.x1, y1: this.y1, x2, y2 }
        this.line.set(newCoordinates)
        this.line.setCoords()
        this.canvas.renderAll()

        // this.logPosition(x2, y2)

    }

    remove() {
        this.canvas.remove(this.line)
    }

}
