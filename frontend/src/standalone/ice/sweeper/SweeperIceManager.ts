import {ICE_DISPLAY_TERMINAL_ID} from "../../../common/terminal/ActiveTerminalIdReducer";
import {GenericIceManager} from "../common/GenericIceManager";
import {sweeperCanvas} from "./canvas/SweeperCanvas";
import {delay} from "../../../common/util/Util";
import {TERMINAL_CLEAR} from "../../../common/terminal/TerminalReducer";
import {SWEEPER_BEGIN, SWEEPER_RESET_START, SWEEPER_RESET_STOP} from "./reducer/SweeperUiStateReducer";
import {SweeperEnterData, SweeperModifyAction, SweeperModifyData} from "./SweeperServerActionProcessor";
import {serverCellsToGameCells, serverModifiersToGameModifiers, SweeperCellModifier, SweeperCellType,} from "./logic/SweeperLogic";
import {ice, layer} from "../../StandaloneGlobals";
import {webSocketConnection} from "../../../common/server/WebSocketConnection";
import {currentUser} from "../../../common/user/CurrentUser";
import {notify} from "../../../common/util/Notification";
import {avEncodedStandaloneUrl} from "../../../common/util/PathEncodeUtils";
import {playSfx} from "../../../common/sound/Sfx";


class SweeperIceManager extends GenericIceManager {


    cells: SweeperCellType[][] = []
    modifiers: SweeperCellModifier[][] = []
    solved: boolean = false
    userBlocked: boolean = false

    enter(sweeperEnterData: SweeperEnterData) {
        this.cells = serverCellsToGameCells(sweeperEnterData.cells)
        this.modifiers = serverModifiersToGameModifiers(sweeperEnterData.modifiers)

        this.userBlocked = sweeperEnterData.blockedUserIds.includes(currentUser.idOrEmptyString())
        const gameState = {
            cells: this.cells,
            modifiers: this.modifiers,
            strength: sweeperEnterData.strength,
            hacked: sweeperEnterData.hacked,
            blockedUserIds: sweeperEnterData.blockedUserIds,
            minesLeft: sweeperEnterData.minesLeft
        }

        delay(() => {
            sweeperCanvas.init(gameState, this.dispatch, this.store)
        })
        this.schedule.clear();
        this.dispatch({type: TERMINAL_CLEAR, terminalId: ICE_DISPLAY_TERMINAL_ID});

        if (sweeperEnterData.hacked) {
            // Already solved: reveal the cleared board, then report + auto-advance to the next layer.
            this.solved = true
            this.schedule.dispatch(0, {type: SWEEPER_BEGIN})
            this.enterHacked()
            return
        }

        if (!sweeperEnterData.quickPlaying) {
            this.displayTerminal(15, this.t("ice.sweeper.connecting"));
            this.displayTerminal(40, this.t("ice.sweeper.probing"));
            this.displayTerminal(20, this.t("ice.sweeper.memory-corruption"));
            this.displayTerminal(10, this.t("ice.sweeper.exploit-success"));
            this.displayTerminal(20, this.t("ice.sweeper.meta-access"));
            this.displayTerminal(10, this.t("ice.sweeper.granted"));
        }
        this.displayTerminal(5, this.t("ice.sweeper.repair-online"));
        this.schedule.dispatch(0, {type: SWEEPER_BEGIN});
        if (this.modifiers[0][0] !== SweeperCellModifier.REVEALED) {
            this.displayTerminal(10, "");
            this.displayTerminal(10, this.t("ice.sweeper.corner-safe"));
        }

        if (this.userBlocked) {
            this.displayTerminal(10, "");
            this.displayTerminal(5, this.t("ice.sweeper.warning-blocked"))
            this.displayTerminal(5, this.t("ice.sweeper.press-reset"));
            this.displayTerminal(5, "");
        }
    }

    serverModified(data: SweeperModifyData) {
        const newModifier = this.newModifier(data.action)
        data.cells.forEach((location: string) => { // "$x:$y"
            const parts =  location.split(":")
            const x = parseInt(parts[0])
            const y = parseInt(parts[1])
            this.modifiers[y][x] = newModifier
        })
        sweeperCanvas.serverModified(data, newModifier)
    }

    private newModifier(action: SweeperModifyAction): SweeperCellModifier {
        switch (action) {
            case SweeperModifyAction.CLEAR: return SweeperCellModifier.HIDDEN
            case SweeperModifyAction.FLAG: return SweeperCellModifier.FLAG
            case SweeperModifyAction.REVEAL:return SweeperCellModifier.REVEALED
            case SweeperModifyAction.EXPLODE: return SweeperCellModifier.REVEALED
            default: throw new Error("unexpected action: " + action)
        }
    }

    click(x: number, y: number, leftClick: boolean) {
        if (this.solved || this.userBlocked) return
        const modifier = this.modifiers[y][x]
        if (modifier === SweeperCellModifier.REVEALED) {
            return // cannot modify revealed cells
        }
        if (leftClick && modifier !== SweeperCellModifier.HIDDEN) {
            return // can only reveal unrevealed cells
        }
        const action = this.determineAction(leftClick, modifier)
        webSocketConnection.send("/ice/sweeper/interact", {iceId: ice.id, x, y, action})
    }

    private determineAction(leftClick: boolean, modifier: SweeperCellModifier): SweeperModifyAction {
        if (leftClick) return SweeperModifyAction.REVEAL
        if (modifier === SweeperCellModifier.HIDDEN) return SweeperModifyAction.FLAG
        if (modifier === SweeperCellModifier.FLAG) return SweeperModifyAction.CLEAR
        throw new Error("unexpected state: " + modifier + " leftClick: " + leftClick)
    }

    serverSentIceHacked() {
        this.solved = true
        sweeperCanvas.serverSolved(() => this.processHacked())

        this.displayTerminal(0, "");
        this.displayTerminal(20, this.t("ice.sweeper.memory-restored"));
        this.displayTerminal(40, this.t("ice.grants-access"));
    }

    blockUser(userId: string, userName: string) {
        this.displayTerminal(5, "");
        this.displayTerminal(5, this.t("ice.sweeper.user-blocked-warning", userName));
        if (currentUser.id === userId) {
            playSfx("sweeperExplosion")
            this.userBlocked = true
            notify({message: this.t("ice.sweeper.you-blocked"), type: 'ok'})
            sweeperCanvas.changeUserBlocked(true)
            this.displayTerminal(5, this.t("ice.sweeper.press-reset"));
            this.displayTerminal(5, "");
        }
    }

    unblockUser(userId: string, userName: string) {
        this.displayTerminal(5, "");
        this.displayTerminal(5, this.t("ice.sweeper.access-restored", userName));
        if (currentUser.id === userId) {
            this.userBlocked = false
            sweeperCanvas.changeUserBlocked(false)
        }
    }

    startReset(userName: string) {
        this.dispatch({type: SWEEPER_RESET_START})
        this.displayTerminal(5, this.t("ice.sweeper.reset-initiated", userName));
    }

    stopReset(userName: string) {
        this.dispatch({type: SWEEPER_RESET_STOP})
        this.displayTerminal(5, this.t("ice.sweeper.reset-aborted"));
    }

    completeReset(userName: string, newIceId: string) {
        this.displayTerminal(30, this.t("ice.sweeper.reset-completed", userName));
        this.schedule.run(0, () => {
            // A standalone (external-access) hacker must stay on the external URL of this layer — the
            // new ice is fetched by layerId there. Only the in-run window uses the siteHack ice URL.
            const path = this.externalHack ? `ice/externalAccess/${layer.id}` : `ice/siteHack/${newIceId}`
            window.open(avEncodedStandaloneUrl(path), "_self")
        })
    }
}

export const sweeperIceManager = new SweeperIceManager();
