import React, {useEffect, useRef} from "react";
import {TarHome} from "./TarHome";
import {applyIceMobileClass} from "../../common/iceMobile";
import {useSelector} from "react-redux";
import {Page} from "../../../../common/menu/pageReducer";
import {ForceDisconnected} from "../../../../common/component/ForceDisconnected";
import {TarRootState} from "../reducer/TarRootReducer";
import {IceHackerPresence} from "../../common/IceHackerPresence";


export const TarContainer = () => {

    const rootRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const update = () => applyIceMobileClass(rootRef.current)
        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    const currentPage: Page =  useSelector((state: TarRootState) =>  state.currentPage)
    if (currentPage === Page.FORCE_DISCONNECT) return <ForceDisconnected/>

    return (
        <div className="container-fluid iceStandalone" data-bs-theme="dark" ref={rootRef}>
            <div className="iceHackerSidebar">
                <IceHackerPresence />
            </div>
            <div className="iceGameArea">
                <TarHome/>
            </div>
        </div>
    )
}
