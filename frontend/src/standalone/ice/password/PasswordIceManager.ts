import {ICE_DISPLAY_TERMINAL_ID} from "../../../common/terminal/ActiveTerminalIdReducer"
import {GenericIceManager} from "../common/GenericIceManager"
import {TERMINAL_CLEAR} from "../../../common/terminal/TerminalReducer"
import {terminalManager} from "../../../common/terminal/TerminalManager"
import {ICE_PASSWORD_BEGIN} from "./reducer/PasswordReducer";
import {AuthEnter} from "../../app/auth/AuthServerActionProcessor";


class PasswordIceManager extends GenericIceManager {

    enter(data: AuthEnter) {
        this.schedule.clear()
        this.dispatch({type: TERMINAL_CLEAR, terminalId: ICE_DISPLAY_TERMINAL_ID})

        if (data.hacked) {
            this.enterHacked()
            return
        }

        this.displayTerminal(20, this.t("ice.generic.connecting"))
        if (!data.quickPlaying) {
            this.displayTerminal(20, this.t("ice.password.scanning"))
            this.displayTerminal(20, "↼ .......................................................................................................................")
            this.displayTerminal(30, this.t("ice.password.found-weak"))
            this.displayTerminal(20, this.t("ice.password.brute-force"))
            this.displayTerminal(30, this.t("ice.password.timeout-detected"))
            this.displayTerminal(20, this.t("ice.password.timeout-failed"))
            this.displayTerminal(20, "")
        }
        this.displayTerminal(20, this.t("ice.password.suggested"))
        this.schedule.run(0, () => {
            terminalManager.start()
        })
        this.schedule.dispatch(0, {type: ICE_PASSWORD_BEGIN})
    }

    close() {
        this.schedule.clear()
    }

    serverSentIceHacked() {
        this.displayTerminal(0, "")
        this.displayTerminal(20, this.t("ice.password.accepted"))
        this.displayTerminal(40, this.t("ice.grants-access"))

        this.processHacked()
    }
}

export const passwordIceManager = new PasswordIceManager()
