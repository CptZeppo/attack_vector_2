import React from "react";
import {useSelector} from "react-redux";
import {HackerRootState} from "../HackerRootReducer";
import {Ram} from "../../common/script/ScriptStatusReducer";
import {formatTimeInterval} from "../../common/util/Util";
import {useTranslate} from "../../common/i18n/i18n";

export const RamDisplay = ({size}: {size: number}) => {
    const ram = useSelector((state: HackerRootState) => state.scriptStatus?.ram || null)
    const t = useTranslate()
    if (ram === null) {
        return <></>
    }

    const refreshText = ram.nextRefreshSecondsLeft === null ? "" : t("ram.next-available", formatTimeInterval(ram.nextRefreshSecondsLeft))

    return <div className="text">
        <div className="row">
            <div className="col-lg-1">
                {t("common.ram")}
            </div>
            <div className="col-lg-10">
                <RamBar ram={ram} size={509}/>
            </div>
        </div>
        <br/>
        {t("ram.total")} <span className='text_light'>&nbsp; &nbsp; &nbsp;{ram.size}</span><br/>
        <br/>
        {t("ram.loaded")} <span className='text_light'>&nbsp; &nbsp; {ram.loaded}</span><br/>
        {t("ram.refreshing")} <span className='text_light'>{ram.refreshing}</span> {refreshText}<br/>
        {t("ram.free")} <span className='text_light'>&nbsp; &nbsp; &nbsp; {ram.free}</span><br/>
    </div>
}

export const RamBar = ({ram, size}: { ram: Ram, size: number }) => {
    const t = useTranslate()
    if (ram.size === 0) {
        return <div className="progress-stacked" style={{width: size}}>
            <div className="progress" role="progressbar" aria-label="Segment one" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}
                 style={{"width": "100%"}}>
                <div className="progress-bar bg-light-subtle dark">{t("ram.not-installed")}</div>
            </div>
        </div>
    }

    const loadedPercentage = (ram.loaded / ram.size) * 100
    const refreshingPercentage = (ram.refreshing / ram.size) * 100
    const freePercentage = 100 - loadedPercentage - refreshingPercentage

    const textLoaded = textFor(loadedPercentage, size, t("ram.bar-loaded"), ram.loaded)
    const textRefreshing = textFor(refreshingPercentage, size, t("ram.bar-refreshing"), ram.refreshing)
    const textFree = textFor(freePercentage, size, t("ram.bar-free"), ram.free)



    return <div className="progress-stacked" style={{width: size}}>
        <div className="progress" role="progressbar" aria-label="Segment one" aria-valuenow={loadedPercentage} aria-valuemin={0} aria-valuemax={100}
             style={{"width": `${loadedPercentage}%`}}>
            <div className="progress-bar bg-info">{textLoaded}</div>
        </div>
        <div className="progress" role="progressbar" aria-label="Segment two" aria-valuenow={refreshingPercentage} aria-valuemin={0}
             aria-valuemax={100}
             style={{"width": `${refreshingPercentage}%`}}>
            <div className="progress-bar bg-primary-subtle">{textRefreshing}</div>
        </div>
        <div className="progress" role="progressbar" aria-label="Segment three" aria-valuenow={freePercentage} aria-valuemin={0} aria-valuemax={100}
             style={{"width": `${freePercentage}%`}}>
            <div className="progress-bar bg-light-subtle">{textFree}</div>
        </div>
    </div>
}

const textFor = (percentage: number, barSize: number, prefix: string, amount: number) => {
    const sizeAvailable = (barSize * percentage) / 100
    const fullText = `${prefix}${amount}`
    const PADDING = 2
    const sizeNeeded = (fullText.length + PADDING) * 7.3
    if (sizeAvailable > sizeNeeded) {
        return fullText
    }
    return amount.toString()
}
