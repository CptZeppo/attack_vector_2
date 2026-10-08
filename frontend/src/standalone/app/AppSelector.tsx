import React, {useEffect, useState} from "react"
import {SwitchRoot} from "./switch/SwitchRoot";
import {TopLevelError} from "../../common/component/TopLevelError";
import {AuthRoot} from "./auth/AuthRoot";
import {TextRoot} from "./text/TextRoot";
import {TimerAdjusterRoot} from "./timerAdjuster/TimerAdjusterRoot";
import {avEncodedStandaloneUrl} from "../../common/util/PathEncodeUtils";
import {tStored} from "../../common/i18n/i18n";


interface ServerResponse {
    appId: string,
    redirectLayerId: string | null,
    error: string | null,
}


interface Props {
    type: string,
    layerId: string,
}

export const AppSelector = ({type, layerId}: Props) => {

    const [response, setResponse] = useState(null as ServerResponse | null)

    useEffect(() => {
        const fetchData = async () => {
            console.log(`fetching: /api/app/${layerId}`)
            const response: Response = await fetch(`/api/app/${layerId}`)
            const text: string = await response.text()
            console.log(`response: ${text}`)
            const responseObject = JSON.parse(text)
            setResponse(responseObject)
        }

        fetchData().catch((error: unknown) => {
            setResponse({appId: "", redirectLayerId: "", error: String(error)})
        });
    }, []) /* eslint react-hooks/exhaustive-deps: 0 */

    if (response === null) {
        return <div style={{color: "dimgrey"}}>{tStored("app.loading")}</div>
    }

    if (response.error) {
        return <TopLevelError error={tStored("app.error.load-failed")}
                              description={`(server: ${response.error})`}/>
    }

    if (response.redirectLayerId) {
        // A higher-level ICE on this node is still unhacked. Layers are hacked top-down, so the
        // player is sent to that protecting layer first. To reach a switch or countdown adjuster the
        // player must hack down to it, so route to the ICE puzzle (ice/externalAccess); solving it
        // chains downward via gotoNextLayerAfterExternalHack until the target is reachable. The auth
        // (password-bypass) surface keeps its own password chain. avEncodedStandaloneUrl picks /x/
        // for a real hacker and /o/ for an auto-provisioned mobile guest.
        const path = (type === "switch" || type === "timerAdjuster")
            ? `ice/externalAccess/${response.redirectLayerId}`
            : `app/auth/${response.redirectLayerId}`
        const url = avEncodedStandaloneUrl(path)
        window.location.href = url
        return <div />
    }

    switch (type) {
        case "switch":
            return <SwitchRoot layerId={layerId}/>
        case "auth":
            return <AuthRoot iceId={response.appId} layerId={layerId}/>
        case "text":
            return <TextRoot layerId={layerId}/>
        case "timerAdjuster":
            return <TimerAdjusterRoot layerId={layerId}/>
        default:
            return <TopLevelError error={tStored("app.error.server")}
                                  description={tStored("app.error.unknown-type", type)}/>
    }
}
