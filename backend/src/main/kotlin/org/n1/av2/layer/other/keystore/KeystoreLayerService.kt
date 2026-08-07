package org.n1.av2.layer.other.keystore

import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.run.local.MessageService
import org.springframework.stereotype.Service

@Service
class KeystoreLayerService(
    private val connectionService: ConnectionService,
    private val keystoreService: KeystoreService,
    private val messageService: MessageService

) {
    fun hack(layer: KeyStoreLayer) {
        if (layer.iceLayerId == null) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("layer.keystore.error"))
            return
        }
        val password = keystoreService.getIcePassword(layer.iceLayerId!!).password

        connectionService.replyTerminalReceive(messageService.getMessageAsLines("layer.keystore.success", password))
    }

}
