import {Canvas} from "fabric/fabric-impl";
import {Dispatch, Store} from "redux";
import {fabric} from "fabric";
import {WordSearchIndicatorDisplay} from "./WordSearchIndicatorDisplay";
import {LETTERS_SELECTED} from "../reducer/WordSearchStateReducer";
import {webSocketConnection} from "../../../../common/server/WebSocketConnection";
import {ServerEnterIceWordSearch} from "../WordSearchServerActionProcessor";
import {ice} from "../../../StandaloneGlobals";
import {installIceCanvasAutoFit} from "../../common/iceCanvasFit";
import {isIceMobile} from "../../common/iceMobile";

const MARGIN_TOP = 5
const MARGIN_LEFT = 5
const MARGIN_BOTTOM = 5
const MARGIN_RIGHT = 5

interface Position {
    x: number,
    y: number
}

class WordSearchCanvas {

    // startX = 0
    // startY = 0

    canvas: Canvas = null as unknown as Canvas
    store: Store = null as unknown as Store
    dispatch: Dispatch = null as unknown as Dispatch
    autoFitCleanup: (() => void) | null = null

    cellSize: number = 0
    rows = 0
    columns = 0

    letterCount = 0
    previousLetterPosition: Position | null = null
    lettersSelected: string[] = []
    letterStartPosition: { x: number, y: number } | null = null

    indicatorVisual: WordSearchIndicatorDisplay | null = null

    init(puzzleData: ServerEnterIceWordSearch, dispatch: Dispatch, store: Store) {
        this.dispatch = dispatch;
        this.store = store;

        const rows = puzzleData.letterGrid.length
        const columns = puzzleData.letterGrid[0].length
        this.rows = rows
        this.columns = columns

        this.cellSize = (rows <= 20) ? 40 : 30

        this.canvas = this.createCanvas(columns, rows)

        if (this.autoFitCleanup) this.autoFitCleanup()
        this.autoFitCleanup = installIceCanvasAutoFit("wordSearchCanvas", "transform")

        fabric.Object.prototype.originX = "center";
        fabric.Object.prototype.originY = 'center';


        this.canvas.selection = false;

        // horizontal lines
        for (let y = 0; y < rows + 1; y++) {
            this.drawLine(0, y, columns, y)
        }

        // vertical lines
        for (let x = 0; x < columns + 1; x++) {
            this.drawLine(x, 0, x, rows)
        }

        this.canvas.discardActiveObject();
        this.canvas.renderAll();
    }

    private createCanvas(columns: number, rows: number): Canvas {
        const width = columns * this.cellSize + MARGIN_LEFT + MARGIN_RIGHT
        const height = rows * this.cellSize + MARGIN_TOP + MARGIN_BOTTOM

        const canvas = new fabric.Canvas('wordSearchCanvas', {
            width,
            height,
            backgroundColor: "#333333",
        });

        setTimeout(function () {
            fabric.Image.fromURL("/img/frontier/ice/wordSearch/darknoise_4_1552_852-2.png", (img) => {
                img.set({width: canvas.width, height: canvas.height, originX: 'left', originY: 'top'});
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            });
        }, 100);

        return canvas
    }


    private drawLine(x1: number, y1: number, x2: number, y2: number) {
        const lineData = [
            MARGIN_LEFT + x1 * this.cellSize,
            MARGIN_TOP + y1 * this.cellSize,
            MARGIN_LEFT + x2 * this.cellSize,
            MARGIN_TOP + y2 * this.cellSize
        ]
        const line = new fabric.Line(
            lineData, {
                stroke: "#000b",
                strokeWidth: 2,
                // strokeDashArray: [8, 2],
                selectable: false,
                hoverCursor: 'default',
                opacity: 0.4
            });

        this.canvas.add(line)
    }


    mouseDown(event: MouseEvent) {
        if (this.indicatorVisual != null) {
            // we must have gone out of bounds. Process potential previous event first.
            this.mouseUp(event)
        }

        const pointer = this.canvas.getPointer(event);
        this.letterStartPosition = this.determineLetterPosition(pointer.x, pointer.y)

        if (isIceMobile()) {
            // Anchor the indicator on the start letter's centre, so the snapped line (see
            // touchMoveSnapped) runs exactly along the letters it selects.
            const startCenterX = MARGIN_LEFT + (this.letterStartPosition.x + 0.5) * this.cellSize
            const startCenterY = MARGIN_TOP + (this.letterStartPosition.y + 0.5) * this.cellSize
            this.indicatorVisual = new WordSearchIndicatorDisplay(this.canvas, startCenterX, startCenterY)
        } else {
            this.indicatorVisual = new WordSearchIndicatorDisplay(this.canvas, pointer.x, pointer.y)
        }

        const key = `${this.letterStartPosition.x}:${this.letterStartPosition.y}`
        this.lettersSelected = [key]
        this.updateLettersSelected()

        // this.startX = event.pageX
        // this.startY = event.pageY
    }

    mouseMove(event: MouseEvent) {
        if (this.indicatorVisual == null) return

        const pointer = this.canvas.getPointer(event);

        if (isIceMobile()) {
            this.touchMoveSnapped(pointer.x, pointer.y)
            return
        }

        this.indicatorVisual.moved(pointer.x, pointer.y)
        const letterPosition = this.determineLetterPosition(pointer.x, pointer.y)

        const dx = this.letterStartPosition!!.x - letterPosition.x
        const dy = this.letterStartPosition!!.y - letterPosition.y

        if ((dx === 0 && dy === 0) ||
            (this.previousLetterPosition !== null && this.previousLetterPosition.x === letterPosition.x && this.previousLetterPosition.y === letterPosition.y)
        ) {
            return
        }
        this.previousLetterPosition = letterPosition

        this.lettersSelected = [`${this.letterStartPosition!!.x}:${this.letterStartPosition!!.y}`]
        if ((dx === 0 && dy !== 0) || (dx !== 0 && dy === 0) || (Math.abs(dx) === Math.abs(dy))) {
            let walk = 0
            const maxWalk = Math.max(Math.abs(dx), Math.abs(dy))
            while (walk < maxWalk) {
                walk++
                const x = this.letterStartPosition!!.x - Math.sign(dx) * walk
                const y = this.letterStartPosition!!.y - Math.sign(dy) * walk
                const key = `${x}:${y}`
                this.lettersSelected.push(key)
            }
        }
        this.updateLettersSelected()
    }

    /**
     * Touch selection with direction snapping (mobile only; the desktop mouse path is untouched).
     *
     * The desktop selection only forms when the pointer is EXACTLY on the start letter's row,
     * column or 45-degree diagonal — anything else collapses the selection to the start letter.
     * With a finger on a fit-scaled grid (weak = 15x15 -> ~25px cells on a phone) that exactness
     * is not attainable: the selection flickers and releasing off-line sends nothing. So on touch
     * we snap the drag vector to the nearest of the 8 valid directions and select as many letters
     * as the finger has travelled along it (clamped to the grid), the same "finger-sized tolerance"
     * idea as the Tangle grab radius. The indicator line snaps to the last selected letter, so it
     * always shows exactly what a release will submit.
     */
    private touchMoveSnapped(pointerX: number, pointerY: number) {
        const start = this.letterStartPosition!!
        const startCenterX = MARGIN_LEFT + (start.x + 0.5) * this.cellSize
        const startCenterY = MARGIN_TOP + (start.y + 0.5) * this.cellSize
        const dx = pointerX - startCenterX
        const dy = pointerY - startCenterY

        // Nearest of the 8 directions (N/NE/E/SE/S/SW/W/NW), by angle octant.
        const octant = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8
        const sx = [1, 1, 0, -1, -1, -1, 0, 1][octant]
        const sy = [0, 1, 1, 1, 0, -1, -1, -1][octant]

        // Letters travelled = the drag projected onto the snapped direction, in letter steps
        // (a diagonal letter step is cellSize * sqrt2 long, and (sx, sy) has length sqrt2).
        const stepLength = this.cellSize * ((sx !== 0 && sy !== 0) ? 2 : 1)
        let steps = Math.max(0, Math.round((dx * sx + dy * sy) / stepLength))

        // Stay within the grid.
        if (sx > 0) steps = Math.min(steps, this.columns - 1 - start.x)
        if (sx < 0) steps = Math.min(steps, start.x)
        if (sy > 0) steps = Math.min(steps, this.rows - 1 - start.y)
        if (sy < 0) steps = Math.min(steps, start.y)

        const selected = [`${start.x}:${start.y}`]
        for (let walk = 1; walk <= steps; walk++) {
            selected.push(`${start.x + sx * walk}:${start.y + sy * walk}`)
        }

        if (selected.join("|") === this.lettersSelected.join("|")) return
        this.lettersSelected = selected

        const endX = MARGIN_LEFT + (start.x + sx * steps + 0.5) * this.cellSize
        const endY = MARGIN_TOP + (start.y + sy * steps + 0.5) * this.cellSize
        this.indicatorVisual!!.moved(endX, endY)

        this.updateLettersSelected()
    }

    mouseUp(event: MouseEvent) {
        if (this.indicatorVisual == null) return

        this.indicatorVisual.remove()
        this.indicatorVisual = null

        this.processLetters()

        // const x = event.pageX
        // const y = event.pageY
        // console.log(`await wordSearch.dragWord(startGX, startGY, endGX, endGY)(${this.startX}, ${this.startY}, ${x}, ${y}`)
    }

    updateLettersSelected() {
        this.dispatch({type: LETTERS_SELECTED, selected: this.lettersSelected})
    }

    processLetters() {
        if (this.lettersSelected.length >= 2) {

            const toSend = this.lettersSelected
            // Delay the sending, so that the selected cells have some time to fade out.
            setTimeout(() => {
                const payload = {iceId: ice.id, letters: toSend}
                webSocketConnection.send("/ice/wordSearch/selected", JSON.stringify(payload))
            }, 200)
        }

        this.lettersSelected = []
        this.letterStartPosition = null
        this.updateLettersSelected()
    }


    private determineLetterPosition(x: number, y: number) {
        const letterX = Math.floor((x - MARGIN_LEFT) / this.cellSize)
        const letterY = Math.floor((y - MARGIN_TOP) / this.cellSize)
        return {x: letterX, y: letterY}
    }
}

export const wordSearchCanvas = new WordSearchCanvas()
