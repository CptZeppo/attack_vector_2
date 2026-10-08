import {fabric} from "fabric";
import {Canvas, Line} from "fabric/fabric-impl";
import {TanglePointDisplay} from "./TanglePointDisplay";
import {isIceMobile} from "../../common/iceMobile";


const LINE_COLOR_NORMAL = "#e0e6ef";
const LINE_COLOR_HIGHLIGHT = "#337ab7";

const STROKE_WIDTH_NORMAL = 1.5;
const STROKE_WIDTH_HIGHLIGHT = 2.5;

// At the mobile display scale (~0.24-0.4x of the 1576x828 canvas) the desktop widths
// render as sub-pixel hairlines; see TanglePointDisplay for the matching point sizes.
const STROKE_WIDTH_NORMAL_MOBILE = 4;
const STROKE_WIDTH_HIGHLIGHT_MOBILE = 6;

export class TangleLineDisplay {

    canvas: Canvas
    id: string
    point1: TanglePointDisplay
    point2: TanglePointDisplay
    type: string
    icon: Line
    strokeWidthNormal: number
    strokeWidthHighlight: number

    constructor(canvas: Canvas, id: string, point1: TanglePointDisplay, point2: TanglePointDisplay, type: string) {
        this.canvas = canvas;
        this.id = id;
        this.point1 = point1;
        this.point2 = point2;
        this.type = type;

        const mobile = isIceMobile()
        this.strokeWidthNormal = mobile ? STROKE_WIDTH_NORMAL_MOBILE : STROKE_WIDTH_NORMAL
        this.strokeWidthHighlight = mobile ? STROKE_WIDTH_HIGHLIGHT_MOBILE : STROKE_WIDTH_HIGHLIGHT

        const stroke = (type==="NORMAL" ?  LINE_COLOR_NORMAL : LINE_COLOR_NORMAL);

        this.icon = new fabric.Line(
            [this.point1.icon.left!, this.point1.icon.top!, this.point2.icon.left!, this.point2.icon.top!], {
                stroke: stroke,
                strokeWidth: this.strokeWidthNormal,
                selectable: false,
                hoverCursor: 'default',
            });
    }

    show() {
        this.canvas.add(this.icon);
        // this.canvas.add(this.idIcon);
    }

    highlightOtherEnd(pointDisplay: TanglePointDisplay) {
        this.findOther(pointDisplay).secondaryHighlight();
        this.highLight();
    }

    unHighlightOtherEnd(pointDisplay: TanglePointDisplay) {
        this.findOther(pointDisplay).secondaryUnHighlight();
        this.unHighlight();
    }

    findOther(pointDisplay: TanglePointDisplay) {
        return (pointDisplay === this.point1) ? this.point2 : this.point1;
    }

    highLight() {
        this.icon.set("stroke", LINE_COLOR_HIGHLIGHT);
        this.icon.set("strokeWidth", this.strokeWidthHighlight);
    }

    unHighlight() {
        this.icon.set("stroke", LINE_COLOR_NORMAL);
        this.icon.set("strokeWidth", this.strokeWidthNormal);
    }

    moved() {
        const newCoordinates = {
            x1: this.point1.icon.left,
            y1: this.point1.icon.top,
            x2: this.point2.icon.left,
            y2: this.point2.icon.top
        };
        this.icon.set(newCoordinates);
        this.icon.setCoords();
    }
}
