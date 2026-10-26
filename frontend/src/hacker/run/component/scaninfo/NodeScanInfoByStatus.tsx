import React from "react"
import {NodeScanStatus} from "../../../../common/enums/NodeStatus"
import {NodeScanInfoLayers} from "./NodeScanInfoLayers"
import {NodeI} from "../../../../common/sites/SiteModel";
import {TranslationKey, useTranslate} from "../../../../common/i18n/i18n";

function renderUnconnectable(t: (key: TranslationKey) => string) {
    return <>
        {t("scan.unconnectable")}<br/>
    </>
}

function renderConnectable(t: (key: TranslationKey) => string) {
    return <>
        {t("scan.connectable.1")}<br/>
        <br/>
        {t("scan.connectable.2")}<br/>
    </>
}

function renderError(node: NodeI, status: NodeScanStatus, t: (key: TranslationKey, ...args: (string | number)[]) => string) {
    return <>{t("scan.error", status, node.id)}<br/></>
}

export const NodeScanInfoByStatus = ({node, status}: { node: NodeI, status: NodeScanStatus }) => {
    const t = useTranslate()
    switch (status) {
        case NodeScanStatus.UNCONNECTABLE_1:
            return renderUnconnectable(t)
        case NodeScanStatus.CONNECTABLE_2:
            return renderConnectable(t)
        case NodeScanStatus.ICE_PROTECTED_3:
            return <NodeScanInfoLayers node={node} allLayersRevealed={false}/>
        case NodeScanStatus.FULLY_SCANNED_4:
            return <NodeScanInfoLayers node={node} allLayersRevealed={true}/>
        default:
            return renderError(node, status, t)
    }
}
