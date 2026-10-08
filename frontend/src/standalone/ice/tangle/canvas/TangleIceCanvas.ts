import {fabric} from "fabric";
import {TanglePointDisplay} from "./TanglePointDisplay";
import {TangleLineDisplay} from "./TangleLineDisplay";
import {webSocketConnection} from "../../../../common/server/WebSocketConnection";
import {EnterTanglePuzzle, TanglePointMoved} from "../TangleIceManager";
import {Dispatch, Store} from "redux";
import {Canvas} from "fabric/fabric-impl";
import {TangleLine, TanglePoint} from "../reducer/TangleIceReducer";
import {ice} from "../../../StandaloneGlobals";
import {installIceCanvasAutoFit} from "../../common/iceCanvasFit";

// How far (in on-SCREEN pixels) a tap/click may land from a point's centre and still grab it.
// Converted to canvas coordinates per event, so the grab area stays finger-sized regardless of
// how much iceCanvasFit scaled the 1576x828 canvas down (on a phone ~0.24x, where the default
// fabric hit-test — the exact radius-6 circle — leaves a ~3px touch target).
const GRAB_RADIUS_SCREEN_PX = 24

class TangleIceCanvas {

    currentSelected: TanglePointDisplay | null = null
    canvas: Canvas = null as unknown as Canvas
    pointDisplayById: {[ key: string]: TanglePointDisplay} = {}
    store: Store = null as unknown as Store
    dispatch: Dispatch = null as unknown as Dispatch
    autoFitCleanup: (() => void) | null = null

    init(puzzleData: EnterTanglePuzzle, dispatch: Dispatch, store: Store) {
        this.dispatch = dispatch;
        this.store = store;

        const canvas = new fabric.Canvas('untangleCanvas', {
            width: 1576,
            height: 828,
            backgroundColor: "#aaa",
        });
        this.canvas = canvas

        if (this.autoFitCleanup) this.autoFitCleanup()
        this.autoFitCleanup = installIceCanvasAutoFit("untangleCanvas")

        fabric.Object.prototype.originX = "center";
        fabric.Object.prototype.originY = 'center';

        setTimeout(function() {
            fabric.Image.fromURL("/img/frontier/ice/tangle/untangle-1576x828.jpg", (img) => {
                img.set({width: canvas.width, height: canvas.height, originX: 'left', originY: 'top'});
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            });
        }, 100);

        // this.canvas.on('object:modified', (event) => { this.canvasObjectModified(event); });
        canvas.on('selection:created', (event) => {
            this.canvasSelectionCreated(event);
        });
        canvas.on('selection:cleared', () => {
            this.canvasSelectionCleared();
        });
        canvas.on('mouse:up', (event: fabric.IEvent<MouseEvent>) => {
            this.canvasSelectionCleared();
            // const x = event.e.pageX
            // const y = event.e.pageY
            // console.log("await icePage.mouse.move(" + x + "," + y + ")")
            // console.log("await icePage.mouse.up()")
            // console.log("await ice.wait(1.0)")
        });

        // this.canvas.on('mouse:down', (event: fabric.IEvent<MouseEvent>) => {
        //     const x = event.e.pageX
        //     const y = event.e.pageY
        //     console.log("await icePage.mouse.move(" + x + "," + y + ")")
        //     console.log("await icePage.mouse.down()")
        // })

        canvas.on('object:moving', (event) => {
            this.canvasObjectMoved(event);
        });
        canvas.selection = false;

        // Nearest-point target finding with a finger-sized grab radius (see GRAB_RADIUS_SCREEN_PX).
        // Also resolves overlapping points better than fabric's default (nearest wins, not topmost).
        canvas.findTarget = (e: Event): fabric.Object | undefined => this.findGrabTarget(e)

        const {points, lines} = puzzleData;

        this.pointDisplayById = {};

        points.forEach(point => this.addPoint(point, puzzleData.clustersRevealed));
        lines.forEach(lines => this.addLine(lines));
        Object.values(this.pointDisplayById).forEach(pointDisplay => pointDisplay.show());


        this.canvas.discardActiveObject();
        this.canvas.renderAll();
    }

    addPoint(pointData: TanglePoint, clustersRevealed: boolean) {
        const pointDisplay = new TanglePointDisplay(this.canvas, pointData, clustersRevealed);
        this.pointDisplayById[pointData.id] = pointDisplay;
    }

    addLine(lineData: TangleLine) {
        const fromDisplay = this.pointDisplayById[lineData.fromId];
        const toDisplay = this.pointDisplayById[lineData.toId];

        const lineDisplay = new TangleLineDisplay(this.canvas, lineData.id, fromDisplay, toDisplay, lineData.type);
        fromDisplay.addLine(lineDisplay);
        toDisplay.addLine(lineDisplay);

        lineDisplay.show();
    }

    findGrabTarget(e: Event): fabric.Object | undefined {
        const pointer = this.canvas.getPointer(e)
        const canvasWidth = this.canvas.getWidth()
        const rect = this.canvas.getElement().getBoundingClientRect()
        const displayScale = (rect.width && canvasWidth) ? rect.width / canvasWidth : 1

        let best: TanglePointDisplay | null = null
        let bestDistance = GRAB_RADIUS_SCREEN_PX / displayScale
        Object.values(this.pointDisplayById).forEach(pointDisplay => {
            const icon = pointDisplay.icon
            const distance = Math.hypot(pointer.x - icon.left!, pointer.y - icon.top!)
            if (distance <= bestDistance) {
                bestDistance = distance
                best = pointDisplay
            }
        })
        return best ? (best as TanglePointDisplay).icon : undefined
    }

    canvasSelectionCreated(event: any) {
        const selectedObject = event.selected[0];
        if (selectedObject.display) {
            selectedObject.display.highLight();
            this.currentSelected = selectedObject.display;
            this.canvas.renderAll();
        }
    }

    canvasSelectionCleared() {
        if (this.currentSelected != null) {
            const icon = this.currentSelected.icon;
            // this.dispatch({type: ICE_TANGLE_MOVE_POINT, id: this.currentSelected.id, x: icon.left, y: icon.top});

            const payload = {iceId: ice.id, pointId: this.currentSelected.id, x: icon.left, y: icon.top};
            webSocketConnection.send("/ice/tangle/moved", JSON.stringify(payload));


            this.currentSelected.unHighlight();
            this.currentSelected = null;
            this.canvas.discardActiveObject().renderAll();
        }
    }

    canvasObjectMoved(event: any) {
        const id = event.target.display.id;
        const pointDisplay = this.pointDisplayById[id];
        pointDisplay.updateLines();
        this.canvas.renderAll();
    }

    serverMovedPoint(actionData: TanglePointMoved) {
        this.pointDisplayById[actionData.id].moved(actionData.x, actionData.y);
        this.canvas.renderAll();
    }

    clustersRevealed() {
        Object.values(this.pointDisplayById).forEach(pointDisplay => pointDisplay.revealClusters());
        this.canvas.renderAll();
    }
}


export const tangleIceCanvas = new TangleIceCanvas();
