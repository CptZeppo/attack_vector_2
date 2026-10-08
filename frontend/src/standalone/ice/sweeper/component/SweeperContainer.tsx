import React, {useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import {Page} from "../../../../common/menu/pageReducer";
import {applyIceMobileClass} from "../../common/iceMobile";
import {ForceDisconnected} from "../../../../common/component/ForceDisconnected";
import {SweeperRootState} from "../reducer/SweeperRootReducer";
import {IceHackerPresence} from "../../common/IceHackerPresence";
import {SweeperHome} from "./SweeperHome";

export const SweeperContainer = () => {

    const rootRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const update = () => applyIceMobileClass(rootRef.current)
        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    const blockedUserIds = useSelector((state: SweeperRootState) => state.ui.blockedUserIds)
    const currentPage: Page = useSelector((state: SweeperRootState) =>  state.currentPage)
    if (currentPage === Page.FORCE_DISCONNECT) return <ForceDisconnected/>



    return (
        <div className="container-fluid iceStandalone" data-bs-theme="dark" ref={rootRef}>
            <div className="iceHackerSidebar">
                <IceHackerPresence blocked={blockedUserIds}/>
            </div>
            <div className="iceGameArea">
                <SweeperHome/>
            </div>
        </div>
    )
}
