import React, { useRef, useState, useEffect } from "react";

// @ts-ignore
import KeyHandler, { KEYPRESS } from "react-key-handler";
import { useParams, Link } from "react-router-dom";
import { useLazyQuery, gql } from "@apollo/client";
import { useLocation } from "react-router-dom";
import { MillisToMinutesAndSecondsVerbose } from "../../util/time";
import { ReactComponent as PlayButton } from "../../static/play-button.svg";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Skeleton } from "antd";

import fuzzy from "fuzzy";
import parse from "parse-duration";
// @ts-ignore
import written from "written-number";
import AutosizeInput from "react-input-autosize";

import styles from "./SessionsPage.module.css";

type SearchParam = { key: string; current?: string; value?: Duration };
type Duration = {
  text: string;
  duration: number;
};

export const SessionsPageBETA = () => {
  const location = useLocation();
  const mainInput = useRef<HTMLInputElement>(null);
  const [params, setParams] = useState<SearchParam[]>([]);
  const paramsRef = useRef(params);
  const [inputActive, setInputActive] = useState(true);
  const [activeParam, setActiveParam] = useState<number>(-1);
  const [mainInputText, setMainInputText] = useState("");
  const { organization_id } = useParams();
  const [getSessions, { loading, error, data }] = useLazyQuery<
    { sessions: any[] },
    { organization_id: number; params: SearchParam[] }
  >(
    gql`
      query GetSessions($organization_id: ID!, $params: [Any]) {
        sessions(organization_id: $organization_id, params: $params) {
          id
          details
          user_id
          identifier
          created_at
          length
        }
      }
    `,
    {
      pollInterval: 5000
    }
  );

  useEffect(() => {
    paramsRef.current = params;
    if (
      paramsRef.current.filter(p => p.value?.duration).length == params.length
    ) {
      getSessions({
        variables: {
          organization_id: organization_id,
          params: paramsRef.current
        }
      });
    }
  }, [params]);

  if (error) {
    return <p>{error.toString()}</p>;
  }
  return (
    <div className={styles.setupWrapper}>
      <div className={styles.sessionsSection}>
        <div className={styles.sessionsHeader}>Session Playlist</div>
        <div className={styles.searchBar}>
          {params?.map((p, i) => (
            <div key={i} className={styles.optionInputWrapper}>
              <div className={styles.optionKey}>{p?.key}:</div>
              <AutosizeInput
                autoFocus
                onFocus={() => setInputActive(true)}
                className={styles.optionInput}
                autoComplete={"off"}
                name="option-input"
                value={p.value?.text || p.current}
                onChange={function (event) {
                  console.log(event);
                  var pcopy = [...params];
                  pcopy[i].current = event.target.value;
                  setActiveParam(i);
                  setParams(pcopy);
                }}
              />
              {
                <FaTimes
                  className={styles.timesIcon}
                  onClick={() => {
                    var pcopy = JSON.parse(JSON.stringify(params));
                    pcopy.splice(i, 1);
                    setParams(pcopy);
                    setActiveParam(-1);
                  }}
                />
              }
            </div>
          ))}
          <input
            placeholder={"Type or select a query below..."}
            ref={mainInput}
            value={mainInputText}
            onChange={e => setMainInputText(e.target.value)}
            onFocus={() => setInputActive(true)}
            autoFocus
            className={styles.searchInput}
          />
          <FaSearch className={styles.searchIcon} />
        </div>
        {inputActive && (
          <div className={styles.dropdown}>
            {activeParam === -1 ? (
              <OptionsFilter
                input={mainInputText}
                obj={[
                  {
                    action: "last",
                    description: "time duration (e.g. 24 days, 2 minutes)"
                  },
                  {
                    action: "more than",
                    description: "e.g. 10 hours, 2 minutes"
                  },
                  {
                    action: "less than",
                    description: "e.g. 10 hours, 2 minutes"
                  }
                ]}
                onSelect={(action: string) => {
                  if (!action) return;
                  if (paramsRef.current.filter(p => p.key === action).length)
                    return;
                  var pcopy = [...paramsRef.current, { key: action }];
                  setParams(pcopy);
                  setActiveParam(pcopy.length - 1);
                  setMainInputText("");
                }}
              />
            ) : (
              <DateOptionsRender
                defaultText={"Enter a time duration (e.g. 24 days, 2 minutes)"}
                input={params[activeParam].current ?? ""}
                onSelect={(option: Duration) => {
                  if (!option) return;
                  var pcopy = [...paramsRef.current];
                  pcopy[activeParam].value = option;
                  mainInput.current?.focus();
                  setActiveParam(-1);
                  setParams(pcopy);
                  setInputActive(false);
                }}
              />
            )}
          </div>
        )}
        {loading ? (
          <Skeleton />
        ) : (
          data?.sessions?.map(u => {
            const created = new Date(u.created_at);
            let d: {
              browser?: {
                os?: string;
                name?: string;
              };
              city?: string;
              state?: string;
              postal?: string;
            } = {};
            try {
              d = JSON.parse(u?.details);
            } catch (error) {}
            return (
              <Link to={`${location.pathname}/${u.id}`} key={u.id}>
                <div className={styles.sessionCard}>
                  <div className={styles.playButton}>
                    <PlayButton />
                  </div>
                  <div className={styles.sessionTextWrapper}>
                    <div className={styles.sessionTextSection}>
                      <div
                        className={styles.blueTitle}
                      >{`User#${u?.user_id}`}</div>
                      <div className={styles.regSubTitle}>{u?.identifier}</div>
                    </div>
                    <div className={styles.sessionTextSection}>
                      <div className={styles.blueTitle}>
                        {created.toLocaleString("en-us", {
                          day: "numeric",
                          month: "short",
                          minute: "numeric",
                          hour: "numeric"
                        })}
                      </div>
                      <div className={styles.regSubTitle}>
                        {MillisToMinutesAndSecondsVerbose(u?.length) ||
                          "30 min 20 sec"}
                      </div>
                    </div>
                    <div className={styles.sessionTextSection}>
                      <div className={styles.regTitle}>
                        {d?.browser?.os && d?.browser?.name
                          ? d?.browser?.os + " • " + d?.browser?.name
                          : "Desktop • Chrome"}
                      </div>
                      <div className={styles.regSubTitle}>
                        {d?.city}, {d?.state} {d?.postal}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

type SelectionState = {
  current: number;
  results: Array<fuzzy.FilterResult<string>>;
};

// accepts a limit and incremements/decrements a count accordingly.
// onClick(i) is called with the current count as input when enter is pressed.
const useKeySelector = (l: number, onClick: (arg: any) => void): number => {
  const [index, setIndex] = useState<number>(0);
  const [limit, setLimit] = useState<number>(l);
  const indexRef = useRef(index);
  const limitRef = useRef(limit);
  useEffect(() => {
    document.addEventListener("keydown", onPress, false);
    return () => {
      document.removeEventListener("keydown", onPress, false);
    };
  }, []);
  useEffect(() => {
    limitRef.current = l;
    setLimit(l);
  }, [l]);
  const onPress = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex(i => {
        const n = Math.max(i - 1, 0);
        indexRef.current = n;
        return n;
      });
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex(i => {
        const n = Math.min(i + 1, limitRef.current - 1);
        indexRef.current = n;
        return n;
      });
    }
    if (e.key === "Enter") {
      e.preventDefault();
      onClick(indexRef.current);
    }
  };
  return indexRef.current;
};

const DateOptionsRender = ({
  input,
  onSelect,
  defaultText
}: {
  input: string;
  onSelect: (option: Duration) => void;
  defaultText: string;
}) => {
  const [results, setResults] = useState<fuzzy.FilterResult<Duration>[]>([]);
  const resultsRef = useRef(results);
  const index = useKeySelector(results.length, (i: number) => {
    onSelect(resultsRef.current[i]?.original);
  });

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    setResults(
      fuzzy
        .filter<Duration>(input, generateDurationObjects(), {
          pre: `<strong style="color: #5629c6;">`,
          post: "</strong>",
          extract: f => f.text
        })
        .slice(0, 5)
    );
  }, [input]);

  return (
    <>
      {results
        .map((f, i) => {
          return (
            <div
              onSelect={() => onSelect(f?.original)}
              className={styles.optionsRow}
              key={i}
              style={{
                backgroundColor: i === index ? "#F2EEFB" : "transparent"
              }}
              dangerouslySetInnerHTML={{ __html: f.string }}
            />
          );
        })
        .slice(0, 5)}
    </>
  );
};

const OptionsFilter = ({
  input,
  obj,
  onSelect
}: {
  input: string;
  obj: { action: string; description: string }[];
  onSelect: (action: string) => void;
}) => {
  const [results, setResults] = useState<
    fuzzy.FilterResult<{ action: string; description: string }>[]
  >([]);
  const resultsRef = useRef(results);
  const index = useKeySelector(results.length, (i: number) => {
    onSelect(resultsRef.current[i]?.original.action);
  });

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    setResults(
      fuzzy.filter(input, obj, {
        pre: `<strong style="color: #5629c6;">`,
        post: "</strong>",
        extract: f => f.action
      })
    );
  }, [input]);

  return (
    <div className={styles.optionsSection}>
      {results?.length ? (
        results.map((f, i) => (
          <div
            key={i}
            className={styles.optionsRow}
            onClick={() => {
              onSelect(f?.original.action);
              console.log("hi");
            }}
            style={{
              backgroundColor: i === index ? "#F2EEFB" : "transparent"
            }}
          >
            <span
              className={styles.optionsKey}
              dangerouslySetInnerHTML={{ __html: f.string }}
            />
            : &nbsp;
            <span className={styles.optionsValue}>
              {f.original.description}
            </span>
          </div>
        ))
      ) : (
        <></>
      )}
    </div>
  );
};

const generateDurationObjects = (): Duration[] => {
  const units = [
    { unit: "day", count: 31 },
    { unit: "minute", count: 60 },
    { unit: "second", count: 60 },
    { unit: "hour", count: 24 },
    { unit: "month", count: 12 }
  ];
  return units.flatMap(u => generateUnitOptions(u));
};

const generateUnitOptions = (obj: {
  unit: string;
  count: number;
}): Duration[] => {
  var options: Duration[] = [];
  for (var i = 1; i < obj.count + 1; i++) {
    var unitStr = i === 1 ? obj.unit : obj.unit + "s";
    const f = i.toString() + " " + unitStr;
    const d = parse(f);
    if (d) {
      options.push({ text: f, duration: d });
      options.push({ text: written(i) + " " + unitStr, duration: d });
    }
  }
  return options;
};

// Hook
function useKeyPress(targetKey: string) {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState(false);

  // If pressed key is our target key then set to true
  function downHandler({ key }: { key: string }) {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }

  // If released key is our target key then set to false
  const upHandler = ({ key }: { key: string }) => {
    if (key === targetKey) {
      setKeyPressed(false);
    }
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return keyPressed;
}
