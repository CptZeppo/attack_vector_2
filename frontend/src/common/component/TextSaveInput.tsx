import React, {CSSProperties, useRef, useState} from 'react';
import {ENTER_KEY} from "../util/KeyCodes";
import {useDispatch} from "react-redux";
import {TEXT_INPUT_CHANGED} from "./terminalPreview/terminalPreviewReducer";

/*
When the focus is lost, enter is hit, or this component is no longer rendered, the component fires its "save" method as provided by the props.
During the saving, a floppy disk 'save' icon is shown.

This component does something that is not supported by React. See the longer text at the bottom for an explanation.
*/

export enum TextSaveType { TEXT, TEXTAREA }

interface Props {
    id?: string,
    value?: string | number,
    placeholder?: string,
    type?: TextSaveType,
    save: (value: string) => void,
    className: string,
    rows?: number,
    readonly?: boolean,
    maxLength?: number,
    style?: CSSProperties,
    name?: string,
    sendEvent?: boolean,
}

enum State {
    IDLE = "IDLE",
    EDITING = "EDITING",
    SHOW_SAVE = "SHOW_SAVE",
    WAITING_FOR_SERVER = "WAITING_FOR_SERVER",
}

const stateMap: Map<string, State> = new Map<string, State>()

export const TextSaveInput = (props: Props) => {
    const readonly = props.readonly ? props.readonly : false
    // convert potential number values to string, otherwise equals detection does not work
    const valueFromProps = "" + props.value

    const [id] = useState(new Date().getTime() + ":" + Math.random())
    const [dummy, setDummy] = useState(0) // dummy state to force re-rendering when value changes
    const [saveIcon, setSaveIcon] = useState(false)
    const dispatch = useDispatch()

    // The current value is stored per-instance in a ref (not in a module global), so that multiple
    // TextSaveInputs rendered at once (e.g. the editor's layer panel has Layer name + Hacked text)
    // don't overwrite each other's value on re-render. A ref (rather than useState) is used so the
    // value survives re-renders without triggering them, and so the blur closure below reads the
    // latest value even when invoked externally via saveTextInput(). See the note at the bottom.
    const valueRef = useRef<string>(valueFromProps)

    if (!stateMap.has(id)) {
        stateMap.set(id, State.IDLE)
    }
    let state = stateMap.get(id) as State

    if (state === State.IDLE && valueFromProps !== valueRef.current) { // update from external
        valueRef.current = valueFromProps
    }

    if (state === State.EDITING) {
        // nothing to do, wait for next state. Ignore updates from external, they will be overwritten when this user saves.
    }

    if (state === State.SHOW_SAVE) {
        stateMap.set(id, State.WAITING_FOR_SERVER)
    }

    if (state === State.WAITING_FOR_SERVER) {
        if (valueFromProps === valueRef.current) { // save successful
        } else { // save unsuccessful, revert back to previous values
            valueRef.current = valueFromProps
        }
        stateMap.set(id, State.IDLE)
        setSaveIcon(false)
    }

    const handleChange = (event: any) => {
        // Called when value of input changes (key pressed, or text pasted)
        if (state === State.IDLE) {
            stateMap.set(id, State.EDITING)
        }
        valueRef.current = event.target.value
        currentTextInputBlurMethod = handleBlur

        setDummy(dummy + 1) // force re-rendering

        if (props.sendEvent) {
            dispatch({type: TEXT_INPUT_CHANGED, text: valueRef.current})
        }
    }

    const handleKeyDown = (event: any, defocusOnEnter: boolean) => {
        if (state === State.EDITING) {
            if (event.keyCode === ENTER_KEY && defocusOnEnter) {
                event.target.blur();
            }
        }
    }

    const handleBlur = () => {
        // This method can be called from outside the component.
        // We don't want the state from the closer in case it was called from outside, we want the current state.

        const currentState = stateMap.get(id) as State
        if (currentState === State.EDITING) {
            if (valueRef.current === props.value) { // nothing changed, no save needed.
                stateMap.set(id, State.IDLE)
            } else {
                stateMap.set(id, State.SHOW_SAVE)
                props.save(valueRef.current) // trigger call to server, that will in turn trigger call to update this component.
                setSaveIcon(true)
            }
        }

        currentTextInputBlurMethod = null
    }


    // Don't have text be null or undefined, this will cause React to treat the Input as
    // an uncontrolled component and then later detect that it is now a controlled component.
    // This will log errors in the console
    let text = valueRef.current;
    if (text === null || text === undefined) {
        text = ''
    }

    let icon = (saveIcon) ? (<span className="form-control-feedback d-flex justify-content-end saveIcon"><span
        className="glyphicon glyphicon-floppy-save"
        aria-hidden="true"/></span>) : '';

    if (props.type === TextSaveType.TEXTAREA) {
        const rows = (props.rows) ? props.rows : 5
        return (
            <span>
                <textarea id={props.id}
                          className={props.className}
                          placeholder={props.placeholder}
                          value={text}
                          onChange={(event) => handleChange(event)}
                          onKeyDown={(event) => handleKeyDown(event, false)}
                          onBlur={handleBlur}
                          rows={rows}
                          disabled={readonly}
                          name={props.name}
                />
                {icon}
            </span>
        );
    } else {
        return (
            <span>
                    <input id={props.id}
                           type="text" className={props.className}
                           placeholder={props.placeholder}
                           value={text}
                           onChange={(event) => handleChange(event)}
                           onKeyDown={(event) => handleKeyDown(event, true)}
                           onBlur={handleBlur}
                           disabled={readonly}
                           maxLength={props.maxLength}
                           style={props.style}
                           name={props.name}
                    />
                {icon}
                </span>
        );
    }
}




/*
We want to have the component showing the "save" icon and then wait for an update from the server
However, there is no good way to detect an update from the server. The only thing we have are the props inserted by the parent, and the fact that
the component got re-rendered.

The update from the server can be one of two options:
- The update was accepted, and the server sends back the supplied value as the new value for this component.
- The update was rejected, and the server sends back the old value for this component.

The component is re-rendered whenever we make a change to it. We want to show the 'save' icon, so we will at least rerender once.

The solution is to track the state of the component outside of the component. This is against React best practice. But it allows the component
to check if it's in the state where it's waiting for a response from the server.

Any solution where state is tracked inside the component will not work, because the component will be re-rendered each time the state is updated


Additional complication: we want this component to save when it is no longer rendered. In the editor there are two situations this can occur
- the user clicks on the canvas, and the layer panel is no longer rendered. This means the component is no longer rendered. In this case the onBlur() method is triggered
 by the browser, so saving is done automatically.

- The user clicks on another node. The layer panel of that node is rendered, and this (propably) includes the TextInput, but for another layer. In this case the onBlur()
 method is not triggered. To solve this, there is the global saveTextInput method that is triggered when a new node is selected. This method will trigger the onBlur() of
 the component that was last focussed. This works, but introduces new problems. The 'value' of the component is read inside the closure of the function that is stored.
 When storing the value of the component via a regular useState hook, the _old_ value of the component is captured in the closure. To get around this, the value is held
 in a per-instance ref (valueRef): the closure captures the stable ref and reads .current at call time, so it always sees the latest value. (Earlier this used a single
 module-global value, but that was shared across all mounted instances, so siblings - e.g. Layer name + Hacked text in the editor panel - overwrote each other's value on
 re-render. The per-instance ref fixes that.)
*/
let currentTextInputBlurMethod: (() => void) | null = null

// When React stops rendering this textinput, it usually calls the onBlur method. However, this is not consistent, and in some cases, the onBlur is not called.
// That is annoying, as this means that any changed input in that method is lost. To prevent this, we have this global method that can be called to trigger the onBlur
// of the last TextInput that was focussed.
export const saveTextInput = () => {
    if (currentTextInputBlurMethod) {
        currentTextInputBlurMethod()
    }
}
