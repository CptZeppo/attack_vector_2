import {Schedule} from "../../../../common/util/Schedule";
import {ICE_DISPLAY_TERMINAL_ID} from "../../../../common/terminal/ActiveTerminalIdReducer";
import {GenericIceManager} from "../../common/GenericIceManager";
import {Dispatch, Store} from "redux";
import {TERMINAL_CLEAR, TERMINAL_REPLACE_LAST_LINE} from "../../../../common/terminal/TerminalReducer";
import {tarCanvas} from "../canvas/TarCanvas";
import {TarEnter, TarStatusUpdate} from "../TarServerActionProcessor";
import {webSocketConnection} from "../../../../common/server/WebSocketConnection";
import {formatTimeInterval} from "../../../../common/util/Util";
import {TAR_BEGIN} from "../reducer/TarReducer";
import {ice} from "../../../StandaloneGlobals";

const DELAY_BETWEEN_HACK_TICKS_S = 5

class TarManager extends GenericIceManager {

    store: Store = null as unknown as Store
    dispatch: Dispatch = null as unknown as Dispatch
    schedule: Schedule = null as unknown as Schedule

    hackingIntervalId: ReturnType<typeof setInterval> | null = null
    reportingIntervalId: ReturnType<typeof setInterval> | null = null

    totalUnits = -1
    unitsHacked = -1
    lastUnitsHacked = -1

    enter(data: TarEnter) {

        this.unitsHacked = data.unitsHacked
        this.lastUnitsHacked = data.unitsHacked
        this.totalUnits = data.totalUnits

        tarCanvas.init(data, this.store)

        this.schedule.clear()
        this.dispatch({type: TERMINAL_CLEAR, terminalId: ICE_DISPLAY_TERMINAL_ID})

        if (data.hacked) {
            // Already solved: reveal the finished matrix (unitsHacked == totalUnits), then report
            // + auto-advance to the next layer.
            this.schedule.dispatch(0, {type: TAR_BEGIN})
            this.enterHacked()
            return
        }

        if (!data.quickPlaying) {
            this.displayTerminal(20, this.t("ice.tar.connecting"))
            this.displayTerminal(42, this.t("ice.tar.analysing"))
            this.displayTerminal(6, this.t("ice.tar.ecc-strength", data.totalUnits))
            this.displayTerminal(5, "")
            this.displayTerminal(15, this.t("ice.tar.init-arrays"))
            this.displayTerminal(20, this.t("ice.tar.gen-matrix"))
        }

        this.schedule.dispatch(35, {type: TAR_BEGIN})

        this.displayTerminal(25, this.t("ice.tar.matrix-ready"))
        this.displayTerminal(5, "")
        this.displayTerminal(15, this.t("ice.tar.brute-force"))
        this.displayTerminal(20, this.t("ice.tar.updating-progress", DELAY_BETWEEN_HACK_TICKS_S))
        this.displayTerminal(0, "")
        this.displayTerminal(0, "")
        this.schedule.run(10, () => {
            this.hackingIntervalId = setInterval(() => {
                const random = Math.floor(Math.random() * 11) - 5
                const unitsHacked = (data.unitsPerSecond * DELAY_BETWEEN_HACK_TICKS_S) + random

                webSocketConnection.sendObject("/ice/tar/hackedUnits", {
                    iceId: ice.id, units: unitsHacked
                })
            }, DELAY_BETWEEN_HACK_TICKS_S * 1000)
        })
        this.schedule.run(0, () => {
            this.reportingIntervalId = setInterval(() => {
                const progress = this.unitsHacked - this.lastUnitsHacked
                const unitsLeft = this.totalUnits - this.unitsHacked
                const speed = Math.floor(progress / DELAY_BETWEEN_HACK_TICKS_S)
                this.lastUnitsHacked = this.unitsHacked
                const secondsLeft = Math.floor(unitsLeft / speed)

                const timeLeft = formatTimeInterval(secondsLeft)
                this.schedule.dispatch(0, {type: TERMINAL_REPLACE_LAST_LINE, terminalId: ICE_DISPLAY_TERMINAL_ID, data: this.t("ice.tar.speed-line", speed, timeLeft)})

            }, DELAY_BETWEEN_HACK_TICKS_S * 1000)
        })
    }


    serverSentUpdate(data: TarStatusUpdate) {
        tarCanvas.update(data)
        this.unitsHacked = data.unitsHacked
    }

    serverSentIceHacked () {
        tarCanvas.finish()
        this.displayTerminal(30, "");
        this.displayTerminal(50, this.t("ice.access-granted"));

        this.clearIntervalTasks()
        this.processHacked()
    }

    clearIntervalTasks() {
        if (this.hackingIntervalId) {
            clearInterval(this.hackingIntervalId)
            this.hackingIntervalId = null
        }

        if (this.reportingIntervalId) {
            clearInterval(this.reportingIntervalId)
            this.reportingIntervalId = null
        }
    }

    processTarIceReset() {
        this.clearIntervalTasks()
        super.processIceReset()
    }
}

export const tarManager = new TarManager();
