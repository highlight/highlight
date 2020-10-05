import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
    Replayer,
    mirror,
    MouseInteractions,
    IncrementalSource,
    EventType,
    mouseInteractionData,
    incrementalData,
} from 'rrweb'

import { eventWithTime } from 'rrweb/typings/types'

import { elementNode } from 'rrweb-snapshot'
import { FaUndoAlt, FaPlay, FaPause } from 'react-icons/fa'
import { Element, scroller } from 'react-scroll'
import { Spinner } from '../../components/Spinner/Spinner'
import { MillisToMinutesAndSeconds } from '../../util/time'
import { useQuery, gql } from '@apollo/client'
import { ReactComponent as PointerIcon } from '../../static/pointer-up.svg'
import { ReactComponent as HoverIcon } from '../../static/hover.svg'
import { Skeleton } from 'antd'
import { useImage } from 'react-image'

import Slider from 'rc-slider'

import styles from './PlayerPage.module.css'
import 'rc-slider/assets/index.css'

export const Player = () => {
    const { session_id } = useParams()
    const [replayer, setReplayer] = useState<Replayer | undefined>(undefined)
    const [paused, setPaused] = useState(true)
    const [time, setTime] = useState(0)
    const [ticker, setTicker] = useState(0)
    const [totalTime, setTotalTime] = useState(0)
    const [playerLoading, setPlayerLoading] = useState(true)
    const playerWrapperRef = useRef<HTMLDivElement>(null)
    const {
        loading: sessionLoading,
        error: sessionError,
        data: sessionData,
    } = useQuery<{ events: any[] }, { session_id: string }>(
        gql`
            query GetEvents($session_id: ID!) {
                events(session_id: $session_id)
            }
        `,
        { variables: { session_id } }
    )

    const resizePlayer = (replayer: Replayer): boolean => {
        const width = replayer?.wrapper?.getBoundingClientRect().width
        const height = replayer?.wrapper?.getBoundingClientRect().height
        const targetWidth = playerWrapperRef.current?.clientWidth
        const targetHeight = playerWrapperRef.current?.clientHeight
        if (!width || !targetWidth || !height || !targetHeight) {
            return false
        }
        const widthDelta = width - targetWidth
        const heightDelta = height - targetHeight
        const widthScale = (targetWidth - 80) / width
        const heightScale = (targetHeight - 80) / height
        const scale = widthDelta > heightDelta ? widthScale : heightScale
        const endHeight = (targetHeight - height * scale) / 2
        const endWidth = (targetWidth - width * scale) / 2
        console.log('height: ', height, targetHeight, heightScale)
        console.log('width', width, targetWidth, widthScale)
        console.log(`applying scale ${scale}`)
        replayer?.wrapper?.setAttribute(
            'style',
            `
      transform: scale(${scale});
      top: ${endHeight}px;
      left: ${endWidth}px;
      `
        )
        setPlayerLoading(false)
        return true
    }

    // This adjusts the dimensions (i.e. scale()) of the iframe when the page loads.
    useEffect(() => {
        if (replayer) {
            const i = window.setInterval(() => {
                if (resizePlayer(replayer)) {
                    window.clearInterval(i)
                }
            }, 200)
        }
    }, [replayer])

    useEffect(() => {
        if (paused) {
            clearInterval(ticker)
            setTicker(0)
            return
        }
        if (!ticker) {
            const ticker = window.setInterval(() => {
                setTime((time) => {
                    if (time < totalTime) {
                        return time + 50
                    }
                    setPaused(true)
                    return time
                })
            }, 50)
            setTicker(ticker)
        }
    }, [setTicker, paused, ticker, totalTime])

    useEffect(() => {
        if (sessionData?.events?.length ?? 0 > 1) {
            // Add an id field to each event so it can be referenced.
            const newEvents: string[] =
                sessionData?.events.map((e) => {
                    return { ...e }
                }) ?? []
            let r = new Replayer(newEvents, {
                root: document.getElementById('player') as HTMLElement,
            })
            setTotalTime(r.getMetaData().totalTime)
            setReplayer(r)
            r.getTimeOffset()
        }
    }, [sessionData])

    if (sessionError) {
        return <p>{sessionError.toString()}</p>
    }

    return (
        <div className={styles.playerBody}>
            <div className={styles.playerLeftSection}>
                <div className={styles.rrwebPlayerSection}>
                    <div
                        className={styles.rrwebPlayerWrapper}
                        ref={playerWrapperRef}
                    >
                        <div
                            style={{
                                visibility: playerLoading
                                    ? 'hidden'
                                    : 'visible',
                            }}
                            className={styles.rrwebPlayerDiv}
                            id="player"
                        ></div>
                        {(playerLoading || sessionLoading) && <Spinner />}
                    </div>
                </div>
                <Slider
                    onChange={(e: any) => setTime(e)}
                    value={time}
                    max={totalTime}
                    disabled={false}
                />
                <div className={styles.toolbarSection}>
                    <div
                        className={styles.playSection}
                        onClick={() => {
                            if (paused) {
                                replayer?.play(time)
                                setPaused(false)
                            } else {
                                replayer?.pause()
                                setPaused(true)
                            }
                        }}
                    >
                        {paused ? (
                            <FaPlay
                                fill="black"
                                className={styles.playButtonStyle}
                            />
                        ) : (
                            <FaPause
                                fill="black"
                                className={styles.playButtonStyle}
                            />
                        )}
                    </div>
                    <div
                        className={styles.undoSection}
                        onClick={() => {
                            const newTime = time - 7000 < 0 ? 0 : time - 7000
                            if (paused) {
                                replayer?.pause(newTime)
                                setTime(newTime)
                            } else {
                                replayer?.play(newTime)
                                setTime(newTime)
                            }
                        }}
                    >
                        <FaUndoAlt
                            fill="black"
                            className={styles.undoButtonStyle}
                        />
                    </div>
                    <div className={styles.timeSection}>
                        {MillisToMinutesAndSeconds(time)}&nbsp;/&nbsp;
                        {MillisToMinutesAndSeconds(totalTime)}
                    </div>
                </div>
            </div>
            <div className={styles.playerRightSection}>
                <EventStream
                    replayer={replayer}
                    events={
                        (sessionData?.events as Array<eventWithTime>) ??
                        ([] as Array<eventWithTime>)
                    }
                    time={time}
                />{' '}
                <MetadataBox />
            </div>
        </div>
    )
}

const MetadataBox = () => {
    const { session_id } = useParams()
    const { loading, error, data } = useQuery<{
        session: {
            details: any
            user_id: number
            created_at: number
            user_object: any
            identifier: string
        }
    }>(
        gql`
            query GetSession($id: ID!) {
                session(id: $id) {
                    details
                    user_id
                    created_at
                    user_object
                    identifier
                }
            }
        `,
        { variables: { id: session_id } }
    )
    const { src, isLoading, error: imgError } = useImage({
        srcList: `https://avatar.windsor.io/${data?.session.user_id}`,
        useSuspense: false,
    })
    const created = new Date(data?.session.created_at ?? 0)
    var details: any = {}
    try {
        details = JSON.parse(data?.session?.details)
    } catch (e) {}
    return (
        <div className={styles.locationBox}>
            <div className={styles.innerLocationBox}>
                {isLoading || loading ? (
                    <Skeleton active paragraph={{ rows: 2 }} />
                ) : error || imgError ? (
                    <p>
                        {imgError?.toString()}
                        {error?.toString()}
                    </p>
                ) : (
                    <>
                        <div className={styles.avatarWrapper}>
                            <img
                                style={{
                                    height: 60,
                                    width: 60,
                                    backgroundColor: '#F2EEFB',
                                    borderRadius: '50%',
                                }}
                                alt={'user profile'}
                                src={src}
                            />
                        </div>
                        <div
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ fontSize: 16, fontWeight: 400 }}>
                                <span>User#{data?.session.user_id}</span>
                                {data?.session.identifier && (
                                    <span>• {data?.session.identifier}</span>
                                )}
                            </div>
                            <div style={{ color: '#808080', fontSize: 13 }}>
                                <div>
                                    {details?.city}, {details?.state} &nbsp;
                                    {details?.postal}
                                </div>
                                <div>{created.toUTCString()}</div>
                                {details?.browser && (
                                    <div>
                                        {details?.browser?.os},&nbsp;
                                        {details?.browser?.name} &nbsp;-&nbsp;
                                        {details?.browser?.version}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

const EventStream = ({
    events,
    time,
    replayer,
}: {
    events: any[]
    time: number
    replayer: Replayer | undefined
}) => {
    const [currEvent, setCurrEvent] = useState(-1)
    useEffect(() => {
        if (!replayer) return
        replayer.on('event-cast', (e: any) => {
            const event = e as eventWithTime
            if (usefulEvent(event)) {
                setCurrEvent(event.timestamp)
                scroller.scrollTo(event.timestamp.toString(), {
                    smooth: true,
                    containerId: 'wrapper',
                    spy: true,
                    offset: -150,
                })
            }
        })
    }, [replayer, time])
    return (
        <>
            <div id="wrapper" className={styles.eventStreamContainer}>
                <div className={styles.emptyScrollDiv}></div>
                {!events.length ? (
                    <Skeleton active />
                ) : (
                    replayer &&
                    events
                        .filter(usefulEvent)
                        .map((e: eventWithTime, i: number) => {
                            const mouseInteraction = e.data as mouseInteractionData
                            let eventStr = ''
                            switch (mouseInteraction.type) {
                                case MouseInteractions.Click:
                                    eventStr = 'Click'
                                    break
                                case MouseInteractions.Focus:
                                    eventStr = 'Focus'
                                    break
                            }
                            const node = mirror.map[mouseInteraction.id]
                                ?.__sn as elementNode
                            var idString = node?.tagName
                            if (node?.attributes) {
                                const attrs = node?.attributes
                                if (
                                    'class' in attrs &&
                                    attrs.class.toString()
                                ) {
                                    idString = idString.concat(
                                        '.' + attrs.class
                                    )
                                }
                                if ('id' in attrs && attrs.id.toString()) {
                                    idString = idString.concat('#' + attrs.id)
                                }
                                Object.keys(attrs)
                                    .filter(
                                        (key) => !['class', 'id'].includes(key)
                                    )
                                    .forEach(
                                        (key) =>
                                            (idString +=
                                                '[' +
                                                key +
                                                '=' +
                                                attrs[key] +
                                                ']')
                                    )
                            }

                            let timeSinceStart =
                                e?.timestamp -
                                replayer?.getMetaData()?.startTime
                            return (
                                <Element
                                    name={e.timestamp.toString()}
                                    key={e.timestamp.toString()}
                                    className={styles.eventWrapper}
                                >
                                    <div
                                        className={styles.streamElement}
                                        style={{
                                            backgroundColor:
                                                currEvent === e.timestamp
                                                    ? '#F2EDFF'
                                                    : 'inherit',
                                            color:
                                                currEvent === e.timestamp
                                                    ? 'black'
                                                    : 'grey',
                                            fill:
                                                currEvent === e.timestamp
                                                    ? 'black'
                                                    : 'grey',
                                        }}
                                        key={i}
                                        id={i.toString()}
                                    >
                                        <div className={styles.iconWrapper}>
                                            {eventStr === 'Click' ? (
                                                <PointerIcon
                                                    className={styles.eventIcon}
                                                />
                                            ) : (
                                                <HoverIcon
                                                    className={styles.eventIcon}
                                                />
                                            )}
                                        </div>
                                        <div className={styles.eventText}>
                                            &nbsp;{eventStr} &nbsp;&nbsp;
                                        </div>
                                        <div
                                            className={styles.codeBlockWrapper}
                                        >
                                            {idString}
                                        </div>
                                        <div style={{ marginLeft: 'auto' }}>
                                            {MillisToMinutesAndSeconds(
                                                timeSinceStart
                                            )}
                                        </div>
                                    </div>
                                </Element>
                            )
                        })
                )}
            </div>
        </>
    )
}

// used in filter() type methods to fetch events we want
const usefulEvent = (e: eventWithTime): boolean => {
    // If its not an 'incrementalSnapshot', discard.
    if ((e as eventWithTime).type === EventType.Custom)
        console.log(e as eventWithTime)
    if ((e as eventWithTime).type !== EventType.IncrementalSnapshot)
        return false
    const snapshotEventData = e.data as incrementalData
    switch (snapshotEventData.source) {
        case IncrementalSource.MouseInteraction:
            switch (snapshotEventData.type) {
                case MouseInteractions.Click:
                    return true
                case MouseInteractions.Focus:
                    return true
            }
    }
    return false
}
