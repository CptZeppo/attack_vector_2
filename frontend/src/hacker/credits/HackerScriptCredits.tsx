import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {HackerRootState} from "../HackerRootReducer";
import {HackerSkillType} from "../../common/users/HackerSkills";
import {webSocketConnection} from "../../common/server/WebSocketConnection";
import {ScriptIncomeCollectionStatus} from "../../common/users/CurrentUserReducer";
import {ActionButton} from "../../common/component/ActionButton";
import {notifySimple} from "../../common/util/Notification";
import {TwoTextInput} from "../../common/component/TwoTextInput";
import {InfoBadge} from "../../common/component/ToolTip";
import {ScriptsTransactionsTable} from "../../common/script/credits/CreditTransactions";
import {CreditsIcon} from "../../common/component/icon/CreditsIcon";
import {CreditTransaction} from "../../common/script/credits/CreditTransactionReducer";
import {useTranslate} from "../../common/i18n/i18n";

export const HackerScriptCredits = () => {

    useEffect(() => {
        webSocketConnection.send("/hacker/creditTransaction/send", null)
    }, [])


    const transactions = useSelector((state: HackerRootState) => state.creditTransactions) || []
    const currentUserName = useSelector((state: HackerRootState) => state.currentUser).name
    const t = useTranslate()

    return (
        <div className="row content">
            <div className="col-lg-1">
            </div>
            <div className="col-lg-4 text">
                <br/>
                <strong>🜁 Verdant OS 🜃</strong><br/>
                <br/>
                <h3 className="text-info">{t("credits.title")}</h3>
                <br/>
                <CreditsAndIncome/>
                <ScriptIncome/>
                <TransferCredits/>
                <hr/>
            </div>
            <div className="col-lg-7">
                <div className="rightPanel">
                    <CreditTransactions transactions={transactions} viewForUserName={currentUserName}/>
                </div>
            </div>
        </div>
    )
}

const CreditsAndIncome = () => {
    const credits = useSelector((state: HackerRootState) => state.currentUser.hacker?.scriptCredits) || 0
    const t = useTranslate()

    return <>
        {t("credits.balance")} <span className="text-info">{credits}<CreditsIcon/></span>
        <br/>
        <hr/>
    </>
}

const ScriptIncome = () => {
    const currentUser = useSelector((state: HackerRootState) => state.currentUser)
    const t = useTranslate()
    if (!currentUser.hacker) {
        return <></>
    }

    const incomeStatus = currentUser.hacker?.scriptIncomeCollectionStatus
    const skills = currentUser.hacker.skills
    const scriptCreditsSkill = skills.find((hackerSKill) => hackerSKill.type === HackerSkillType.SCRIPT_CREDITS)
    const income = parseInt(scriptCreditsSkill?.value || "0")

    if (incomeStatus === ScriptIncomeCollectionStatus.HACKER_HAS_NO_INCOME || income === 0) {
        return <></>
    }

    const collectIncome = () => {
        webSocketConnection.send("/hacker/scriptCredits/collect", null)
    }
    const collectionLink = (incomeStatus === ScriptIncomeCollectionStatus.AVAILABLE) ?
        <><br/><br/><ActionButton onClick={collectIncome} text={t("credits.collect-income")}/></> : <></>
    const incomeInfo = <>{t("credits.income")} <span className="text-info">{income}<CreditsIcon/></span></>

    return <>
        {incomeInfo} <IncomeStatusElement incomeStatus={incomeStatus}/> {collectionLink}
        <br/><br/>
        <hr/>
    </>
}

const IncomeStatusElement = ({incomeStatus}: { incomeStatus: ScriptIncomeCollectionStatus }) => {
    const t = useTranslate()
    switch (incomeStatus) {
        case ScriptIncomeCollectionStatus.AVAILABLE:
            return <span className="badge bg-primary">{t("status.available")}</span>
        case ScriptIncomeCollectionStatus.TODAY_IS_NOT_AN_INCOME_DATE:
            return <>
                <span className="badge bg-secondary">{t("credits.not-income-date")}</span> &nbsp;
                <InfoBadge infoText={t("credits.income-info")}/>
            </>
        case ScriptIncomeCollectionStatus.COLLECTED:
            return <span className="badge bg-success">{t("credits.collected")}</span>
        default:
            return <span>{t("credits.no-income")}</span>
    }
}

const TransferCredits = () => {
    const t = useTranslate()
    const transfer = (amount: string, receiver: string) => {
        if (!receiver || !amount) {
            return
        }
        if (!isWholePositiveNumber(amount)) {
            notifySimple(t("credits.enter-positive"))
        }
        webSocketConnection.send("/hacker/scriptCredits/transfer", {receiver, amount})
    }
    return <>
        <TwoTextInput label={t("credits.transfer-label")} save={transfer} clearAfterSubmit={false} buttonLabel={t("credits.transfer-button")} buttonClass="btn btn-info"
                      placeholder1={t("credits.amount")} placeholder2={t("credits.receiver")} autofocus={false} size={3} labelColumns={3}
                      type1="number"/>
    </>
}

const isWholePositiveNumber = (amount: string): boolean => {
    const parsed = parseInt(amount)
    return !isNaN(parsed) && parsed > 0 && parsed.toString() === amount
}

export const CreditTransactions = ({transactions, viewForUserName}: { transactions: CreditTransaction[], viewForUserName: string }) => {
    const t = useTranslate()
    return <>
        <h4>
            {t("credits.transactions")}
        </h4>
        <hr/>
        <div>
            <ScriptsTransactionsTable transactions={transactions} viewForUserName={viewForUserName}/>
        </div>
    </>
}
