package org.n1.av2.run.terminal.inside

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.layer.other.os.OsLayer
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.connection.ServerActions
import org.n1.av2.run.local.MessageService
import org.n1.av2.site.entity.NodeEntityService
import org.springframework.stereotype.Service

@Service
class CommandViewService(
    private val connectionService: ConnectionService,
    private val nodeEntityService: NodeEntityService,
    private val insideTerminalHelper: InsideTerminalHelper,
    private val messageService: MessageService,
) {

    fun process(hackerState: HackerStateRunning) {
        if (!insideTerminalHelper.verifyInside(hackerState)) return
        requireNotNull(hackerState.currentNodeId)
        val node = nodeEntityService.getById(hackerState.currentNodeId)

        val blockingIceLevel = insideTerminalHelper.findBlockingIceLayer(node, hackerState.runId)?.level ?: -1

        val lines = ArrayList<String>()

        val nodeName = (node.layers.first() as OsLayer).nodeName
        if (nodeName.isNotBlank()) {
            lines.addAll(messageService.getMessageAsLines("command.view.node"))
        }

        lines.add(messageService.getMessage("command.view.layers"))
        node.layers.forEach { layer ->
            val blocked = (layer.level < blockingIceLevel)

            val hacked = if (layer is IceLayer && layer.hacked) messageService.getMessage("command.view.layers.hacked") else ""
            val iceSuffix = if (layer is IceLayer) " ICE" else ""
            if (blocked) {
                lines.add(messageService.getMessage("command.view.layers.blocked",layer.level))
            }
            else {
                lines.add(messageService.getMessage("command.view.layers.info", layer.level, layer.name, iceSuffix, hacked))
            }
        }

        connectionService.reply(ServerActions.SERVER_TERMINAL_RECEIVE, ConnectionService.TerminalReceive("main", lines.map { it }.toTypedArray()))
    }

}
