package org.n1.av2.layer.other.text

import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.springframework.stereotype.Service

@Service
class TextLayerService(
    private val connectionService: ConnectionService,
    private val i18n: I18n,
) {

    fun hack(layer: TextLayer) {
        connectionService.replyTerminalReceive(i18n.t("layer.hacked-header", layer.level, layer.name), "")
        connectionService.replyTerminalReceive(layer.text.lines())
    }
}
