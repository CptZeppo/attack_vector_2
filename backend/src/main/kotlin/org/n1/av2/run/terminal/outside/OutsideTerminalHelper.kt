package org.n1.av2.run.terminal.outside

import org.n1.av2.hacker.hackerstate.HackerActivity
import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.platform.util.TimeService
import org.n1.av2.site.entity.SitePropertiesEntityService
import org.springframework.stereotype.Service

const val CONNECTION_REFUSED_SHUTDOWN_KEY = "terminal.connection-refused-shutdown"

@Service
class OutsideTerminalHelper(
    private val sitePropertiesEntityService: SitePropertiesEntityService,
    private val timeService: TimeService,
    private val connectionService: ConnectionService,
    private val i18n: I18n,
) {

    fun verifySiteNotShutdown(siteId: String): Boolean {
        val siteProperties = sitePropertiesEntityService.getBySiteId(siteId)
        val now = timeService.now()
        if (siteProperties.shutdownEnd != null && now < siteProperties.shutdownEnd) {
            connectionService.replyTerminalReceive(i18n.t(CONNECTION_REFUSED_SHUTDOWN_KEY))
            return false
        }
        return true
    }

    fun verifyOutside(hackerState: HackerStateRunning): Boolean {
        if (hackerState.activity != HackerActivity.OUTSIDE) {
            connectionService.replyTerminalReceive(i18n.t("terminal.only-when-outside"))
            return false
        }
        return true
    }
}
