import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Replayer, mirror } from "rrweb";
import { FaUndoAlt, FaHandPointUp, FaPlay, FaPause } from "react-icons/fa";
import styles from "../../App.module.css";
import { Element, scroller } from "react-scroll";
import { Spinner } from "../../components/Spinner/Spinner";
import { useQuery, gql } from "@apollo/client";
import Slider from "rc-slider";

import "rc-slider/assets/index.css";

export const Player = () => {
  const { session_id } = useParams();
  const [replayer, setReplayer] = useState<Replayer | undefined>(undefined);
  const [paused, setPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [ticker, setTicker] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [playerLoading, setPlayerLoading] = useState(true);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  const { loading, error, data } = useQuery(gql`
    query GetSession {
      session(id: "${session_id}") {
        details
      }
    }
  `);

  const {
    loading: sessionLoading,
    error: sessionError,
    data: sessionData
  } = useQuery<{ events: any[] }, { session_id: string }>(
    gql`
      query GetEvents($session_id: ID!) {
        events(session_id: $session_id)
      }
    `,
    { variables: { session_id } }
  );

  // This adjusts the dimensions (i.e. scale()) of the iframe when the page loads.
  useEffect(() => {
    window.setTimeout(() => {
      const width = replayer?.wrapper?.getBoundingClientRect().width;
      const height = replayer?.wrapper?.getBoundingClientRect().height;
      const targetWidth = playerWrapperRef.current?.clientWidth;
      const targetHeight = playerWrapperRef.current?.clientHeight;
      if (!width || !targetWidth || !height || !targetHeight) return;
      const widthDelta = (targetWidth - 80) / width;
      const heightDelta = (targetHeight - 80) / height;
      const delta =
        Math.abs(widthDelta - 1) > Math.abs(heightDelta - 1)
          ? widthDelta
          : heightDelta;
      const endHeight = (targetHeight - height * delta) / 2;
      const endWidth = (targetWidth - width * delta) / 2;
      replayer?.wrapper?.setAttribute(
        "style",
        `
      transform: scale(${delta});
      top: ${endHeight}px;
      left: ${endWidth}px;
      `
      );

      setPlayerLoading(false);
    }, 1000);
  }, [replayer]);

  useEffect(() => {
    if (paused) {
      clearInterval(ticker);
      setTicker(0);
      return;
    }
    if (!ticker) {
      const ticker = window.setInterval(() => {
        setTime(time => {
          if (time < totalTime) {
            return time + 50;
          }
          setPaused(true);
          return time;
        });
      }, 50);
      setTicker(ticker);
    }
  }, [setTicker, paused, ticker, totalTime]);

  useEffect(() => {
    if (sessionData?.events?.length ?? 0 > 1) {
      // Add an id field to each event so it can be referenced.
      const newEvents: string[] =
        sessionData?.events.map((e: any, i: number) => {
          return { ...e, identifier: i };
        }) ?? [];
      let r = new Replayer(newEvents, {
        root: document.getElementById("player") as HTMLElement
      });
      setTotalTime(r.getMetaData().totalTime);
      setReplayer(r);
      r.getTimeOffset();
    }
  }, [sessionData]);

  if (loading || sessionLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spinner />
      </div>
    );
  }
  if (sessionError) {
    return <p>{sessionError.toString()}</p>;
  }
  if (error) {
    return <p>{error.toString()}</p>;
  }
  return (
    <div className={styles.playerBody}>
      <div className={styles.playerLeftSection}>
        <div className={styles.rrwebPlayerSection}>
          <div className={styles.rrwebPlayerWrapper} ref={playerWrapperRef}>
            <div
              style={{ visibility: playerLoading ? "hidden" : "visible" }}
              className={styles.rrwebPlayerDiv}
              id="player"
            />
            {playerLoading && <Spinner />}
          </div>
        </div>
        {
          /* lol https://github.com/Microsoft/TypeScript/issues/27552#issuecomment-495830020
      // @ts-ignore */ /* prettier-ignore */
          <Slider
						onChange={(e: any) => setTime(e)}
					value={time}
					max={totalTime}
					disabled={false}
					pushable={true}
					context={undefined}
				/>
        }
        <div className={styles.toolbarSection}>
          <div
            className={styles.playSection}
            onClick={() => {
              if (paused) {
                replayer?.play(time);
                setPaused(false);
              } else {
                replayer?.pause();
                setPaused(true);
              }
            }}
          >
            {paused ? (
              <FaPlay fill="black" className={styles.playButtonStyle} />
            ) : (
              <FaPause fill="black" className={styles.playButtonStyle} />
            )}
          </div>
          <div
            className={styles.undoSection}
            onClick={() => {
              const newTime = time - 7000 < 0 ? 0 : time - 7000;
              if (paused) {
                replayer?.pause(newTime);
                setTime(newTime);
              } else {
                replayer?.play(newTime);
                setTime(newTime);
              }
            }}
          >
            <FaUndoAlt fill="black" className={styles.undoButtonStyle} />
          </div>
          <div className={styles.timeSection}>
            {millisToMinutesAndSeconds(time)}&nbsp;/&nbsp;
            {millisToMinutesAndSeconds(totalTime)}
          </div>
        </div>
      </div>
      <div className={styles.playerRightSection}>
        <EventStream
          replayer={replayer}
          events={sessionData?.events ?? []}
          detailsRaw={data?.session?.details}
          time={time}
        />
      </div>
    </div>
  );
};

const isClick = (e: any) => {
  return e.type === 3 && e.data.type === 2;
};

const EventStream = ({
  detailsRaw,
  events,
  time,
  replayer
}: {
  detailsRaw: any;
  events: any[];
  time: number;
  replayer: Replayer | undefined;
}) => {
  // const { replayer, events, time, details: detailsRaw } = props;
  const [currClick, setCurrClick] = useState(-1);
  useEffect(() => {
    replayer &&
      replayer.on("event-cast", (e: any) => {
        if (isClick(e)) {
          setCurrClick(e.identifier);
          scroller.scrollTo(e.identifier.toString(), {
            smooth: true,
            containerId: "wrapper",
            spy: true,
            offset: -150
          });
        }
      });
  }, [replayer, time]);
  const startDate = new Date(events[0]?.timestamp);
  const details = JSON.parse(detailsRaw);
  return (
    <>
      <div className={styles.locationBox}>
        {details && (
          <div className={styles.innerLocationBox}>
            <div style={{ color: "black" }}>
              {details.city}, {details.postal}, {details.country_name}
            </div>
            <div style={{ color: "black" }}>{startDate.toUTCString()}</div>
            {details.browser && (
              <div style={{ color: "black" }}>
                {details.browser.os},{details.browser.name} &nbsp;-&nbsp;
                {details.browser.version}
              </div>
            )}
          </div>
        )}
      </div>
      <div id="wrapper" className={styles.eventStreamContainer}>
        <div className={styles.emptyScrollDiv}></div>
        {events &&
          replayer &&
          events.map((e, i) => {
            if (!isClick(e))
              return <React.Fragment key={i.toString()}></React.Fragment>;
            let clickStr =
              mirror.map[e.data.id] && mirror.map[e.data.id].nodeName;
            let timeSinceStart = e.timestamp - replayer.getMetaData().startTime;
            return (
              <Element name={i.toString()} key={i.toString()}>
                <div
                  className={styles.streamElement}
                  style={{
                    backgroundColor: currClick === i ? "#F2EDFF" : "inherit"
                  }}
                  key={i}
                  id={i.toString()}
                >
                  <div style={{ marginRight: 10 }}>
                    <FaHandPointUp />
                  </div>
                  &nbsp;Clicked &nbsp;&nbsp;
                  <div>{clickStr}</div>
                  <div style={{ marginLeft: "auto" }}>
                    {millisToMinutesAndSeconds(timeSinceStart)}
                  </div>
                </div>
              </Element>
            );
          })}
      </div>
    </>
  );
};

function millisToMinutesAndSeconds(millis: any) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + seconds;
}
