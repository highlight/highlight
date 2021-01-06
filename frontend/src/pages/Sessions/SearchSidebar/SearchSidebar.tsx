import React, { useEffect, useState } from 'react';
import styles from './SearchSidebar.module.scss';
import classNames from 'classnames/bind';
import { DateInput } from '../SearchInputs/DateInput';
import { BrowserInput, OperatingSystemInput } from '../SearchInputs/DeviceInputs';
import { UserPropertyInput, IdentifiedUsersSwitch } from '../SearchInputs/UserPropertyInputs';
import { ReferrerInput, VisitedUrlInput } from '../SearchInputs/SessionInputs';
import Collapsible from 'react-collapsible';
import { ReactComponent as DownIcon } from '../../../static/chevron-down.svg';
import { ReactComponent as Hamburger } from '../../../static/hamburger.svg';
import commonStyles from '../../../Common.module.scss';

export const SearchSidebar = ({ feedPosition }: { feedPosition: { top: number; right: number } }) => {
    const [open, setOpen] = useState(true);
    const [width, setWidth] = useState(window.innerWidth);
    const updateDimensions = () => {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);
    return (
        <>
            <div
                className={classNames([
                    styles.searchBar,
                ])}
                style={{
                    left: open ? feedPosition.right + 20 : width, top: 80
                }}
            >
                <div className={classNames(styles.sideTab, open ? styles.sideTabHidden : styles.sideTabVisible)} onClick={() => setOpen(o => !o)}>
                    <Hamburger className={styles.hamburgerSide} />
                </div>
                <div
                    className={styles.sideContentWrapper}
                >
                    <div className={styles.hideRow} onClick={() => setOpen(false)}>
                        <div className={styles.hideWrapper}>
                            <span className={styles.hideText}>Hide</span>
                            <DownIcon
                                className={styles.hideIcon}
                            />
                        </div>
                    </div>
                    <div className={styles.contentSection}>
                        <SearchSection title="User Properties" open>
                            <UserPropertyInput />
                            <IdentifiedUsersSwitch />
                        </SearchSection>
                        <SearchSection title="Date Range" open={false}>
                            <DateInput />
                        </SearchSection>
                        <SearchSection title="Device Details" open={false}>
                            <OperatingSystemInput />
                            <BrowserInput />
                        </SearchSection>
                        <SearchSection title="Session Details" open={false}>
                            <VisitedUrlInput />
                            <ReferrerInput />
                        </SearchSection>
                    </div>
                    <div className={commonStyles.submitButton}>Save as Segment</div>
                </div>
            </div >
        </>
    );
};


type SearchSectionProps = {
    title: string;
    open: boolean;
};

const SearchSection: React.FunctionComponent<SearchSectionProps> = ({
    children,
    title,
    open
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(open);
    const header = (
        <div className={styles.headerWrapper}>
            <DownIcon
                className={styles.icon}
                style={{
                    transform: !isOpen ? 'rotate(180deg)' : 'rotate(360deg)',
                }}
            />
            <div className={styles.header}>{title}</div>
        </div>
    );
    return (
        <div className={styles.searchSectionWrapper}>
            <Collapsible
                open={open}
                onOpening={() => setIsOpen(true)}
                onClosing={() => setIsOpen(false)}
                trigger={header}
                transitionTime={150}
                style={{ margin: 10 }}
                contentOuterClassName={isOpen ? styles.contentOuterOpen : styles.contentOuterClosed}
            >
                <div className={styles.searchSection}>
                    {children}
                </div>
            </Collapsible>
        </div>
    );
}