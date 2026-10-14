import React, {createRef} from 'react'
import {useSelector} from "react-redux"
import {Terminal} from "../../../../common/terminal/Terminal"
import {WordSearchRootState} from "../reducer/WordSearchRootReducer";
import {WordSearchPuzzle} from "./WordSearchPuzzle";
import {IceTitle} from "../../common/IceTitle";
import {HIDDEN} from "../../common/IceModel";
import {CloseTabButton} from "../../common/CloseTabButton";

export const WordSearchHome = () => {

    const puzzle = useSelector( (state:WordSearchRootState) => state.puzzle )
    const displayTerminal = useSelector( (state:WordSearchRootState) => state.displayTerminal )
    const uiState = useSelector( (state:WordSearchRootState) => state.uiState )

    const classShowCanvas = (uiState === HIDDEN) ? " hidden_alpha" : ""

    const puzzleRef = createRef<HTMLDivElement>()

    const moveIt = () => {
        const canvasContainerRef = document.getElementsByClassName("canvas-container")?.item(0)
        if (!canvasContainerRef || !puzzleRef.current) {
            setTimeout(moveIt, 2)
            return
        }
        canvasContainerRef.appendChild(puzzleRef.current)
    }
    setTimeout(moveIt, 2)

    return (
        <div className="icePanelRow iceFitPending">
            <div className="col-lg-12">
                <div className="row align-items-start iceHeaderRow">
                    <div className="col-auto iceTitleCol">
                        <IceTitle name="Jaal" strength={puzzle.strength}/>
                    </div>
                    <div className="col iceTerminalCol" style={{paddingTop: "4px"}}>
                        <Terminal terminalState={displayTerminal} height={84}/>
                    </div>
                    <div className="col-auto iceCloseCol">
                        <div className="float-end">
                            <CloseTabButton/>
                        </div>
                    </div>
                </div>

                <div className={"row transition_alpha_fast" + classShowCanvas} style={{position: "relative"}}>
                    <div className="col-lg-12">
                        <div>
                            <canvas id="wordSearchCanvas" style={{
                                "borderRadius": "3px 3px 3px 3px",
                                "marginTop": "10px",
                                "marginBottom": "10px",
                            }}/>
                        </div>
                    </div>
                    <div id="letterGrid" className={"iceWsGrid transition_alpha_fast" + classShowCanvas} ref={puzzleRef}>
                        <WordSearchPuzzle />
                    </div>
                </div>

            </div>
        </div>
    )
}
