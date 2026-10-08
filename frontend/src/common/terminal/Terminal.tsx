import React, {createRef, useRef} from 'react';
import {useDispatch} from "react-redux";
import {TerminalInput} from "./TerminalInput";
import {TerminalLine} from "./TerminalLine";
import {terminalManager} from "./TerminalManager";
import {TERMINAL_KEY_PRESS, TerminalState} from "./TerminalReducer";
import {ICE_INPUT_TERMINAL_ID} from "./ActiveTerminalIdReducer";
import {BACKSPACE} from "../util/KeyCodes";

/// The line that is being displayed one character at a time
const renderRenderingLine = (terminalState: TerminalState) => {
    if (!terminalState.renderingLine) {
        return <div/>
    }
    return <TerminalLine line={terminalState.renderingLine} lastBlockIndex={terminalState.renderingLineBlockIndex}
                         characterIndex={terminalState.renderingBlockInsideIndex}/>
}


interface Props {
    terminalState: TerminalState,
    submit?: () => void
    height?: number | string,
}


export const Terminal = ({terminalState, height, submit}: Props) => {

    const bottomRef = createRef<HTMLDivElement>()
    React.useEffect(() => {
        if (terminalState.autoScroll && bottomRef.current !== null) {
            // Scroll only the terminal's own scroll container to the bottom.
            // Using scrollIntoView() here would also scroll the page/ancestors,
            // which pushed the ICE puzzle header out of view during gameplay.
            const container = bottomRef.current.parentElement
            if (container !== null) {
                container.scrollTop = container.scrollHeight
            }
        }
    })

    if (submit) {
        terminalManager.registerTerminalSubmit(terminalState.id, submit);
    }

    if (terminalState.renderOutput) {
        return <div className="terminalPanel terminal_scrollbar" style={{height: height, position: "relative"}}>
            {terminalState.renderedLines.map((line, index) => <TerminalLine line={line} key={line.key}/>)}
            {renderRenderingLine(terminalState)}
            <TerminalInput terminalState={terminalState}/>
            <div ref={bottomRef}/>
        </div>;
    } else {
        return <div className="terminalPanel" style={{height: height, position: "relative"}}>
            <TerminalInput terminalState={terminalState}/>
        </div>;
    }

}
