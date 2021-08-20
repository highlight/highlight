import ElevatedCard from '@components/ElevatedCard/ElevatedCard';
import Input from '@components/Input/Input';
import TextHighlighter from '@components/TextHighlighter/TextHighlighter';
import SvgSearchIcon from '@icons/SearchIcon';
import { PLAYBACK_SPEED_INCREMENT } from '@pages/Player/Toolbar/SpeedControl/SpeedControl';
import { PLAYER_SKIP_DURATION } from '@pages/Player/utils/PlayerHooks';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation } from 'react-router';
import { useToggle } from 'react-use';

import styles from './KeyboardShortcutsEducation.module.scss';

const KeyboardShortcutsEducation = () => {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [showGuide, toggleShowGuide] = useToggle(false);

    useHotkeys(
        'shift+/',
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            window.focus();

            if (
                document.activeElement &&
                document.activeElement instanceof HTMLElement
            ) {
                document.activeElement.blur();
            }

            if (showGuide) {
                H.track('ViewedKeyboardShortcutsGuide');
            }
            toggleShowGuide();
        },
        [showGuide]
    );

    useHotkeys(
        'esc',
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            window.focus();

            if (
                document.activeElement &&
                document.activeElement instanceof HTMLElement
            ) {
                document.activeElement.blur();
            }

            if (showGuide) {
                toggleShowGuide();
            }
        },
        [showGuide]
    );

    const filteredPlayerKeyboardShortcuts = PlayerKeyboardShortcuts.filter(
        ({ description }) => {
            return description
                .toLocaleLowerCase()
                .includes(searchQuery.toLocaleLowerCase());
        }
    );
    const filteredGeneralKeyboardShortcuts = GeneralKeyboardShortcuts.filter(
        ({ description }) => {
            return description
                .toLocaleLowerCase()
                .includes(searchQuery.toLocaleLowerCase());
        }
    );

    const isOnSessionPlayerPage = location.pathname.includes('sessions');

    return (
        <>
            <div
                className={classNames(styles.backdrop, {
                    [styles.hidden]: !showGuide,
                })}
                onClick={toggleShowGuide}
            ></div>

            <ElevatedCard
                title="Keyboard Shortcuts"
                className={classNames(styles.elevatedCard, {
                    [styles.hidden]: !showGuide,
                })}
            >
                <main className={styles.container}>
                    <Input
                        placeholder="Search"
                        suffix={<SvgSearchIcon className={styles.searchIcon} />}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                        }}
                        allowClear
                        disabled={!isOnSessionPlayerPage}
                    />

                    {!isOnSessionPlayerPage && (
                        <section>
                            <h3 className={styles.emptyTitle}>
                                {location.pathname.split('/').reverse()[0]} Page
                            </h3>

                            <p>
                                There are no keyboard shortcuts for this page.
                            </p>
                        </section>
                    )}

                    {filteredPlayerKeyboardShortcuts.length === 0 &&
                        filteredGeneralKeyboardShortcuts.length === 0 && (
                            <section>
                                <p className={styles.emptyDescription}>
                                    No keyboard results matching '{searchQuery}
                                    '.
                                </p>
                            </section>
                        )}

                    {filteredGeneralKeyboardShortcuts.length > 0 && (
                        <section>
                            <h3>General</h3>

                            <table>
                                {filteredGeneralKeyboardShortcuts.map(
                                    (shortcut) => (
                                        <tr key={shortcut.description}>
                                            <td className={styles.description}>
                                                <TextHighlighter
                                                    searchWords={searchQuery.split(
                                                        ' '
                                                    )}
                                                    textToHighlight={
                                                        shortcut.description
                                                    }
                                                />
                                            </td>
                                            <td
                                                className={
                                                    styles.shortcutContainer
                                                }
                                            >
                                                <KeyboardShortcut
                                                    shortcut={shortcut.shortcut}
                                                />
                                            </td>
                                        </tr>
                                    )
                                )}
                            </table>
                        </section>
                    )}

                    {filteredPlayerKeyboardShortcuts.length > 0 && (
                        <section
                            className={classNames({
                                [styles.disabled]: !isOnSessionPlayerPage,
                            })}
                        >
                            <h3>Session Player Page</h3>

                            <table>
                                {filteredPlayerKeyboardShortcuts.map(
                                    (shortcut) => (
                                        <tr key={shortcut.description}>
                                            <td className={styles.description}>
                                                <TextHighlighter
                                                    searchWords={searchQuery.split(
                                                        ' '
                                                    )}
                                                    textToHighlight={
                                                        shortcut.description
                                                    }
                                                />
                                            </td>
                                            <td
                                                className={
                                                    styles.shortcutContainer
                                                }
                                            >
                                                <KeyboardShortcut
                                                    shortcut={shortcut.shortcut}
                                                />
                                            </td>
                                        </tr>
                                    )
                                )}
                            </table>
                        </section>
                    )}
                </main>
            </ElevatedCard>
        </>
    );
};

export default KeyboardShortcutsEducation;

const KeyboardShortcut = ({ shortcut }: Pick<ShortcutItem, 'shortcut'>) => {
    return (
        <span className={styles.kbdContainer}>
            {shortcut.map((key) => (
                <kbd key={key} className={styles.kbd}>
                    {key}
                </kbd>
            ))}
        </span>
    );
};

interface ShortcutItem {
    description: string;
    shortcut: string[];
}

const GeneralKeyboardShortcuts: ShortcutItem[] = [
    {
        description: 'Open Keyboard Shortcuts Guide',
        shortcut: ['?'],
    },
];

const PlayerKeyboardShortcuts: ShortcutItem[] = [
    {
        description: 'Play or pause the video',
        shortcut: ['space'],
    },
    {
        description: `Set the video time ${
            PLAYER_SKIP_DURATION / 1000
        } seconds backwards`,
        shortcut: ['left'],
    },
    {
        description: `Set the video time ${
            PLAYER_SKIP_DURATION / 1000
        } seconds forwards`,
        shortcut: ['right'],
    },
    {
        description: `Play the next session`,
        shortcut: ['shift', 'N'],
    },
    {
        description: `Play the previous session`,
        shortcut: ['shift', 'P'],
    },
    {
        description: `Decrease the playback speed by ${PLAYBACK_SPEED_INCREMENT}x`,
        shortcut: ['shift', ','],
    },
    {
        description: `Increase the playback speed by ${PLAYBACK_SPEED_INCREMENT}x`,
        shortcut: ['shift', '.'],
    },
    //     {
    //         description: `Toggle fullscreen`,
    //         shortcut: ['F'],
    //     },
    //     {
    //         description: `Enable commenting`,
    //         shortcut: ['c'],
    //     },
    //     {
    //         description: `Inspect element`,
    //         shortcut: ['d'],
    //     },
];
