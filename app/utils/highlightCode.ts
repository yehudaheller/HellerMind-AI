import type { BundledLanguage, BundledTheme, SpecialLanguage } from 'shiki';

type HighlightLanguage = BundledLanguage | SpecialLanguage | string;
type HighlightTheme = BundledTheme | string;

let shikiModulePromise: Promise<typeof import('shiki')> | undefined;

function loadShiki() {
  shikiModulePromise ??= import('shiki');

  return shikiModulePromise;
}

export async function highlightCode(code: string, language: HighlightLanguage, theme: HighlightTheme) {
  const shiki = await loadShiki();
  const effectiveLanguage =
    shiki.isSpecialLang(language) || language in shiki.bundledLanguages ? language : 'plaintext';

  return shiki.codeToHtml(code, {
    lang: effectiveLanguage,
    theme,
  });
}
