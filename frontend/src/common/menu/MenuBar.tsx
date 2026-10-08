import React from 'react'
import {useSelector} from "react-redux"
import Cookies from "js-cookie"
import {MenuItem} from "./MenuItem"
import {HackerRootState} from "../../hacker/HackerRootReducer"
import {ROLE_ADMIN, ROLE_GM, ROLE_HACKER, ROLE_SITE_MANAGER, ROLE_USER_MANAGER} from "../user/UserAuthorizations";
import {GenericUserRootState, hasSkill, UserType} from "../users/CurrentUserReducer";
import {Page} from "./pageReducer";
import {HackerSkillType} from "../users/HackerSkills";
import {useTranslate} from "../i18n/i18n";

/* eslint jsx-a11y/anchor-is-valid: 0*/

const logout = (event: any) => {
    event.preventDefault()
    Cookies.remove("jwt")
    Cookies.remove("type")
    Cookies.remove("roles")
    Cookies.remove("userName")
    document.location.href = "/loggedOut"
}

const scanItem = (currentPage: string, runName: string | null) => {
    if (currentPage === Page.RUN && runName) {
        return (
            <MenuItem requiresRole="ROLE_HACKER" targetPage={Page.RUN} label={`> ${runName} <`}/>
        )
    } else {
        return <span/>
    }
}

export const MenuBar = () => {

    const userName = useSelector((state: GenericUserRootState) => state.currentUser.name)

    const siteName = useSelector((state: HackerRootState) => (state.run && state.run.site.siteProperties) ? state.run.site.siteProperties.name : "")
    const currentPage = useSelector((state: HackerRootState) => state.currentPage)

    const currentUser = useSelector((state: HackerRootState) => state.currentUser)
    const t = useTranslate()

    // While a hacker is connected to a site (the RUN view) the bottom menu bar is hidden so players
    // can't wander off or log out mid-game. It's revealed on click of a discreet, barely-visible glyph
    // in the bottom-right corner (someone who knows it's there can bring the bar back). Only hidden for
    // hackers — GM/admin keep their bar for authoring/testing.
    const [barRevealed, setBarRevealed] = React.useState(false)
    const hideBarInRun = currentPage === Page.RUN && currentUser.type === UserType.HACKER

    if (hideBarInRun && !barRevealed) {
        return (
            <span
                onClick={() => setBarRevealed(true)}
                style={{
                    position: "fixed",
                    right: "5px",
                    bottom: "1px",
                    zIndex: 1030,
                    opacity: 0.1,
                    color: "#6f6",
                    fontSize: "13px",
                    padding: "6px 8px",
                    cursor: "default",
                    userSelect: "none",
                }}
            >ꕻ</span>
        )
    }


    const hackersCanCreateSites = hasSkill(currentUser, HackerSkillType.CREATE_SITE)
    const hackerHasScriptsSkill = hasSkill(currentUser, HackerSkillType.SCRIPT_RAM)
    const hackerHasScriptsCreditsSkill = hasSkill(currentUser, HackerSkillType.SCRIPT_CREDITS)


    const hackerSites = hackersCanCreateSites ? <MenuItem requiresRole={ROLE_HACKER} targetPage={Page.SITES} label={t("nav.sites")}/> : <></>
    const hackerScripts = hackerHasScriptsSkill ? <MenuItem requiresRole={ROLE_HACKER} targetPage={Page.HACKER_SCRIPTS} label={t("nav.scripts")}/> : <></>
    const hackerMarket = hackerHasScriptsSkill && hackerHasScriptsCreditsSkill ?
        <MenuItem requiresRole={ROLE_HACKER} targetPage={Page.SCRIPTS_MARKET} label={t("nav.market")}/> : <></>
    const hackerCredits = hackerHasScriptsCreditsSkill ? <MenuItem requiresRole={ROLE_HACKER} targetPage={Page.SCRIPTS_CREDITS} label={t("nav.credits")}/> : <></>

    return (
        <nav className="navbar navbar-expand-sm navbar-av fixed-bottom" style={{
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: "black",
            padding: "0 0 0 0"
        }}>
            <div className="container">
                <div className="navbar-collapse">
                    <div className="container-fluid">
                        <div className="d-flex justify-content-between">
                            <ul className="navbar-nav mr-auto">
                                <Title/>
                                {scanItem(currentPage, siteName)}
                                <MenuItem requiresRole={ROLE_HACKER} targetPage={Page.HACKER_HOME} label={t("nav.home")}/>
                                {hackerSites}
                                {hackerScripts}
                                {hackerMarket}
                                {hackerCredits}
                                <MenuItem requiresRole={ROLE_GM} targetPage={Page.GM_SCRIPTS_HOME} label="Scripts"/>
                                <MenuItem requiresRole={ROLE_SITE_MANAGER} targetPage={Page.SITES} label="Sites"/>
                                <MenuItem requiresRole={ROLE_USER_MANAGER} targetPage={Page.USERS} label="Users"/>
                                <MenuItem requiresRole={ROLE_ADMIN} targetPage={Page.CONFIG} label="Config"/>
                                <MenuItem requiresRole={ROLE_ADMIN} targetPage={Page.TASKS} label="Tasks"/>
                                <MenuItem requiresRole={ROLE_GM} targetPage={Page.STATISTICS} label="Statistics"/>
                            </ul>
                            <ul className="navbar-nav">
                                <MenuItem requiresRole="ROLE_USER" targetPage={Page.ME} label={"{" + userName + "}"}/>
                                <li className="nav-item">
                                    <a className="nav-link" href="/login" onClick={(event) => logout(event)}>ꕻ
                                        {t("nav.logout")}</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

/* eslint react/jsx-no-target-blank  : 0*/
const Title = () => {

    const currentUser = useSelector((state: HackerRootState) => state.currentUser)

    const location = docsLocation(currentUser.type)

    return <li className="nav-item">
        <a className="nav-link" href={location} target="_blank">↼ Attack Vector ⇁</a>
    </li>
}

const docsLocation = (userType: UserType) => {
    switch (userType) {
        case UserType.HACKER:
            return "/attack_vector_2/player/index.html"
        case UserType.GM:
            return "/attack_vector_2/gm/index.html"
        case UserType.ADMIN:
            return "/attack_vector_2/installation/Configuration/index.html"
        default:
            return "/attack_vector_2/docs/index.html"
    }
}
