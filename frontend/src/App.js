import React, { useState, useEffect } from "react";
import { useFetch } from "use-http";
import { Route, useParams, BrowserRouter as Router } from "react-router-dom";
import { Replayer, mirror } from "rrweb";
import { FaUndoAlt, FaHandPointUp, FaPlay, FaPause } from "react-icons/fa";
import { useTimer } from "use-timer";
import styles from "./App.module.css";
import {
  Link,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller
} from "react-scroll";
import BeatLoader from "react-spinners/BeatLoader";
import { ReactComponent as JourneyLogo } from "./logo.svg";
import { ReactComponent as WindowOptions } from "./window-options.svg";
import Slider, { Range } from "rc-slider";

import "rc-slider/assets/index.css";

const AppInternal = props => {
  const { vid } = useParams();
  const [replayer, setReplayer] = useState(undefined);
  const [paused, setPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [ticker, setTicker] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const { loading, error, data = [] } = useFetch(
    process.env.REACT_APP_BACKEND_URI +
      "/get-events?" +
      new URLSearchParams({
        vid: vid
      }),
    {},
    []
  );

  useEffect(() => {
    if (paused) {
      clearInterval(ticker);
      setTicker(undefined);
      return;
    }
    if (!ticker) {
      const ticker = setInterval(() => {
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
  });

  useEffect(() => {
    if (data && data.events && data.events.length > 1) {
      // Add an id field to each event so it can be referenced.
      const newEvents = data.events.map((e, i) => {
        e.identifier = i;
        return e;
      });
      let r = new Replayer(newEvents, {
        root: document.getElementById("player")
      });
      setTotalTime(r.getMetaData().totalTime);
      setReplayer(r);
    }
  }, [data]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <BeatLoader />
      </div>
    );
  }
  if (error) {
    return <p>{error.toString()}</p>;
  }
  return (
    <div className={styles.playerBody}>
      <div className={styles.playerLeftSection}>
        <div className={styles.rrwebPlayerSection}>
          <div className={styles.rrwebPlayerWrapper}>
            <div className={styles.browserHeader}>
              <WindowOptions className={styles.windowOptions} />
              <div className={styles.urlAddressBarWrapper}>
                <div className={styles.urlAddressBar}>
                  <span className={styles.urlText}>
                    {mirror && mirror.map && mirror.map[1] && mirror.map[1].URL}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.rrwebPlayerDiv} id="player" />
          </div>
        </div>
        <Slider
          onChange={e => setTime(e)}
          value={time}
          max={totalTime}
          disabled={false}
          pushable={true}
        />
        <div className={styles.toolbarSection}>
          <div
            className={styles.playSection}
            onClick={() => {
              if (paused) {
                replayer.play(time);
                setPaused(false);
              } else {
                replayer.pause();
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
                replayer.pause(newTime);
                setTime(newTime);
              } else {
                replayer.play(newTime);
                setTime(newTime);
              }
            }}
          >
            <FaUndoAlt fill="black" className={styles.undoButtonStyle} />
          </div>
          <div className={styles.timeSection}>
            {millisToMinutesAndSeconds(time)}
          </div>
        </div>
      </div>
      <div className={styles.playerRightSection}>
        <EventStream
          replayer={replayer}
          events={data.events}
          visitLocationDetails={data.visitLocationDetails}
          time={time}
        />
      </div>
    </div>
  );
};

const isClick = e => {
  return e.type === 3 && e.data.type === 2;
};

const EventStream = props => {
  const { replayer, events, time, visitLocationDetails } = props;
  const [currClick, setCurrClick] = useState(-1);
  useEffect(() => {
    replayer &&
      replayer.on("event-cast", e => {
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
  const startDate = new Date(events[0].timestamp);
  return (
    <>
      <div className={styles.locationBox}>
        {visitLocationDetails && (
          <div className={styles.innerLocationBox}>
            <div style={{ color: "black" }}>
              {visitLocationDetails.city}, {visitLocationDetails.postal},{" "}
              {visitLocationDetails.country_name}
            </div>
            <div style={{ color: "black" }}>{startDate.toUTCString()}</div>
            {visitLocationDetails.browser && (
              <div style={{ color: "black" }}>
                {visitLocationDetails.browser.os},
                {visitLocationDetails.browser.name} &nbsp;-&nbsp;
                {visitLocationDetails.browser.version}
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
            if (!isClick(e)) return;
            let clickStr =
              mirror.map[e.data.id] && mirror.map[e.data.id].localName;
            let timeSinceStart = e.timestamp - replayer.getMetaData().startTime;
            return (
              <Element name={i.toString()} key={i.toString()}>
                <div
                  className={styles.streamElement}
                  style={{
                    backgroundColor: currClick === i && "#F2EDFF"
                  }}
                  key={i}
                  id={i}
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

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

const App = props => {
  return (
    <Router>
      <Route path="/:vid">
        <div
          style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Header />
          <div className={styles.appBody}>
            <AppInternal />
          </div>
        </div>
      </Route>
    </Router>
  );
};

const Header = props => {
  return (
    <div className={styles.header}>
      <div className={styles.logoWrapper}>
        <JourneyLogo className={styles.logo} />
      </div>
    </div>
  );
};

export default App;
