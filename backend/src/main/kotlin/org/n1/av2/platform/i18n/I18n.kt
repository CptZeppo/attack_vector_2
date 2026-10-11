package org.n1.av2.platform.i18n

import org.n1.av2.platform.config.ConfigItem
import org.n1.av2.platform.config.ConfigService
import org.n1.av2.platform.iam.user.UserEntity
import org.n1.av2.platform.iam.user.UserEntityService
import org.n1.av2.platform.iam.user.UserType
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.MessageSource
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.support.ResourceBundleMessageSource
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.util.*

/** Languages in which hacker-facing system text is available. English is always the fallback. */
val SUPPORTED_LANGUAGES = setOf("en", "cs", "fr")

fun localeForLanguage(language: String): Locale = Locale.of(language)

@Configuration
class MessageSourceConfig {

    @Bean
    fun messageSource(): MessageSource {
        val source = ResourceBundleMessageSource()
        source.setBasename("messages")
        source.setDefaultEncoding("UTF-8")
        // English (the default locale) holds every key; Czech only overrides, falling back to English.
        source.setDefaultLocale(Locale.ENGLISH)
        source.setFallbackToSystemLocale(false)
        return source
    }
}

/**
 * Translates hacker-facing system text. The translation happens at the call site (so that
 * interpolated arguments land in the right place per language). Markup such as [b]...[/] stays
 * inside the message values.
 *
 * - [t] without a locale resolves the language of the *current* user (from the security context),
 *   which is the per-hacker reply boundary used by ConnectionService.reply().
 * - [tDefault] uses the global default language (HACKER_DEFAULT_LANGUAGE) and is meant for
 *   broadcast messages that are shared by multiple hackers and so cannot be translated per recipient.
 */
@Service
class I18n(
    private val messageSource: MessageSource,
    private val configService: ConfigService,
    private val userEntityService: UserEntityService,
) {

    @Value("\${defaultLanguage}")
    val defaultLanguage: String = "en"

    fun t(key: String, vararg args: Any): String = t(key, currentLocale(), *args)

    fun t(key: String, locale: Locale, vararg args: Any): String {
        return messageSource.getMessage(key, args, locale)
    }

    /** Translate to the global default language - for broadcasts that are shared by multiple hackers. */
    fun tDefault(key: String, vararg args: Any): String = t(key, defaultLocale(), *args)

    private fun currentLocale(): Locale {
        val user = SecurityContextHolder.getContext().authentication?.principal as? UserEntity
        if (user == null || user.type == UserType.SYSTEM || user.type == UserType.NOT_LOGGED_IN) {
            return defaultLocale()
        }
        // The principal carries a snapshot of the user taken when the WebSocket session connected,
        // so its language can be stale if the hacker changed it mid-session. Read the current value
        // from the database so a language switch takes effect immediately, without reconnecting.
        val language = userEntityService.getByIdOrNull(user.id)?.preferences?.language ?: user.preferences.language
        return localeForLanguage(language)
    }

    private fun defaultLocale(): Locale = localeForLanguage(defaultLanguage())

    private fun defaultLanguage(): String {
        val configured = configService.get(ConfigItem.HACKER_DEFAULT_LANGUAGE)
        return if (configured in SUPPORTED_LANGUAGES) configured else defaultLanguage
    }
}
