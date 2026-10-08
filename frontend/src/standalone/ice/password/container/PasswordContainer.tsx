import React, {useEffect, useRef} from "react";
import {PasswordIceHome} from "./PasswordIceHome";
import {applyIceMobileClass} from "../../common/iceMobile";
import {useSelector} from "react-redux";
import {PasswordRootState} from "../reducer/PasswordRootReducer";
import {ForceDisconnected} from "../../../../common/component/ForceDisconnected";
import {IceHackerPresence} from "../../common/IceHackerPresence";
import {Page} from "../../../../common/menu/pageReducer";

export const PasswordContainer = () => {

    const rootRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const update = () => applyIceMobileClass(rootRef.current)
        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    const currentPage: Page =  useSelector((state: PasswordRootState) =>  state.currentPage)
    if (currentPage === Page.FORCE_DISCONNECT) return <ForceDisconnected/>

    return (
        <div className="container-fluid iceStandalone" data-bs-theme="dark" ref={rootRef}>
            <div className="iceHackerSidebar">
                <IceHackerPresence />
            </div>
            <div className="iceGameArea">
                <PasswordIceHome/>
            </div>
        </div>
    )
}
