import React from "react";
import {TopLevelError} from "../../common/component/TopLevelError";
import {StatusLightRoot} from "./statusLight/StatusLightRoot";
import {TripwireWidget} from "./tripwire/TripwireWidget";
import {UploadWidget} from "./upload/UploadWidget";
import {EnsureMobileGuest} from "../../common/user/EnsureMobileGuest";


interface Props {
    type: string,
    layerId: string,
}

export const WidgetSelector = ({type, layerId}: Props) => {

    switch(type) {
        case "statusLight":
            return <StatusLightRoot layerId={layerId}/>
        case "tripwire":
            // Polls /api/siteStatus (needs ROLE_MOBILE) -> auto-provision a mobile guest if not logged in.
            return <EnsureMobileGuest><TripwireWidget layerId={layerId}/></EnsureMobileGuest>
        case "upload":
            // Polls /api/upload + /api/siteStatus (needs ROLE_MOBILE) -> auto-provision a mobile guest.
            return <EnsureMobileGuest><UploadWidget layerId={layerId}/></EnsureMobileGuest>
        default:
            return <TopLevelError error="Invalid connection"
                                  description={`(Unknown widget type: ${type}, maybe the QR code/URL is from an older/different version of Attack Vector?)`}/>
    }
}
