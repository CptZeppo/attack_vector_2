import React from "react";
import {useSelector} from "react-redux";
import {StatusLightState} from "./StatusLightReducers";
import {getReadableTextColor} from "./contrast-color";
import {useMobileViewport} from "../../../common/util/mobile";
import {useTranslate} from "../../../common/i18n/i18n";

/**
 * Status-light widget: a freely-accessible (/o/, WS_UNRESTRICTED), display-only fullscreen view of a
 * StatusLightLayer's current state, meant for a screen on another device that mirrors what a hacker
 * flips on the switch. Shares the switch's visual language (dark, monospace, the coloured
 * status-light-color-box) but is deliberately minimal: just the switch label as a heading and one big
 * status indicator filling the screen - no eyebrow/footer fluff.
 *
 * useMobileViewport() resets the app-global body{zoom} that otherwise shrinks the page to ~22% on a
 * phone/tablet (see mobile.ts / docs/development/dev-notes.md); layout is fluid (vmin) so it fills any display 1:1.
 */
export const StatusLight = () => {
    useMobileViewport()
    const t = useTranslate()
    const state: StatusLightState = useSelector((state: StatusLightState) => state)

    if (state.currentOption === null) {
        return (
            <div className="widgetConsole" data-bs-theme="dark">
                <div className="switchConnecting">{t("switch.connecting")}</div>
            </div>
        )
    }

    const option = state.options[state.currentOption]
    const color = option?.color || "grey"
    const contrastColor = getReadableTextColor(color)
    const text = option?.text || ""

    return (
        <div className="widgetConsole" data-bs-theme="dark">
            {state.switchLabel && <h1 className="widgetTitle">{state.switchLabel}</h1>}
            <div className="widgetStatus status-light-color-box"
                 style={{"--status-light-color": color, color: contrastColor} as React.CSSProperties}>
                <span className="widgetStatusText">{text}</span>
            </div>
        </div>
    )
}
