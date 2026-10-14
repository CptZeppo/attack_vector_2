import React from 'react'
import {useSelector} from "react-redux"
import {Terminal} from "../../../../common/terminal/Terminal"
import {TangleRootState} from "../reducer/TangleRootReducer";
import {HIDDEN} from "../../common/IceModel";
import {IceTitle} from "../../common/IceTitle";
import {CloseTabButton} from "../../common/CloseTabButton";
import {useTranslate} from "../../../../common/i18n/i18n";

export const TangleIceHome = () => {

    const ice = useSelector((state: TangleRootState) => state.tangle)
    const displayTerminal = useSelector((state: TangleRootState) => state.displayTerminal)

    const classHidden = ice.uiState === HIDDEN ? " hidden_alpha" : ""

    return (
        <div className="icePanelRow iceFitPending">
            <div className="col-lg-12">
                <div className="row align-items-start iceHeaderRow">
                    <div className="col-auto">
                        <IceTitle name="Gaanth" strength={ice.strength}/>
                    </div>
                    <Clusters clusters={ice.clusters} classHidden={classHidden}/>
                    <div className="col iceTerminalCol" style={{paddingTop: "4px"}}>
                        <Terminal terminalState={displayTerminal} height={84}/>
                    </div>
                    <div className="col-auto">
                        <div className="float-end">
                            <CloseTabButton/>
                        </div>
                    </div>
                </div>
                <hr style={{borderTopColor: "#300", marginTop: "5px", marginBottom: "5px"}}/>
                <div className={"row transition_alpha_fast" + classHidden}>
                    <div className="col-lg-12">
                        <div>
                            <canvas id="untangleCanvas" style={{
                                "borderRadius": "3px 3px 3px 3px",
                                "marginTop": "10px",
                                "marginBottom": "10px",
                            }}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Clusters = ({clusters, classHidden}: { clusters: number, classHidden: string }) => {
    const t = useTranslate()
    if (clusters === 1) {
        return <></>
    }
    return (
        <div className="col-auto">
            <h4 className={"text-center text-success transition_alpha_fast" + classHidden}>{t("ice.tangle.clusters-label")}<br/><span
                className="text-info">{clusters}</span></h4>
        </div>
    )

}
