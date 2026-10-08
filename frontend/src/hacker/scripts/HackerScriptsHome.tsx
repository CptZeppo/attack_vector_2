import React from "react";
import {useSelector} from "react-redux";
import {HackerRootState} from "../HackerRootReducer";
import {SilentLink} from "../../common/component/SilentLink";
import {webSocketConnection} from "../../common/server/WebSocketConnection";
import {ScriptAccess} from "../../common/script/access/ScriptAccessReducer";
import {InfoBadge} from "../../common/component/ToolTip";
import {ScriptEffectDisplay} from "../../common/script/ScriptModel";
import {TextInput} from "../../common/component/TextInput";
import {HackerScriptsPanel} from "./HackerScriptsPanel";
import {Page} from "../../common/menu/pageReducer";
import {HackerSkillType} from "../../common/users/HackerSkills";
import {hasSkill} from "../../common/users/CurrentUserReducer";
import {NavigateButton} from "../../common/component/NavigateButton";
import {CreditsIcon} from "../../common/component/icon/CreditsIcon";
import {DataTable} from "../../common/component/dataTable/DataTable";
import {useTranslate} from "../../common/i18n/i18n";


export const HackerScriptsHome = () => {
    const accesses = useSelector((state: HackerRootState) => state.scriptAccess)
    const t = useTranslate()

    return (
        <div className="row content">
            <div className="col-lg-1">
            </div>
            <div className="col-lg-4 text">
                <br/>
                <strong>🜁 Verdant OS 🜃</strong><br/>
                <br/>
                <h3 className="text-info">{t("scripts.title")}</h3>
                <br/>
                {t("scripts.intro")}<br/>
                <MarketSection/>
                <DownloadScript/>
                <FreeReceive accesses={accesses}/>
            </div>
            <div className="col-lg-7">
                <div className="rightPanel">
                    <HackerScriptsPanel/>
                </div>
            </div>
        </div>
    )
}

const MarketSection = () => {
    const currentUser = useSelector((state: HackerRootState) => state.currentUser)
    const credits = useSelector((state: HackerRootState) => state.currentUser.hacker?.scriptCredits) || 0
    const t = useTranslate()

    if (!hasSkill(currentUser, HackerSkillType.SCRIPT_CREDITS)) {
        return <></>
    }

    return <>
        <hr/>
        <div className="row">
            <div className="col-lg-7 text">
                {t("credits.balance")} <span className="text-info">{credits}<CreditsIcon/></span>
            </div>
            <div className="col-lg-5 text">
                <NavigateButton label={t("nav.market")} page={Page.SCRIPTS_MARKET}/>
            </div>
        </div>
    </>
}


const FreeReceive = ({accesses}: { accesses: ScriptAccess[] }) => {
    const accessWithFreeReceive = accesses.filter(access => access.receiveForFree > 0)
    const t = useTranslate()

    const retrieve = () => {
        webSocketConnection.send("/hacker/script/freeReceive", null)
    }


    if (accessWithFreeReceive.length === 0) {
        return <></>
    }

    const rows = accessWithFreeReceive.map(access => <ScriptAccessLine access={access} />)
    const rowTexts =  accessWithFreeReceive.map(access => `${access.type.name}~${access.used ? 'Received today' : 'Available'}`)

    const hr = <hr style={{margin: "2px 0 2px 0", color: "#555", borderTop: "1px dashed"}}/>

    return (<>
            <hr/>
            {t("scripts.free-access")}<br/><br/>
            <DataTable rows={rows} rowTexts={rowTexts} pageSize={18} hr={hr}>
                <div className="row">
                    <div className="col-lg-offset-2 col-lg-4">{t("scripts.col-script")}</div>
                    <div className="col-lg-4">{t("common.effects")}</div>
                    <div className="col-lg-2">{t("scripts.col-status")}</div>
                </div>
            </DataTable>
            <br/>
            <SilentLink onClick={retrieve}>
                <div className="btn btn-info text-size">{t("scripts.retrieve")}</div>
            </SilentLink>
            <br/>
        </>
    )
}

const ScriptAccessLine = ({access}: { access: ScriptAccess }) => {
    return (
        <div className="row" key={access.id}>
            <div className="col-lg-offset-2 col-lg-4">{access.receiveForFree}x {access.type.name}</div>
            <div className="col-lg-4">{
                access.type.effects.map((effect: ScriptEffectDisplay, index: number) => {
                    return (<span key={index}>
                                        <InfoBadge infoText={effect.description} key={index}
                                                   badgeText={effect.label}/>
                        &nbsp;</span>)
                })
            }
            </div>
            <div className="col-lg-2"><ScriptAccessStatus access={access}/></div>
        </div>)
}

const ScriptAccessStatus = ({access}: { access: ScriptAccess }) => {
    const t = useTranslate()
    if (access.used) {
        return <span className="badge bg-secondary">{t("status.received-today")}</span>
    }
    return <span className="badge bg-primary">{t("status.available")}</span>

}

const downloadScript = (code: string) => {
    webSocketConnection.send("/hacker/script/download", code)
}

const DownloadScript = () => {
    const t = useTranslate()
    return <>
        <hr/>
        <TextInput placeholder="1234-abcd"
                   buttonLabel={t("scripts.download-button")}
                   buttonClass="btn-info"
                   save={(code) => downloadScript(code)}
                   clearAfterSubmit={true}
                   autofocus={true}
                   size={3}
                   label={t("scripts.download-label")}
                   labelColumns={4}
        />
    </>
}
