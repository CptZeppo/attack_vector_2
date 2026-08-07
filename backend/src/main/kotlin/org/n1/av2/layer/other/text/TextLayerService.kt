package org.n1.av2.layer.other.text

import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.run.local.MessageService
import org.springframework.stereotype.Service

@Service
class TextLayerService(
    private val connectionService: ConnectionService,
    private val messageService: MessageService,
) {

    fun hack(layer: TextLayer) {
        connectionService.replyTerminalReceive(messageService.getMessageAsLines("layer.common.hacked", layer.level, layer.name))
        connectionService.replyTerminalReceive(layer.text.lines())
    }
}
