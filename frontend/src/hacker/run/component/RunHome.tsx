import React from 'react'
import {useDispatch, useSelector} from "react-redux"
import {Terminal} from "../../../common/terminal/Terminal"
import {RunCanvasPanel} from "./RunCanvasPanel"
import {NodeScanInfo} from "./scaninfo/NodeScanInfo"
import {TERMINAL_SUBMIT, TerminalState} from "../../../common/terminal/TerminalReducer"
import {Dispatch} from "redux"
import {Timers} from "../timer/Timers";
import {ENTER_KEY} from "../../../common/util/KeyCodes";
import {webSocketConnection} from "../../../common/server/WebSocketConnection";
import {currentUser} from "../../../common/user/CurrentUser";
import {HackerRootState} from "../../HackerRootReducer";
import {ScriptPanel} from "./script/ScriptPanel";
import {useTranslate} from "../../../common/i18n/i18n";


const TerminalAndScanResultPanel = (infoNodeId: string | null, terminal: TerminalState, submit: () => void) => {

    const timerCount = useSelector((state: HackerRootState) => state.run.timers.length)
    const uploadCount = useSelector((state: HackerRootState) => state.run.uploads.length)
    const adjustedTimerCount = timerCount > 0 ? timerCount : 1

    if (infoNodeId) {
        return (<NodeScanInfo/>)
    }

    // Responsive: fill the viewport height minus the bottom navbar, timers, upload bars and margins.
    const reserved = 847 - (adjustedTimerCount * 24) - 23
    const terminalHeight = `calc(100vh - ${reserved}px)`

    return <>
        <Timers/>
        <div className="row">
            <Terminal terminalState={terminal} submit={submit} height={terminalHeight}/>
        </div>
    </>
}


export const RunHome = () => {

    const dispatch: Dispatch = useDispatch()

    const siteName = useSelector((state: HackerRootState) => {
        return (state.run.site.siteProperties) ? state.run.site.siteProperties.name : ""
    })
    const terminal = useSelector((state: HackerRootState) => state.terminal)
    const submit = () => {
        webSocketConnection.sendObjectWithRunId("/terminal/main", {command: terminal.input});

        dispatch({type: TERMINAL_SUBMIT, key: ENTER_KEY, command: terminal.input, terminalId: terminal.id});
    }
    const infoNodeId = useSelector((state: HackerRootState) => state.run.infoNodeId)
    const t = useTranslate()

    return (
        <>
            <ScriptPanel/>
            <div className="row">
                <div className="col-lg-5">
                    {TerminalAndScanResultPanel(infoNodeId, terminal, submit)}
                </div>
                <div className="col-lg-7">
                    <div className="row">
                        <div className="col-lg-12 d-flex justify-content-between align-items-center">
                            <span className="text">{t("run.site-label")} {siteName}</span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <RunCanvasPanel dispatch={dispatch} userId={currentUser.id}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
