import {Canvas} from "fabric/fabric-impl";
import {Dispatch, Store} from "redux";
import {fabric} from "fabric";
import {PADDING_LEFT, PADDING_TOP, SweeperCellDisplay} from "./SweeperCellDisplay";
import {SweeperModifyData} from "../SweeperServerActionProcessor";
import {sweeperIceManager} from "../SweeperIceManager";
import {Schedule} from "../../../../common/util/Schedule";
import {shuffleArray} from "../../../../common/util/Util";
import {IceStrength} from "../../../../common/model/IceStrength";
import {SweeperCellModifier, SweeperCellType, SweeperGameState} from "../logic/SweeperLogic";
import {currentUser} from "../../../../common/user/CurrentUser";
import {installIceCanvasAutoFit} from "../../common/iceCanvasFit";
import {isIceMobile} from "../../common/iceMobile";

// Press-and-hold duration (ms) that turns a touch into a "flag" instead of a "reveal".
const LONG_PRESS_MS = 450

type CellById = { [id: string]: SweeperCellDisplay }

class SweeperCanvas {

    canvas: Canvas = null as unknown as Canvas
    store: Store = null as unknown as Store
    dispatch: Dispatch = null as unknown as Dispatch
    autoFitCleanup: (() => void) | null = null

    cellDisplayByLocation: CellById = {}

    sizeX = 0
    sizeY = 0

    cellSize = 0
    imagesLoaded = 0
    allImagesLoaded = false

    userBlocked = false;

    // Touch interaction state (mobile only): a short tap reveals, a long press flags. We can't tell
    // tap from long-press at mouse:down, so we start a timer and decide at mouse:up / timeout.
    longPressTimer: ReturnType<typeof setTimeout> | null = null
    pendingCell: SweeperCellDisplay | null = null
    longPressFired = false
    touchMoved = false
    downPointer: { x: number, y: number } | null = null

    imageLoaded(totalImages: number) {
        this.imagesLoaded++
        this.allImagesLoaded = (this.imagesLoaded === totalImages)
    }

    init(data: SweeperGameState, dispatch: Dispatch, store: Store) {
        if (!this.allImagesLoaded) {
            setTimeout(() => {
                this.init(data, dispatch, store)
            }, 100)
            return
        }

        this.userBlocked = data.blockedUserIds.includes(currentUser.id);
        this.dispatch = dispatch;
        this.store = store;

        this.cellSize = this.determineCellSize(data.cells.length)

        this.sizeX = data.cells[0].length
        this.sizeY = data.cells.length

        this.canvas = this.createCanvas()

        if (this.autoFitCleanup) this.autoFitCleanup()
        this.autoFitCleanup = installIceCanvasAutoFit("netwalkCanvas")

        fabric.Object.prototype.originX = "center";
        fabric.Object.prototype.originY = 'center';

        this.canvas.selection = false;

        this.canvas.discardActiveObject();
        this.canvas.renderAll();

        this.canvas.on('mouse:down', (event: fabric.IEvent<MouseEvent>) => {
            this.mouseDown(event);
        })
        // On touch we can't use mouse buttons (tap has no `button`), so distinguish tap (reveal) from
        // long-press (flag) using down/move/up. Fabric maps touch events onto these mouse: events.
        this.canvas.on('mouse:up', (event: fabric.IEvent<MouseEvent>) => {
            this.mouseUp(event);
        })
        this.canvas.on('mouse:move', (event: fabric.IEvent<MouseEvent>) => {
            this.touchMove(event);
        })

        data.cells.forEach((row: SweeperCellType[], y: number) => {
            row.forEach((cellType: SweeperCellType, x: number) => {
                const modifier = data.modifiers[y][x]
                this.createCell(x, y, cellType, modifier)
            })
        })

        setTimeout(() => {
            fabric.Image.fromURL("/img/frontier/ice/sweeper/sweeper-1.jpg", (img) => {
                img.set({width: this.canvas.width, height: this.canvas.height, originX: 'left', originY: 'top'});
                this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
            });
        }, 100);
        this.canvas.renderAll()
    }

    createCanvas():Canvas {
        return new fabric.Canvas('netwalkCanvas', {
            width: this.cellSize * this.sizeX + PADDING_LEFT * 2,
            height: this.cellSize * this.sizeY + PADDING_TOP * 2,
            backgroundColor: "#222",
            fireRightClick: true,  // <-- enable firing of right click events
            stopContextMenu: true, // <--  prevent context menu from showing
        });
    }

    mouseDown(event:fabric.IEvent<MouseEvent>) {
        if (!(event?.target?.data instanceof SweeperCellDisplay)) return
        const cell: SweeperCellDisplay = event.target.data

        if (!isIceMobile()) {
            // Desktop: left button reveals, right button (fireRightClick) flags.
            sweeperIceManager.click(cell.x, cell.y, event.e.button === 0)
            return
        }

        // Touch: start a press. A quick release reveals (handled in mouseUp); holding past
        // LONG_PRESS_MS flags the cell here. A drag beyond a cell cancels both (handled in touchMove).
        this.cancelTouchPress()
        this.pendingCell = cell
        this.longPressFired = false
        this.touchMoved = false
        this.downPointer = event.pointer ? {x: event.pointer.x, y: event.pointer.y} : null
        this.longPressTimer = setTimeout(() => {
            this.longPressTimer = null
            if (this.touchMoved) return
            this.longPressFired = true
            if (navigator.vibrate) navigator.vibrate(35) // subtle haptic confirm for the flag
            sweeperIceManager.click(cell.x, cell.y, false) // flag / unflag
        }, LONG_PRESS_MS)
    }

    touchMove(event: fabric.IEvent<MouseEvent>) {
        if (!this.pendingCell || !this.downPointer || !event.pointer) return
        const dx = event.pointer.x - this.downPointer.x
        const dy = event.pointer.y - this.downPointer.y
        // Cancel once the finger leaves roughly the original cell, so a drag neither flags nor reveals.
        if (Math.hypot(dx, dy) > this.cellSize * 0.5) {
            this.touchMoved = true
            this.clearLongPressTimer()
        }
    }

    mouseUp(_event: fabric.IEvent<MouseEvent>) {
        if (!isIceMobile()) return
        this.clearLongPressTimer()
        const cell = this.pendingCell
        if (cell && !this.longPressFired && !this.touchMoved) {
            sweeperIceManager.click(cell.x, cell.y, true) // reveal
        }
        this.cancelTouchPress()
    }

    private clearLongPressTimer() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer)
            this.longPressTimer = null
        }
    }

    private cancelTouchPress() {
        this.clearLongPressTimer()
        this.pendingCell = null
        this.longPressFired = false
        this.touchMoved = false
        this.downPointer = null
    }

    createCell(x: number, y: number, cellType: SweeperCellType, modifier: SweeperCellModifier) {
        const corner = (x % (this.sizeX - 1) === 0 && y % (this.sizeY - 1) === 0)
        const cellDisplay = new SweeperCellDisplay(this.canvas, x, y, cellType, modifier, this.cellSize, this.userBlocked, corner)
        const location = `${x}:${y}`
        this.cellDisplayByLocation[location] = cellDisplay
    }

    determineCellSize(cellsInColumn:number) {
        switch (cellsInColumn) {
            case 9:
                return 86
            case 12:
                return 66
            case 16:
                return 50
            case 18:
                return 44
            default:
                return 40
        }
    }

    serverModified(data:SweeperModifyData, newModifier:SweeperCellModifier) {
        data.cells.forEach((location: string) => { // "$x:$y"
            this.cellDisplayByLocation[location].updateModifier(newModifier)
        })
        this.canvas.renderAll()
    }

    serverSolved(finishFunction: () => void){
        const iceStrength = this.store.getState().ui.strength
        const delay = this.determineDelay(iceStrength)

        const schedule = new Schedule(null)
        const mines = Object.values(this.cellDisplayByLocation)
            .filter((cellDisplay: SweeperCellDisplay) => cellDisplay.cellType === SweeperCellType.MINE)
        shuffleArray(mines)


        mines.forEach((cellDisplay: SweeperCellDisplay) => {
            schedule.run(delay, () => {
                cellDisplay.fade()
            })
        })
        schedule.wait(30)
        schedule.run(0, finishFunction)
    }


    determineDelay(iceStrength:IceStrength): number {
        switch (iceStrength) {
            case IceStrength.VERY_WEAK:
                return 6
            case IceStrength.WEAK:
                return 3
            case IceStrength.AVERAGE:
                return 2
            default:
                return 1
        }
    }

    changeUserBlocked(blocked: boolean) {
        Object.values(this.cellDisplayByLocation).forEach((cellDisplay: SweeperCellDisplay) => {
            cellDisplay.changeUserBlocked(blocked)
        })
    }
}

export const sweeperCanvas = new SweeperCanvas()
