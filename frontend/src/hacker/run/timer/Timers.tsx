import React from 'react';
import {useSelector} from "react-redux";
import {HackerRootState} from "../../HackerRootReducer";
import {formatTimeInterval} from "../../../common/util/Util";
import {TimerState, TimerEffect} from "./TimersReducer";
import {useTranslate} from "../../../common/i18n/i18n";

export const Timers = () => {

    const timers: TimerState[] = useSelector((state: HackerRootState) => state.run.timers)

    if (timers.length === 0) {
        return <div>
            <EmptyTimerDisplay />
            <Divider />
        </div>;
    }

    return <div>
        {timers.map((timer: TimerState) => <TimerDisplay key={timer.timerId} {...timer} />)}
        <Divider />
    </div>
}

const TimerDisplay = (props: TimerState) => {
    const t = useTranslate()
    const textColor = props.effect === TimerEffect.SHUTDOWN_START ? "text-warning" : "text-info"
    const typeText = props.effect === TimerEffect.SHUTDOWN_START ? "timers.tripwire" : "timers.shutdown"

    return <div className="row">
        <div className="col-lg-12">
            <span className="text">
                <span className={`timer ${textColor}`}>{formatTimeInterval(props.secondsLeft)}</span>
                &nbsp;{t(typeText)} [{props.target}] ➜ {props.effectDescription}
            </span>
        </div>
    </div>
}


const EmptyTimerDisplay = () => {

    return <div className="row">
        <div className="col-lg-12">
            <span className="text">
                <span className="timer">&nbsp;</span>
            </span>
        </div>
    </div>
}

const Divider = () => {
    return <div><hr style={{"borderColor": "#666", "margin": "10px 0px 6px 0px" }}/></div>
}
