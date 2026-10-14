package org.n1.av2.run.terminal.inside

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.layer.other.os.OsLayer
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.connection.ServerActions
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.site.entity.NodeEntityService
import org.springframework.stereotype.Service

@Service
class CommandViewService(
    private val connectionService: ConnectionService,
    private val nodeEntityService: NodeEntityService,
    private val insideTerminalHelper: InsideTerminalHelper,
    private val i18n: I18n,
) {

    fun process(hackerState: HackerStateRunning) {
        if (!insideTerminalHelper.verifyInside(hackerState)) return
        requireNotNull(hackerState.currentNodeId)
        val node = nodeEntityService.getById(hackerState.currentNodeId)

        val blockingIceLevel = insideTerminalHelper.findBlockingIceLayer(node, hackerState.runId)?.level ?: -1

        val lines = ArrayList<String>()

        val nodeName = (node.layers.first() as OsLayer).nodeName
        if (nodeName.isNotBlank()) {
            lines.add(i18n.t("view.node-name", nodeName))
            lines.add("")
        }

        lines.add(i18n.t("view.layers-header"))
        node.layers.forEach { layer ->
            val blocked = (layer.level < blockingIceLevel)

            val hacked = if (layer is IceLayer && layer.hacked) i18n.t("view.hacked-suffix") else ""
            val iceSuffix = if (layer is IceLayer) " ICE" else ""
            if (blocked) {
                lines.add(i18n.t("view.layer-shielded", layer.level))
            } else {
                lines.add(i18n.t("view.layer-line", layer.level, layer.name, iceSuffix, hacked))
            }
        }

        connectionService.reply(ServerActions.SERVER_TERMINAL_RECEIVE, ConnectionService.TerminalReceive("main", lines.map { it }.toTypedArray()))
    }

}
