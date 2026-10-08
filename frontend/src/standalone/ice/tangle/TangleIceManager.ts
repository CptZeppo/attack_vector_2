import {ICE_DISPLAY_TERMINAL_ID} from "../../../common/terminal/ActiveTerminalIdReducer";
import {GenericIceManager} from "../common/GenericIceManager";
import {tangleIceCanvas} from "./canvas/TangleIceCanvas";
import {delay} from "../../../common/util/Util";
import {ICE_TANGLE_BEGIN, TangleLine, TanglePoint} from "./reducer/TangleIceReducer";
import {TERMINAL_CLEAR} from "../../../common/terminal/TerminalReducer";

export interface EnterTanglePuzzle {
    strength: string,
    points: TanglePoint[],
    lines: TangleLine[],
    clusters: Number,
    hacked: boolean,
    clustersRevealed: boolean,
    quickPlaying: boolean,
}

export interface TanglePointMoved {
    layerId: string,
    id: string,
    x: number,
    y: number,
    solved: boolean
}

class TangleIceManager extends GenericIceManager {

    enter(puzzle: EnterTanglePuzzle) {
        delay(() => {
            tangleIceCanvas.init(puzzle, this.dispatch, this.store)
        })
        this.schedule.clear()
        this.dispatch({type: TERMINAL_CLEAR, terminalId: ICE_DISPLAY_TERMINAL_ID})

        if (puzzle.hacked) {
            // Already solved: reveal the solved puzzle so the hacker sees it, then the terminal
            // reports "already hacked" and auto-advances to the next layer (GenericIceManager).
            this.schedule.dispatch(0, {type: ICE_TANGLE_BEGIN})
            this.enterHacked()
            return
        }

        if (!puzzle.quickPlaying) {
            this.displayTerminal(20, this.t("ice.tangle.connecting"))
            this.displayTerminal(40, this.t("ice.tangle.network-inspection"))
            this.displayTerminal(10, this.t("ice.tangle.complete"))
            this.displayTerminal(10, this.t("ice.tangle.weak-encryption"))
            if (puzzle.clusters > 1) {
                this.displayTerminal(10, this.t("ice.tangle.clusters-detected", puzzle.clusters.toString()))

            }
            this.displayTerminal(20, this.t("ice.tangle.negotiating"))
            this.displayTerminal(30, "...")
            this.displayTerminal(20, this.t("ice.tangle.negotiation-complete"))
        }
        this.displayTerminal(5, this.t("ice.tangle.start-decryption"))
        this.schedule.dispatch(0, {type: ICE_TANGLE_BEGIN})
    }

    moved(data: TanglePointMoved) {
        tangleIceCanvas.serverMovedPoint(data)
    }

    clustersRevealed() {
        tangleIceCanvas.clustersRevealed()
        this.displayTerminal(20, "")
        this.displayTerminal(0, this.t("ice.tangle.clusters-revealed"))
    }

    serverSentIceHacked() {
        this.displayTerminal(0, "")
        this.displayTerminal(20, this.t("ice.tangle.decryption-complete"))
        this.displayTerminal(40, this.t("ice.grants-access"))

        this.processHacked()
    }

}

export const tangleIceManager = new TangleIceManager()
