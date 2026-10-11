package org.n1.av2.run.terminal.inside

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.sweeper.SweeperIceLayer
import org.n1.av2.layer.ice.sweeper.SweeperService
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.run.terminal.generic.DevCommandHelper
import org.n1.av2.site.entity.NodeEntityService
import org.springframework.stereotype.Service

@Service
class CommandDebugService(
    private val connectionService: ConnectionService,
    private val sweeperService: SweeperService,
    private val nodeEntityService: NodeEntityService,
    private val devCommandHelper: DevCommandHelper,
    private val insideTerminalHelper: InsideTerminalHelper,
    private val i18n: I18n,
) {

    fun processSweepUnblock(arguments: List<String>, hackerState: HackerStateRunning) {
        if (!devCommandHelper.checkDevModeEnabled()) return
        if (!insideTerminalHelper.verifyInside(hackerState)) return
        requireNotNull(hackerState.currentNodeId)

        if (arguments.isEmpty()) {
            return connectionService.replyTerminalReceive(i18n.t("debug.missing-layer-level"))
        }
        val level = arguments.first().toIntOrNull() ?: return connectionService.replyTerminalReceive(i18n.t("debug.invalid-layer", arguments.first()))
        val node = nodeEntityService.getById(hackerState.currentNodeId)
        val layer = node.layers.find { it.level == level }!!

        if (layer !is SweeperIceLayer) return connectionService.replyTerminalReceive(i18n.t("debug.not-sweeper-ice"))

        sweeperService.debugUnblock(layer, hackerState.userId)
    }
}
