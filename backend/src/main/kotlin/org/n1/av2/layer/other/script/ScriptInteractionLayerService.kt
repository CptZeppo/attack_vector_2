package org.n1.av2.layer.other.script

import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.springframework.stereotype.Service

@Service
class ScriptInteractionLayerService(
    private val connectionService: ConnectionService,
    private val i18n: I18n,
) {

    fun hack() {
        connectionService.replyTerminalReceive(i18n.t("script-interaction.unsupported"), "")
    }
}
