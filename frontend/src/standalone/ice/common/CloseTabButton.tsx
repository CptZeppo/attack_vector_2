import React from "react";
import {standalone} from "../../StandaloneGlobals";
import {isIceMobile} from "./iceMobile";

export const CloseTabButton = () => {
    // On the direct-URL/QR (external) surface on a phone there's nothing to "close" — the player
    // arrived via a URL/PWA, and window.close() doesn't work on such a tab anyway. Hide it there;
    // desktop external access and the in-run siteHack surface keep the close button.
    if (standalone.externalHack && isIceMobile()) return null

    const close = () => window.close()
    return <span className="nodeInfoClose closeButtonLarge" onClick={close}>
        <span className="close-position glyphicon glyphicon-remove closeButtonLargeIcon"/>
    </span>
}
