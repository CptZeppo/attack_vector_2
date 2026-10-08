import React from 'react'
import {useDispatch, useSelector} from "react-redux"
import {Terminal} from "../../../../common/terminal/Terminal"
import {IceTitle} from "../../common/IceTitle";
import {SweeperRootState} from "../reducer/SweeperRootReducer";
import {HIDDEN} from "../../common/IceModel";
import {IceStrength} from "../../../../common/model/IceStrength";
import {sweeperCanvas} from "../canvas/SweeperCanvas";
import {SWEEPER_IMAGES} from "../canvas/SweeperCellDisplay";
import {RESET_MILLIS, SWEEPER_RESET_START, SWEEPER_RESET_STOP, SweeperResetState} from "../reducer/SweeperUiStateReducer";
import {webSocketConnection} from "../../../../common/server/WebSocketConnection";
import {ice} from "../../../StandaloneGlobals";
import {CloseTabButton} from "../../common/CloseTabButton";
import {currentUser} from "../../../../common/user/CurrentUser";
import {useTranslate} from "../../../../common/i18n/i18n";

/* eslint jsx-a11y/alt-text: 0*/

export const SweeperHome = () => {

    const uiMode = useSelector((rootState: SweeperRootState) => rootState.ui.mode)
    const strength: IceStrength = useSelector((rootState: SweeperRootState) => rootState.ui.strength)
    const minesLeft = useSelector((rootState: SweeperRootState) => rootState.ui.minesLeft)
    const t = useTranslate()

    const classShowCanvas = (uiMode === HIDDEN) ? " hidden_alpha" : ""


    return (
        <div className="icePanelRow iceFitPending">
            <div className="col-lg-12">
                <div className="row align-items-start iceHeaderRow">
                    <div className="col-auto">
                        <IceTitle name="Visphotak" strength={strength}/>
                    </div>
                    <div className="col-auto" style={{width: 150}}>
                        <ResetIce/>
                    </div>
                    <div className="col-auto">
                        <h4 className="text-center text-success" data-testid="minesLeft">{t("ice.sweeper.left")}<br/><span className="text-info">{minesLeft}</span></h4>
                    </div>
                    <div className="col iceTerminalCol" style={{paddingTop: "4px"}}>
                        <DisplayTerminal/>
                    </div>
                    <div className="col-auto">
                        <div className="float-end">
                            <CloseTabButton/>
                        </div>
                    </div>

                </div>

                <div className={"row transition_alpha_fast" + classShowCanvas}>
                    <div className="col-lg-12">
                        <div>
                            <canvas id="netwalkCanvas" style={{
                                "borderRadius": "3px 3px 3px 3px",
                                "marginTop": "10px",
                                "marginBottom": "10px",
                            }}/>
                        </div>
                    </div>
                </div>
            </div>
            <SweeperImages/>
        </div>
    )
}

const SweeperImages = () => {
    return <>
        {Object.values(SWEEPER_IMAGES).map((image) => {
            return <SweeperImage id={image.id} fileName={image.fileName} key={image.id}/>
        })
        }</>
}


interface ImageLoadedProps {
    id: string,
    fileName: string
}

const imageLoaded = () => {
    sweeperCanvas.imageLoaded(Object.keys(SWEEPER_IMAGES).length)
}

const SweeperImage = ({id, fileName}: ImageLoadedProps) => {
    const path = `/img/frontier/ice/sweeper/${fileName}`
    return <span><img id={id} src={path} style={{display: "none"}} onLoad={imageLoaded}/></span>
}

const DisplayTerminal = () => {
    const displayTerminal = useSelector((rootState: SweeperRootState) => rootState.displayTerminal)
    return <Terminal terminalState={displayTerminal} height={84}/>
}

let resetTimeoutId: ReturnType<typeof setTimeout> | null = null

const ResetIce = () => {
    const dispatch = useDispatch()
    const t = useTranslate()
    const resetState = useSelector((rootState: SweeperRootState) => rootState.ui.resetState)
    const resetVisualProgress = useSelector((rootState: SweeperRootState) => rootState.ui.resetProgress)
    const userBlocked = useSelector((rootState: SweeperRootState) => rootState.ui.blockedUserIds.includes(currentUser.idOrEmptyString()))

    const startReset = () => {
        if (resetState !== SweeperResetState.IDLE) {
            return
        }
        dispatch({type: SWEEPER_RESET_START})
        webSocketConnection.send("/ice/sweeper/startReset", {iceId: ice.id})
        resetTimeoutId = setTimeout(() => {
            webSocketConnection.send("/ice/sweeper/completeReset", {iceId: ice.id})
            resetTimeoutId = null
        }, RESET_MILLIS)

    }
    const stopReset = () => {
        if (resetState !== SweeperResetState.IN_PROGRESS || resetVisualProgress >= 100) {
            return
        }
        dispatch({type: SWEEPER_RESET_STOP})
        webSocketConnection.send("/ice/sweeper/stopReset", {iceId: ice.id})
        if (resetTimeoutId !== null) {
            clearTimeout(resetTimeoutId)
            resetTimeoutId = null
        }
    }
    const animated = (resetVisualProgress < 40) ? "" : "progress-bar-animated"

    const text = (resetState === SweeperResetState.IDLE) ? t("ice.sweeper.reset") : ""
    const progressBackgroundColor = (userBlocked && resetState === SweeperResetState.IDLE) ? "#0dcaf0" : ""

    return (<div style={{marginTop: "7px"}}>

            <div className="progress" style={{height: 25, cursor: "pointer", position: "relative", top: "-15", backgroundColor: progressBackgroundColor,
                     // Hold-to-reset takes 7s. On touch, a long press would otherwise pop the OS
                     // text-selection callout / context menu and fire `touchcancel`, aborting the hold.
                     touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none"}}
                 onContextMenu={(e) => e.preventDefault()}
                 onMouseDown={startReset} onMouseLeave={stopReset} onMouseUp={stopReset}
                 onTouchStart={startReset} onTouchEnd={stopReset} onTouchCancel={stopReset}>
                <div className={`progress-bar bg-danger progress-bar-striped ${animated} noTransition`}
                     role="progressbar"
                     aria-valuenow={75} aria-valuemin={0}
                     aria-valuemax={100} style={{width: `${resetVisualProgress}%`}}>
                </div>
            </div>
            <div className="text" style={{
                position: "relative", top: -20, paddingLeft: 16,
                fontSize: 20, color: "black", cursor: "pointer", userSelect: "none", pointerEvents: "none",
            }}><strong>{text}</strong>
            </div>
        </div>
    )
}

