package org.n1.av2.script.effect.helper

import org.n1.av2.hacker.hackerstate.HackerActivity
import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.Layer
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.site.entity.Node
import org.n1.av2.site.entity.NodeEntityService
import org.n1.av2.site.entity.SitePropertiesEntityService
import org.springframework.stereotype.Service

@Service
class ScriptEffectHelper(
    private val sitePropertiesEntityService: SitePropertiesEntityService,
    private val nodeEntityService: NodeEntityService,
    private val i18n: I18n,
) {

    fun checkAtNonShutdownSite(hackerState: HackerStateRunning): String? {
        if (hackerState.activity == HackerActivity.OFFLINE) {
            return i18n.t("script-effect.run-when-hacking")
        }

        val siteState = sitePropertiesEntityService.getBySiteId(hackerState.siteId)
        if (siteState.shutdownEnd != null) {
            return i18n.t("script-effect.site-shutdown")
        }
        return null
    }

    fun checkInNode(hackerState: HackerStateRunning): String? {
        if (hackerState.activity == HackerActivity.OUTSIDE) {
            return i18n.t("script-effect.only-inside-node")
        }
        return null
    }

    class RunOnLayerResult(val layer: Layer?, val node: Node?, val errorExecution: ScriptExecution?) {
        constructor(errorMessage: String) : this(null, null, ScriptExecution(errorMessage))
    }

    /** Check if the script can be run on the specified layer */
    fun runOnLayer(argumentTokens: List<String>, hackerState: HackerStateRunning): RunOnLayerResult {
        checkInNode(hackerState)?.let { return RunOnLayerResult(it) }
        requireNotNull(hackerState.currentNodeId)
        val layerInput = argumentTokens.firstOrNull() ?: return RunOnLayerResult(i18n.t("script-effect.provide-layer"))
        val layerNumber = layerInput.toIntOrNull() ?: return RunOnLayerResult(i18n.t("script-effect.provide-layer-number"))
        val node = nodeEntityService.getById(hackerState.currentNodeId)
        val layer = node.layers.find { it.level == layerNumber.toInt() } ?: return RunOnLayerResult(i18n.t("script-effect.layer-not-found"))
        return RunOnLayerResult(layer, node, null)
    }

}
