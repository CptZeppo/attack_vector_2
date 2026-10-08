import {ICE_DISPLAY_TERMINAL_ID} from "../../../common/terminal/ActiveTerminalIdReducer";
import {Schedule} from "../../../common/util/Schedule";
import {TERMINAL_RECEIVE} from "../../../common/terminal/TerminalReducer";
import {Dispatch, Store} from "redux";
import {webSocketConnection} from "../../../common/server/WebSocketConnection";
import {layer} from "../../StandaloneGlobals";
import {avEncodedStandaloneUrl} from "../../../common/util/PathEncodeUtils";
import {tStored, TranslationKey} from "../../../common/i18n/i18n";
import {playSfx, SfxName} from "../../../common/sound/Sfx";

const SERVER_REDIRECT_NEXT_LAYER = "SERVER_REDIRECT_NEXT_LAYER"

export class GenericIceManager {

    schedule: Schedule = null as unknown as Schedule
    dispatch: Dispatch = null as unknown as Dispatch

    store: Store = null as unknown as Store
    externalHack: boolean = false

    /** Translate to the current hacker's language (read from the shared language cookie). */
    t(key: TranslationKey, ...args: (string | number)[]): string {
        return tStored(key, ...args)
    }

    init(store: Store, externalHack: boolean) {
        this.store = store;
        this.externalHack = externalHack
        this.dispatch = store.dispatch;
        this.schedule = new Schedule(store.dispatch);

        webSocketConnection.addAction(SERVER_REDIRECT_NEXT_LAYER, (data: {path?: string}) => {
            this.proceedNextLayer(data.path)
        })
    }

    displayTerminal(wait: number, message: string) {
        this.schedule.dispatch(wait, {type: TERMINAL_RECEIVE, terminalId: ICE_DISPLAY_TERMINAL_ID, data: message})
    }

    enterHacked() {
        this.displayTerminal(20, this.t("ice.generic.connecting"))
        this.displayTerminal(10, this.t("ice.generic.already-hacked"))
        this.displayTerminal(0, "")

        this.requestNextLayer()
    }

    // Solving an ICE can immediately trip a tripwire on the same node (its alarm fires the instant the
    // shielding ICE clears), and the two cues played over each other. The generic ICE-solved chime is
    // therefore muted for now: only an explicitly requested sound (e.g. upload's "uploadComplete") plays.
    processHacked(sound?: SfxName) {
        if (sound) playSfx(sound)
        this.schedule.run(0, () => {
            if (this.externalHack) {
                this.requestNextLayer()
            } else {
                window.close()
            }
        })
    }

    requestNextLayer() {
        if (this.externalHack) {
            webSocketConnection.send("/ice/next", JSON.stringify({layerId: layer.id}))
        }
    }

    proceedNextLayer(path?: string) {
        if (!path) {
            this.displayTerminal(60, this.t("ice.generic.no-underlying"))
            return
        }

        this.displayTerminal(60, this.t("ice.generic.transitioning"))
        this.schedule.run(0, () => {
            document.location.href = avEncodedStandaloneUrl(path)
        })
    }

    processIceReset() {
        playSfx("connectionLost")
        this.displayTerminal(0, "")
        this.displayTerminal(20, this.t("ice.generic.reset-detected"))
        this.displayTerminal(80, this.t("ice.generic.connection-lost"))
        this.schedule.run(0, () => {
            window.close()
        })
    }

}
