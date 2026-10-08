import {ICE_DISPLAY_TERMINAL_ID} from "../../../common/terminal/ActiveTerminalIdReducer";
import {GenericIceManager} from "../common/GenericIceManager";
import {TERMINAL_CLEAR} from "../../../common/terminal/TerminalReducer";
import {netwalkCanvas} from "./canvas/NetwalkCanvas";
import {NetwalkRotateUpdate, ServerEnterIceNetwalk} from "./NetwalkServerActionProcessor";
import {NETWALK_BEGIN} from "./reducer/NetwalkStateReducer";


class NetwalkManager extends GenericIceManager {


    enter(data: ServerEnterIceNetwalk) {
        netwalkCanvas.init(data, this.dispatch, this.store)

        this.schedule.clear()
        this.dispatch({type: TERMINAL_CLEAR, terminalId: ICE_DISPLAY_TERMINAL_ID})

        if (data.hacked) {
            // Already solved: reveal the connected grid (persisted rotations are the solution),
            // then report + auto-advance to the next layer.
            this.schedule.dispatch(0, {type: NETWALK_BEGIN})
            this.enterHacked()
            return
        }

        if (!data.quickPlaying) {
            this.displayTerminal(20, this.t("ice.netwalk.connecting"));
            this.displayTerminal(42, this.t("ice.netwalk.detected"));
            this.displayTerminal(6, this.t("ice.netwalk.auto-reconfig"));
            this.displayTerminal(34, this.t("ice.netwalk.reconfiguring"));
            this.displayTerminal(50, this.t("ice.netwalk.status-check"));
            this.displayTerminal(20, this.t("ice.netwalk.integrity"));
        }

        this.schedule.dispatch(0, {type: NETWALK_BEGIN});

        this.displayTerminal(15, this.t("ice.remote-coredump"));
        this.displayTerminal(5, " ");
    }

    serverSentNodeRotated(data: NetwalkRotateUpdate) {
        netwalkCanvas.serverSentNodeRotated(data)
    }

    serverSentIceHacked() {
        netwalkCanvas.finish()
        this.displayTerminal(10, this.t("ice.netwalk.config-restored"));
        this.displayTerminal(44, "");
        this.displayTerminal(50, this.t("ice.access-granted"));
        this.displayTerminal(20, "");

        this.processHacked()
    }
}

export const netwalkManager = new NetwalkManager();
