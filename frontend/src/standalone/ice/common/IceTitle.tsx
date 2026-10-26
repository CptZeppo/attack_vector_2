import React from "react";
import {IceStrength} from "../../../common/model/IceStrength";
import {TranslationKey, useTranslate} from "../../../common/i18n/i18n";

interface Props {
    name: string,
    strength: IceStrength
}

// English descriptions - used by the GM script editor (which stays English).
export const strengthDescription = (strength: IceStrength, t: (key: TranslationKey) => string) => {
    const key = strengthKey[strength]
    if (!key) {
        return ""
    }
    return t(key);
}

export function toIceStrength(strength: "VERY_WEAK" | "WEAK" | "AVERAGE" | "STRONG" | "VERY_STRONG" | "ONYX" | undefined): IceStrength {
    switch (strength) {
        case "VERY_WEAK":
            return IceStrength.VERY_WEAK;
        case "WEAK":
            return IceStrength.WEAK;
        case "AVERAGE":
            return IceStrength.AVERAGE;
        case "STRONG":
            return IceStrength.STRONG;
        case "VERY_STRONG":
            return IceStrength.VERY_STRONG;
        case "ONYX":
            return IceStrength.ONYX;
        default:
            return IceStrength.UNKNOWN;
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
