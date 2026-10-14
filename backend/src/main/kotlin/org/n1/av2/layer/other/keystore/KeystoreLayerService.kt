package org.n1.av2.layer.other.keystore

import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.springframework.stereotype.Service

@Service
class KeystoreLayerService(
    private val connectionService: ConnectionService,
    private val keystoreService: KeystoreService,
    private val i18n: I18n,
) {
    fun hack(layer: KeyStoreLayer) {
        if (layer.iceLayerId == null) {
            connectionService.replyTerminalReceive(i18n.t("keystore.misconfigured"))
            return
        }
        val password = keystoreService.getIcePassword(layer.iceLayerId!!).password

        connectionService.replyTerminalReceive(i18n.t("keystore.password-found", password))
    }

}
