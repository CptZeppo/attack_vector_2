package org.n1.av2.layer.other.core

import org.n1.av2.layer.other.tripwire.TripwireLayer
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.run.entity.RunEntityService
import org.n1.av2.run.local.MessageService
import org.n1.av2.run.scanning.InitiateScanService
import org.n1.av2.site.entity.NodeEntityService
import org.n1.av2.site.entity.SitePropertiesEntityService
import org.n1.av2.timer.Timer
import org.n1.av2.timer.TimerEntityService
import org.n1.av2.timer.TimerService
import org.springframework.stereotype.Service

@Service
class CoreLayerService(
    private val connectionService: ConnectionService,
    private val initiateScanService: InitiateScanService,
    private val runEntityService: RunEntityService,
    private val nodeEntityService: NodeEntityService,
    private val timerEntityService: TimerEntityService,
    private val timerService: TimerService,
    private val sitePropertiesEntityService: SitePropertiesEntityService,
    private val messageService: MessageService,
) {

    fun hack(layer: CoreLayer, runId: String) {
        var hackingDetails = listOf(messageService.getMessage("layer.common.hacked", layer.level, layer.name)).toMutableList()
        if (layer.revealNetwork) {
            val run = runEntityService.getByRunId(runId)
            initiateScanService.quickScan(run)
            hackingDetails.add(messageService.getMessage("layer.core.hack.reveal"))
        }

        val timers = stopTimers(runId, layer)
        timers.forEach { timer ->
            if (timer.targetSiteId == timer.siteId) {
                hackingDetails.add(messageService.getMessage("layer.core.hack.timer"))
            } else {
                val siteProperties = sitePropertiesEntityService.getBySiteId(timer.targetSiteId)
                hackingDetails.add(messageService.getMessage("layer.core.hack.timer.remote", siteProperties.name))
            }
        }

        if (hackingDetails.isEmpty()) {
            hackingDetails.add(messageService.getMessage("layer.core.hack.empty"))
        }

        connectionService.replyTerminalReceive(hackingDetails)
    }

    private fun stopTimers(runId: String, layer: CoreLayer): List<Timer> {
        val run = runEntityService.getByRunId(runId)

        val timersOfSite = timerEntityService.findBySiteId(run.siteId)
        val timers = timersOfSite.mapNotNull { timer ->
            val tripwires: List<TripwireLayer> = nodeEntityService.findBySiteId(timer.targetSiteId)
                .flatMap { node ->
                    node.layers
                        .filterIsInstance<TripwireLayer>()
                        .filter { tripwireLayer -> tripwireLayer.coreLayerId == layer.id }
                }

            val tripwireLayer = tripwires.firstOrNull() ?: return@mapNotNull null // this timer is not reset by this core
            timerService.stopTripwireTimer(timer, tripwireLayer)

            timer
        }
        return timers
    }
}
