import React, { useState, useEffect } from "react";
import { useFetch } from "use-http";
import { Route, useParams, BrowserRouter as Router } from "react-router-dom";
import { Replayer, mirror } from "rrweb";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { FaHandPointUp } from "react-icons/fa";
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

const AppInternal = props => {
  const { vid } = useParams();
  const [replayer, setReplayer] = useState(undefined);
  const [paused, setPaused] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  const { time, start, pause, reset } = useTimer({
    interval: 50,
    step: 50
  });

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
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: 20
                }}
              >
                <div
                  style={{
                    borderRadius: 10,
                    backgroundColor: "white",
                    width: "80%",
                    height: "55%",
                    marginRight: "auto",
                    paddingLeft: 20,
                    fontSize: 14,
                    display: "grid"
                  }}
                >
                  <span style={{ marginBottom: 3, alignSelf: "end" }}>
                    {mirror && mirror.map && mirror.map[1] && mirror.map[1].URL}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.rrwebPlayerDiv} id="player" />
          </div>
        </div>
        <div className={styles.progressBar} />
        <div className={styles.toolbarSection}>
          <div className={styles.playSection}>
            {paused ? (
              <FaPlay
                fill="black"
                style={{ height: 25, width: 30 }}
                onClick={() => {
                  replayer.play();
                  start();
                  setPaused(false);
                }}
              />
            ) : (
              <FaPause
                fill="black"
                style={{ height: 25, width: 30 }}
                onClick={() => {
                  replayer.pause();
                  reset();
                  setPaused(true);
                }}
              />
            )}
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
      </div>
      <div style={{ height: "100%" }}>
        <div id="wrapper" className={styles.eventStreamContainer}>
          <div className={styles.emptyScrollDiv}></div>
          {events &&
            replayer &&
            events.map((e, i) => {
              if (!isClick(e)) return;
              let clickStr =
                mirror.map[e.data.id] && mirror.map[e.data.id].localName;
              let timeSinceStart =
                e.timestamp - replayer.getMetaData().startTime;
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
