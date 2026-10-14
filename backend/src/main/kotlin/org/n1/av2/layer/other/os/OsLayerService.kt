package org.n1.av2.layer.other.os

import org.n1.av2.layer.Layer
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n

@org.springframework.stereotype.Service
class OsLayerService(
    private val connectionService: ConnectionService,
    private val i18n: I18n,
) {

    fun hack(layer: Layer) {
        connectionService.replyTerminalReceive(i18n.t("os.nothing-new", layer.name))
    }
}
