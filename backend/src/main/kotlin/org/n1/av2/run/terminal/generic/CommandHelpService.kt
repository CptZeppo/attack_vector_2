package org.n1.av2.run.terminal.generic

import org.n1.av2.hacker.hackerstate.HackerActivity
import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.hacker.skill.Skill
import org.n1.av2.hacker.skill.SkillService
import org.n1.av2.hacker.skill.SkillType.*
import org.n1.av2.hacker.skill.containsType
import org.n1.av2.platform.config.ConfigItem.DEV_HACKER_USE_DEV_COMMANDS
import org.n1.av2.platform.config.ConfigItem.HACKER_SCRIPT_LOAD_DURING_RUN
import org.n1.av2.platform.config.ConfigService
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.springframework.stereotype.Service

@Service
class CommandHelpService(
    private val connectionService: ConnectionService,
    private val configService: ConfigService,
    private val skillService: SkillService,
    private val i18n: I18n,
) {

    private fun replyHelp(key: String) = connectionService.replyTerminalReceive(i18n.t(key).split("\n"))

    fun processHelp(arguments: List<String>, hackerState: HackerStateRunning) {
        val skills = skillService.findSkillsForUser(hackerState.userId)

        if (arguments.isEmpty() || arguments[0] != "shortcuts") {
            if (hackerState.activity == HackerActivity.INSIDE) {
                processHelpInside(skills)
            } else {
                processHelpOutside(skills)
            }
        } else {
            processHelpKeys()
        }
    }

    private fun processHelpOutside(skills: List<Skill>) {
        replyHelp("help.outside.intro")
        if (skills.containsType(SCAN)) {
            replyHelp("help.outside.scan")
        }

        replyHelp("help.outside.attack")
        showRunScriptHelp(skills)
        showShareHelp()
        showDownloadScriptHelp(skills)

        if (configService.getAsBoolean(DEV_HACKER_USE_DEV_COMMANDS)) {
            replyHelp("help.outside.dev")
        }
    }

    private fun processHelpInside(skills: List<Skill>) {
        replyHelp("help.inside.intro")

        if (skills.containsType(SCAN)) {
            replyHelp("help.inside.scan")
        }

        showRunScriptHelp(skills)
        showWeakenHelp(skills)
        showUndoTripwireHelp(skills)
        showJumpToHackerHelp(skills)

        replyHelp("help.inside.password-dc")
        showShareHelp()
        showDownloadScriptHelp(skills)

        replyHelp("help.inside.shortcuts-hint")
    }

    private fun processHelpKeys() = replyHelp("help.keys")

    private fun showRunScriptHelp(skills: List<Skill>) {
        if (skills.containsType(SCRIPT_RAM)) {
            replyHelp("help.run-script")
        }
    }

    private fun showWeakenHelp(skills: List<Skill>) {
        if (skills.containsType(WEAKEN)) {
            replyHelp("help.weaken")
        }
    }

    private fun showUndoTripwireHelp(skills: List<Skill>) {
        if (skills.containsType(UNDO_TRIPWIRE)) {
            replyHelp("help.rollback")
        }
    }

    private fun showJumpToHackerHelp(skills: List<Skill>) {
        if (skills.containsType(JUMP_TO_HACKER)) {
            replyHelp("help.jump")
        }
    }

    private fun showDownloadScriptHelp(skills: List<Skill>) {
        if (configService.getAsBoolean(HACKER_SCRIPT_LOAD_DURING_RUN) && skills.containsType(SCRIPT_RAM)) {
            replyHelp("help.download-script")
        }
    }

    private fun showShareHelp() = replyHelp("help.share")
}
