import {AnyAction} from "redux";

const SERVER_STATUS_LIGHT_UPDATE = "SERVER_STATUS_LIGHT_UPDATE"


export interface StatusLightOption {
    text: string,
    color: string,
}

export interface StatusLightState {
    switchLabel: string,
    currentOption: number | null,
    options: StatusLightOption[],
}

export const defaultState = {
    switchLabel: "",
    currentOption: null,
    options: [ { text: "", color: "grey" }, { text: "", color: "grey" } ]
}

export const statusLightReducer = (state: StatusLightState = defaultState, action: AnyAction): StatusLightState => {
    switch (action.type) {
        case SERVER_STATUS_LIGHT_UPDATE:
            return action.data
        default:
            return state
    }
}
