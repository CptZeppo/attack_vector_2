import React from 'react'
import {wordSearchCanvas} from "../canvas/WordSearchCanvas";
import {LetterGrid} from "./LetterGrid";


const mouseDown = (event: React.MouseEvent<HTMLTableElement>) => {
    wordSearchCanvas.mouseDown(event.nativeEvent)
}

const mouseUp = (event: React.MouseEvent<HTMLTableElement>) => {
    wordSearchCanvas.mouseUp(event.nativeEvent)
}

const mouseMove = (event: React.MouseEvent<HTMLTableElement>) => {
    wordSearchCanvas.mouseMove(event.nativeEvent)
}

// Touch support: a drag on a touch screen does not emit mouse events, so feed the canvas a
// normalized point built from the touch. fabric's getPointer reads clientX/clientY and maps via
// getBoundingClientRect, so coordinates stay correct under the canvas' transform: scale().
// Scrolling/zoom during the drag is suppressed via `touch-action: none` in ice.css.
const toPoint = (touch: React.Touch): MouseEvent =>
    ({clientX: touch.clientX, clientY: touch.clientY, target: touch.target} as unknown as MouseEvent)

const touchStart = (event: React.TouchEvent<HTMLTableElement>) => {
    if (event.touches.length === 0) return
    wordSearchCanvas.mouseDown(toPoint(event.touches[0]))
}

const touchMove = (event: React.TouchEvent<HTMLTableElement>) => {
    if (event.touches.length === 0) return
    wordSearchCanvas.mouseMove(toPoint(event.touches[0]))
}

const touchEnd = (event: React.TouchEvent<HTMLTableElement>) => {
    const touch = event.changedTouches[0]
    wordSearchCanvas.mouseUp(touch ? toPoint(touch) : (event.nativeEvent as unknown as MouseEvent))
}

export const WordSearchPuzzle = () => {

    return <table
        onMouseDown={(event) => mouseDown(event)}
        onMouseUp={(event) => mouseUp(event)}
        onMouseMove={(event) => mouseMove(event)}
        onTouchStart={(event) => touchStart(event)}
        onTouchMove={(event) => touchMove(event)}
        onTouchEnd={(event) => touchEnd(event)}
        onTouchCancel={(event) => touchEnd(event)}
    >
        <tbody>
            <LetterGrid />
        </tbody>
    </table>


}
