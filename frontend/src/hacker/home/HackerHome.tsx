import React from 'react';
import {useSelector} from "react-redux";
import {TextInput} from "../../common/component/TextInput";
import {SilentLink} from "../../common/component/SilentLink";
import {HackerRootState} from "../HackerRootReducer";
import {RunInfo} from "./HackerRunsReducer";
import {webSocketConnection} from "../../common/server/WebSocketConnection";
import {ConfigItem, ConfigRootState, getConfigAsBoolean} from "../../admin/config/ConfigReducer";
import {hasSkill, User} from "../../common/users/CurrentUserReducer";
import {HackerSkillType} from "../../common/users/HackerSkills";
import {useTranslate} from "../../common/i18n/i18n";

/* eslint jsx-a11y/accessible-emoji: 0 */
/* eslint jsx-a11y/anchor-is-valid: 0*/

export const HackerHome = () => {

    const currentUser = useSelector((state: HackerRootState) => state.currentUser)
    const runs: RunInfo[] = useSelector((state: HackerRootState) => state.runs)
    const config = useSelector((rootState: ConfigRootState) => rootState.config)

    const hackersResetSite = (getConfigAsBoolean(ConfigItem.DEV_HACKER_RESET_SITE, config))
    const hackerDeleteRunLinks = (getConfigAsBoolean(ConfigItem.HACKER_DELETE_RUN_LINKS, config))
    const t = useTranslate()

    return (
        <div className="row content">
            <div className="col-lg-2">
            </div>
            <div className="col-lg-4 text">
                <br/>
                <strong>🜁 Verdant OS 🜃</strong>
                <br/>
                <SearchSite currentUser={currentUser}/>
            </div>
            <div className="col-lg-6">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="rightPanel">
                            <table className="table table-borderless table-sm text-muted text table-very-condensed" id="sitesTable">
                                <thead>
                                <tr>
                                    <td className="strong">{t("home.col-site-name")}</td>
                                    <td className="strong">{t("home.col-nodes")}</td>
                                    <td className="strong">{t("home.col-actions")}</td>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    runs.map((runInfo: RunInfo) => {
                                        return (
                                            <tr key={runInfo.runId}>
                                                <td>
                                                    <SilentLink title={runInfo.runId} onClick={() => {
                                                        prepareToEnterRun(runInfo.runId);
                                                    }}><>{runInfo.siteName}</>
                                                    </SilentLink>
                                                </td>
                                                <td>{runInfo.nodes}</td>
                                                <td>
                                                    {hackerDeleteRunLinks ? <DeleteRunLink runId={runInfo.runId}/> : <></>}
                                                    {hackersResetSite ? <ResetIceLink siteId={runInfo.siteId} siteName={runInfo.siteName}/> : <></>}
                                                </td>
                                            </tr>)
                                    })
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SearchSite = ({currentUser}: { currentUser: User }) => {
    const canSearchSite = hasSkill(currentUser, HackerSkillType.SEARCH_SITE)
    const t = useTranslate()

    if (!canSearchSite) {
        return (
            <div className="row">
                <div className="col-lg-12">
                    <div className="text">
                        <br/>
                        {t("home.choose-run-or-share")}<br/>
                    </div>
                </div>
            </div>
        )
    }

    const startRunByName = (siteName: string) => {
        if (siteName) {
            webSocketConnection.send("/run/newRun", siteName)
        }
    }
    return (<>
        <div className="row">
            <div className="col-lg-12">
                <div className="text">
                    <br/>
                    {t("home.choose-site")}<br/>
                    <br/>
                    <br/>
                </div>
            </div>
        </div>
        <TextInput placeholder={t("home.search-placeholder")}
                   buttonLabel={t("home.search-button")}
                   buttonClass="btn-info"
                   save={(siteName) => startRunByName(siteName)}
                   clearAfterSubmit={true}
                   autofocus={true}
        />
    </>)

}

export const prepareToEnterRun = (runId: string) => {
    webSocketConnection.send("/run/prepareToEnterRun", runId)
}

const DeleteRunLink = (props: { runId: string }) => {
    const t = useTranslate()
    const deleteScan = () => {
        webSocketConnection.send("/run/deleteRunLink", props.runId)
    }

    return <SilentLink onClick={deleteScan} title={t("home.remove-run")}>
        <span className="glyphicon glyphicon-remove-circle"/>
    </SilentLink>
}

const ResetIceLink = (props: { siteId: string, siteName: string }) => {
    const t = useTranslate()
    const resetIce = () => {
        if (window.confirm(t("home.reset-confirm", props.siteName))) {
            webSocketConnection.send("/site/resetSite", props.siteId)
        }
    }

    return <>
        &nbsp;<SilentLink onClick={resetIce} title={t("home.reset-site")}>
        <span className="glyphicon glyphicon-refresh"/>
    </SilentLink>
    </>

}
