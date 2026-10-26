import React from "react";
import {LayerDetails} from "../../../../../common/sites/SiteModel";
import {TimerAdjustmentRecurring, TimerAdjustmentType} from "../../../../../common/model/layer/LayerTimerAdjuster";
import {TranslationKey, useTranslate} from "../../../../../common/i18n/i18n";

export const ScanInfoTripwire = ({layer}: { layer: LayerDetails }) => {
    const t = useTranslate()
    return (
        <> - {t("scan.info.tripwire.reset-after")} <span className="text-warning">{layer.countdown}</span> {t("scan.info.tripwire.shutdown-for")} <span
            className="text-warning">{layer.shutdown}</span></>
    )
}

export const ScanInfoShutdownAccelerator = ({layer}: { layer: LayerDetails }) => {
    const t = useTranslate()
    const type = layer.adjustmentType?.toString() === TimerAdjustmentType.SPEED_UP.toString() ? t("scan.info.tripwire.speed-up") : t("scan.info.tripwire.slow-down")

    return (
        <><br/> &nbsp; &nbsp; &nbsp;  - {type} {t("scan.info.tripwire.modify")} <span
            className="text-warning">{layer.amount}</span><br/>{recurrence(layer.recurring!, t)}</>
    )
}

const recurrence = (recurring: TimerAdjustmentRecurring, t: (key: TranslationKey) => string) => {
    switch (recurring) {
        case TimerAdjustmentRecurring.FIRST_ENTRY_ONLY:
            return <> &nbsp; &nbsp; &nbsp; - {t("scan.info.tripwire.only-one")}</>
        case TimerAdjustmentRecurring.EVERY_ENTRY:
            return <> &nbsp; &nbsp; &nbsp; - {t("scan.info.tripwire.on-evry-entry")}</>
        case TimerAdjustmentRecurring.EACH_HACKER_ONCE:
            return <> &nbsp; &nbsp; &nbsp; - {t("scan.info.tripwire.on-each-hacker")}</>
        default:
            return <></>
    }
}
