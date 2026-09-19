package org.n1.av2.layer.other.script

import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.run.local.MessageService
import org.springframework.stereotype.Service

@Service
class ScriptInteractionLayerService(
    private val connectionService: ConnectionService,
    private val messageService: MessageService
) {

    fun hack() {
        connectionService.replyTerminalReceive(messageService.getMessageAsLines("layer.script.ineract.hack"))
    }
}
