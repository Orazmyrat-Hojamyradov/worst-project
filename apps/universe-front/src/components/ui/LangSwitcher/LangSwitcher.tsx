import { useState } from "react";
import styles from "./LangSwitcher.module.css";
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useRouter as NextRouter } from 'next/navigation'

type TLanguage = "en" | "ru" | "tm";

interface ILanguageOption {
  code: TLanguage;
  label: string;
  value: string;
  icon?: string; // Optional: you can add flag emojis or icons
}

const LANGUAGE_OPTIONS: ILanguageOption[] = [
  { code: "en", label: "English", value: "English", icon: "🇺🇸" },
  { code: "tm", label: "Türkmen", value: "Türkmen", icon: "🇹🇲" },
  { code: "ru", label: "Русский", value: "Русский", icon: "🇷🇺" },
];

export default function LanguageSwitcher() {
  const locale = useLocale() as TLanguage;
  const router = useRouter();
  const pathname = usePathname();
  const nextRouter = NextRouter();

  const [lang, setLang] = useState<TLanguage>(locale || "en");
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (selectedLanguage: ILanguageOption) => {
    setLang(selectedLanguage.code);
    setIsOpen(false);
    
    // Remove existing locale from pathname
    const normalizedPathname = pathname.replace(/^\/(en|ru|tm)(?=\/|$)/, '');
    const pathToUse = normalizedPathname || '/';

    // Navigate to the new locale
    router.replace(pathToUse, {
      locale: selectedLanguage.code,
      scroll: false,
    });
    
    nextRouter.refresh();
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Find current language option for display
  const currentLanguage = LANGUAGE_OPTIONS.find(option => option.code === lang);

  return (
    <div className={styles.container}>
      <button 
        className={styles.trigger}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.currentLanguage}>
          {currentLanguage?.icon && (
            <span className={styles.icon}>{currentLanguage.icon}</span>
          )}
          <span className={styles.label}>{currentLanguage?.label}</span>
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <ul 
            className={styles.list}
            role="listbox"
            aria-labelledby="language-switcher"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <li key={option.code} className={styles.listItem}>
                <button
                  className={`${styles.option} ${
                    option.code === lang ? styles.optionActive : ''
                  }`}
                  onClick={() => handleLanguageChange(option)}
                  role="option"
                  aria-selected={option.code === lang}
                >
                  {option.icon && (
                    <span className={styles.icon}>{option.icon}</span>
                  )}
                  <span className={styles.optionLabel}>{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}