import React from "react"
import {Pad} from "../../../../../common/component/Pad"
import {LayerDetails} from "../../../../../common/sites/SiteModel";
import {useTranslate} from "../../../../../common/i18n/i18n";
import {strengthDescription, toIceStrength} from "../../../../../standalone/ice/common/IceTitle";
export const ScanInfoIce =({layer, iceDescription, showStrength}: {layer: LayerDetails, iceDescription: string, showStrength: boolean}) => {
    const t = useTranslate()
    const hackedText = layer.hacked ? t( "common.yes") : t( "common.no")

    const strength = strengthDescription(toIceStrength(layer.strength), t);

    const strengthIndication = showStrength ? <><Pad length={8} />{t("scan.ice.strength")} <span className="text-info">{strength}</span><br/></> : <></>

    return (
        <>
            &nbsp;ICE ({iceDescription})<br/>
            {strengthIndication}
            <Pad length={8} />{t("scan.ice.hacked")} <span className="text-danger">{hackedText}</span>
        </>
    )
}

