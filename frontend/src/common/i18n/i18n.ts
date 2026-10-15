import {useSelector} from "react-redux"
import Cookies from "js-cookie"
import {User} from "../users/CurrentUserReducer"
import {en} from "./en"
import {cs} from "./cs"
import {fr} from "./fr"

export const DEFAULT_LANGUAGE = "fr"
const LANGUAGE_COOKIE = "language"

export type TranslationKey = keyof typeof en

const translations: Record<string, Partial<Record<TranslationKey, string>>> = {en, cs, fr}

const interpolate = (template: string, args: (string | number)[]): string =>
    template.replace(/\{(\d+)}/g, (match, index) => {
        const arg = args[Number(index)]
        return arg !== undefined ? String(arg) : match
    })

/** Translate a key for an explicit language, falling back to English then to the key itself. */
export const translate = (language: string, key: TranslationKey, ...args: (string | number)[]): string => {
    const table = translations[language] ?? translations[DEFAULT_LANGUAGE]
    const template = table[key] ?? en[key] ?? (key as string)
    return interpolate(template, args)
}

/**
 * Language stored in a cookie (shared across same-origin windows). Used by standalone windows
 * (ICE mini-games, apps) whose redux store has no currentUser, and as a fallback elsewhere.
 * The main app sets it whenever the current user is received.
 */
export const getStoredLanguage = (): string => Cookies.get(LANGUAGE_COOKIE) || DEFAULT_LANGUAGE
export const setStoredLanguage = (language: string): void => {
    Cookies.set(LANGUAGE_COOKIE, language, {expires: 365})
}

/** Translate using the stored (cookie) language - for non-React code such as the ICE managers. */
export const tStored = (key: TranslationKey, ...args: (string | number)[]): string =>
    translate(getStoredLanguage(), key, ...args)

/**
 * Hook returning a translate function bound to the current user's language preference.
 * Reactive in the main app (language change updates currentUser in redux). In standalone windows
 * (no currentUser in the store) it falls back to the language cookie.
 */
export const useTranslate = (): ((key: TranslationKey, ...args: (string | number)[]) => string) => {
    const language = useSelector((state: { currentUser?: User }) => state.currentUser?.preferences?.language) ?? getStoredLanguage()
    return (key: TranslationKey, ...args: (string | number)[]) => translate(language, key, ...args)
}
