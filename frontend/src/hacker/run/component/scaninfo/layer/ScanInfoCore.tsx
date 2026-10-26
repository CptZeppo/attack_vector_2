import React from "react";
import {LayerDetails} from "../../../../../common/sites/SiteModel";
import {useTranslate} from "../../../../../common/i18n/i18n";
export const ScanInfoCore = ({layer}: {layer: LayerDetails}) => {
    const t = useTranslate()
    const reveal = layer.revealNetwork ? t( "common.yes") : t( "common.no")
    return (
        <> - {t("scan.core")} <span className="text-info" >{reveal}</span></>
    )
}
