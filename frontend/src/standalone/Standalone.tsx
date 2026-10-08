import {useParams} from "react-router-dom";
import {RequiresRole} from "../common/user/RequiresRole";
import {EnsureMobileGuest} from "../common/user/EnsureMobileGuest";
import {SiteHackIce} from "./ice/SiteHackIce";
import {ExternalHackIce} from "./ice/ExternalHackIce";
import {AppSelector} from "./app/AppSelector";
import {TopLevelError} from "../common/component/TopLevelError";
import React from "react";
import {WidgetSelector} from "./widget/WidgetSelector";
import {decodePath} from "../common/util/PathEncodeUtils";
import {StandaloneSiteCountdown} from "./common/StandaloneSiteCountdown";


export const Standalone = () => {
    const {encodedParam} = useParams() // encodedParam example: 'aWJnLGpqYmIlOWg6biA6OnJwKH91bHNlNXoqfSQia2xFUx9WV0BUCkocExoBGUgXAQ=='

    const path = decodePath(encodedParam as string) // param example: 'app/statusLight-0b1b-45ba?hacking=true&level=1'
    console.log(path)


    const [category, type, id] = path.split("/") // for example: /ice/siteHack/tangle-2123-4552
    switch (category) {
        case "ice":
            return <Ice route={type} id={id} />
        case "app":
            // Player-facing surface: auto-provision a mobile guest if the visitor is not logged in.
            return <EnsureMobileGuest>
                <StandaloneSiteCountdown layerId={id}><AppSelector type={type} layerId={id}/></StandaloneSiteCountdown>
            </EnsureMobileGuest>
        case "widget":
            return <WidgetSelector type={type} layerId={id}/>
        default:
            return <TypeError error={`Unknown app category: ${category}`} />
    }
}

interface IceProps {
    route: string,
    id: string
}

const Ice = ({route, id}: IceProps) => {
    switch (route) {
        case "siteHack":
            return <RequiresRole requires="ROLE_HACKER"><SiteHackIce iceId={id} nextUrl={null}/></RequiresRole>
        case "externalAccess":
            // Player-facing puzzle surface: auto-provision a mobile guest if the visitor is not logged in.
            return <EnsureMobileGuest>
                <StandaloneSiteCountdown layerId={id}><ExternalHackIce layerId={id}/></StandaloneSiteCountdown>
            </EnsureMobileGuest>
        default:
            return <TypeError error={`Unknown route: ${route}`} />
    }
}

const TypeError = ({error}: { error: string }) => {
    return <TopLevelError error="Invalid connection"
                          description={`(${error}, maybe the QR code/URL is from an older/different version of Attack Vector?)`}/>
}
