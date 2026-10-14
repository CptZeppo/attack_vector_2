import React from "react";
import {AttributeUrlWithQr} from "./AttributeUrlWithQr";

interface Props {
    layerId: string,
    fileName: string,
}

export const AttributeIceUrlWithQr = ({layerId, fileName}: Props) => {

    // Player-facing surface reached from a phone: no manual login (/o/), a mobile guest is
    // auto-provisioned in the background. See EnsureMobileGuest.
    return <AttributeUrlWithQr name="Standalone URL" type="ice" subType="externalAccess" layerId={layerId}
                               description="Link to ICE that can be accessed without hacking into the site."
                               requireLogin={false} fileName={fileName}/>

}
