import React from "react";
import {useSelector} from "react-redux";
import {HackerRootState} from "../HackerRootReducer";
import {SilentLink} from "../../common/component/SilentLink";
import {webSocketConnection} from "../../common/server/WebSocketConnection";
import {ScriptAccess} from "../../common/script/access/ScriptAccessReducer";
import {Hr} from "../../common/component/dataTable/Hr";
import {DataTable} from "../../common/component/dataTable/DataTable";
import {ScriptEffects} from "../../common/script/type/ScriptEffects";
import {HackerScriptsPanel} from "../scripts/HackerScriptsPanel";
import {Pad} from "../../common/component/Pad";
import {CreditsIcon} from "../../common/component/icon/CreditsIcon";
import {CurrentCredits} from "../../common/script/credits/CurrentCredits";
import {useTranslate} from "../../common/i18n/i18n";


export const HackerScriptMarket = () => {
    const user = useSelector((state: HackerRootState) => state.currentUser)
    const t = useTranslate()

    return (
        <div className="row content">
            <div className="col-lg-1">
            </div>
            <div className="col-lg-4 text">
                <br/>
                <strong>🜁 Verdant OS 🜃</strong><br/>
                <br/>
                <h3 className="text-info">{t("market.title")}</h3>
                <hr/>
                <CurrentCredits user={user}/>
                <hr/>
                <MarketScriptsList/>
            </div>
            <div className="col-lg-7">
                <div className="rightPanel">
                    <HackerScriptsPanel/>
                </div>
            </div>
        </div>
    )
}

export const MarketScriptsList = () => {
    const accesses = useSelector((state: HackerRootState) => state.scriptAccess).filter((access: ScriptAccess) => access.price !== null && access.price > 0)
    accesses.sort((a, b) => a.type.name.localeCompare(b.type.name))
    const credits = useSelector((state: HackerRootState) => state.currentUser.hacker?.scriptCredits) || 0
    const t = useTranslate()

    if (accesses.length === 0) {
        return <div className="text">{t("market.none")}</div>
    }

    const maxPricePadding = accesses.reduce((max, access) => {
        return Math.max(max, pricePadding(access.price))
    }, 0)


    const rows = accesses.map((scriptAccess: ScriptAccess) => {
        return <MarketScriptLine scriptAccess={scriptAccess} creditsAvailable={credits} maxPricePadding={maxPricePadding}/>
    })
    const rowTexts = accesses.map((access: ScriptAccess) => `${access.type.name}~${access.type.size}~${access.price}`)


    return <>
        <h4 className="text-muted">{t("market.subtitle")}</h4>
        <br/><span className="dark">{t("market.expire-note")}</span><br/>
        <br/>
        <br/>
        <DataTable rows={rows} rowTexts={rowTexts} pageSize={24} hr={<Hr/>}>
            <div className="row text strong">
                <div className="col-lg-4">{t("common.name")}</div>
                <div className="col-lg-2">{t("common.ram")}</div>
                <div className="col-lg-2">{t("common.effects")}</div>
                <div className="col-lg-2">{t("market.col-price")}</div>
                <div className="col-lg-2">{t("common.action")}</div>
            </div>
        </DataTable>
    </>

}

interface MarketScriptLineProps {
    scriptAccess: ScriptAccess,
    creditsAvailable: number,
    maxPricePadding: number
}

const MarketScriptLine = ({scriptAccess, creditsAvailable, maxPricePadding}: MarketScriptLineProps) => {

    const padding = maxPricePadding - pricePadding(scriptAccess.price)

    return (<>
            <div className="row text" style={{marginBottom: "2px"}}>
                <div className="col-lg-4">{scriptAccess.type.name}</div>
                <div className="col-lg-2">{scriptAccess.type.size}</div>
                <div className="col-lg-2"><ScriptEffects effects={scriptAccess.type.effects}/></div>
                <div className="col-lg-2"><Pad length={padding}/>{scriptAccess.price}<CreditsIcon/></div>
                <div className="col-lg-2 noSelect">
                    <ActionBuyScript scriptAccess={scriptAccess} creditsAvailable={creditsAvailable}/>
                </div>
            </div>
        </>
    )
}

const ActionBuyScript = ({scriptAccess, creditsAvailable}: { scriptAccess: ScriptAccess, creditsAvailable: number }) => {
    const t = useTranslate()
    if (creditsAvailable < scriptAccess.price!!) {
        return <></>
    }

    const action = () => {
        webSocketConnection.send("/hacker/script/buy", scriptAccess.id)
    }
    return <SilentLink onClick={action}><>{t("market.buy")}</>
    </SilentLink>
}


const pricePadding = (price: number | null): number => {
    return Math.floor(Math.log10(price!!));
}
