import React, {useEffect, useRef} from "react";
import {WordSearchHome} from "./WordSearchHome";
import {useSelector} from "react-redux";
import {ForceDisconnected} from "../../../../common/component/ForceDisconnected";
import {WordSearchRootState} from "../reducer/WordSearchRootReducer";
import {IceHackerPresence} from "../../common/IceHackerPresence";
import {Page} from "../../../../common/menu/pageReducer";
import {applyIceMobileClass} from "../../common/iceMobile";


export const WordSearchContainer = () => {

    const rootRef = useRef<HTMLDivElement>(null)

    // Toggle the .iceMobile class on the root (full-bleed mobile layout). Re-evaluated on resize so
    // rotating the phone / resizing the window switches modes. Desktop stays without the class.
    useEffect(() => {
        const update = () => applyIceMobileClass(rootRef.current)
        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    const currentPage: Page =  useSelector((state: WordSearchRootState) =>  state.currentPage)
    if (currentPage === Page.FORCE_DISCONNECT) return <ForceDisconnected/>

    return (
        <div className="container-fluid iceStandalone" data-bs-theme="dark" ref={rootRef}>
            <div className="iceHackerSidebar">
                <IceHackerPresence />
            </div>
            <div className="iceGameArea">
                <WordSearchHome/>
            </div>
        </div>
    )
}
