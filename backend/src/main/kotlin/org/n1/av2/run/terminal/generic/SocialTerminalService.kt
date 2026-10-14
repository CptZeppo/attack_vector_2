package org.n1.av2.run.terminal.generic

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.larp.frontier.LOLA_USER_NAME
import org.n1.av2.larp.frontier.LolaService
import org.n1.av2.platform.config.ConfigItem
import org.n1.av2.platform.config.ConfigService
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.platform.iam.user.UserEntityService
import org.n1.av2.run.runlink.RunLinkService
import org.springframework.stereotype.Service

@Service
class SocialTerminalService(
    private val connectionService: ConnectionService,
    private val userEntityService: UserEntityService,
    private val runLinkService: RunLinkService,
    private val configService: ConfigService,
    private val lolaService: LolaService,
    private val i18n: I18n,
) {

    fun processShare(arguments: List<String>, hackerState: HackerStateRunning) {
        if (arguments.isEmpty()) {
            connectionService.replyTerminalReceive(i18n.t("social.share-missing-username"))
            return
        }

        val userNames = arguments.flatMap { it.split(",") }.map { it.trim() }.filter { it != "" }

        userNames.forEach { userName ->
            shareWithUser(userName, hackerState.runId)
        }

    }

    private fun shareWithUser(userName: String, runId: String) {
        val user = userEntityService.findByNameIgnoreCase(userName)
        if (user == null) {
            connectionService.replyTerminalReceive(i18n.t("social.hacker-not-found", userName))
            return
        }

        if (user.name.uppercase() == LOLA_USER_NAME && configService.getAsBoolean(ConfigItem.LARP_SPECIFIC_FRONTIER_LOLA_ENABLED)) {
            lolaService.share(user, runId)
        } else {
            runLinkService.shareRun(runId, user, true)
        }
    }

}
