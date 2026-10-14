import React from "react";
import {IceStrength} from "../../../common/model/IceStrength";
import {TranslationKey, useTranslate} from "../../../common/i18n/i18n";

interface Props {
    name: string,
    strength: IceStrength
}

// English descriptions - used by the GM script editor (which stays English).
export const strengthDescription = (strength: IceStrength) => {
    switch (strength) {
        case IceStrength.VERY_WEAK :
            return "Very weak"
        case IceStrength.WEAK:
            return "Weak"
        case IceStrength.AVERAGE:
            return "Average"
        case IceStrength.STRONG:
            return "Strong"
        case IceStrength.VERY_STRONG:
            return "Very strong"
        case IceStrength.ONYX:
            return "Onyx"
        default:
            return ""
    }

}

const strengthKey: Record<IceStrength, TranslationKey | null> = {
    [IceStrength.VERY_WEAK]: "ice.strength.very-weak",
    [IceStrength.WEAK]: "ice.strength.weak",
    [IceStrength.AVERAGE]: "ice.strength.average",
    [IceStrength.STRONG]: "ice.strength.strong",
    [IceStrength.VERY_STRONG]: "ice.strength.very-strong",
    [IceStrength.ONYX]: "ice.strength.onyx",
    [IceStrength.UNKNOWN]: null,
}

export const IceTitle = ({name, strength}: Props) => {
    const t = useTranslate()
    const key = strengthKey[strength]
    return <h4 className="text-success" style={{whiteSpace: "nowrap", marginBottom: 0}}>
        <strong>
            {t("ice.title.ice")} <span className="text-info">{name}</span><br/>
            {t("ice.title.strength")} <span className="text-info">{key ? t(key) : ""}</span>
        </strong>
    </h4>
}
