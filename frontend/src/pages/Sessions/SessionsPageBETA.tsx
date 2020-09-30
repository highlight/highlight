import React, { useRef, useState, useEffect } from "react";

import { useParams, Link } from "react-router-dom";
import { useLazyQuery, gql } from "@apollo/client";
import { MillisToMinutesAndSecondsVerbose } from "../../util/time";
import { ReactComponent as PlayButton } from "../../static/play-button.svg";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useDebouncedCallback } from "use-debounce";
import {
  Value,
  OptionsFilter,
  DateOptions,
  IdentifierOptions
} from "./OptionsRender";
import { Spinner } from "../../components/Spinner/Spinner";

import AutosizeInput from "react-input-autosize";

import styles from "./SessionsPage.module.css";

type SearchParam = { key: string; current?: string; value?: Value };

export const SessionsPageBETA = () => {
  const countDebounced = useDebouncedCallback(() => {
    setCount(count => count + 10);
  }, 500);
  const mainInput = useRef<HTMLInputElement>(null);
  const [params, setParams] = useState<SearchParam[]>([]);
  const paramsRef = useRef(params);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [inputActive, setInputActive] = useState(true);
  const [count, setCount] = useState(10);
  const [activeParam, setActiveParam] = useState<number>(-1);
  const [mainInputText, setMainInputText] = useState("");
  const { organization_id } = useParams();
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(true);
  const [getSessions, { loading, error, data }] = useLazyQuery<
    { sessions: any[] },
    { count: number; organization_id: number; params: SearchParam[] }
  >(
    gql`
      query GetSessions($organization_id: ID!, $count: Int!, $params: [Any]) {
        sessions(
          organization_id: $organization_id
          count: $count
          params: $params
        ) {
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
    const same = data?.sessions.length === sessionData.length;
    if (same) {
      setSessionsLoading(false);
    }
    if (!loading) {
      setSessionData(data?.sessions ?? []);
    }
  }, [sessionData, data, loading]);

  useEffect(() => {
    document.addEventListener("scroll", (e: any) => {
      var refHeight = resultsRef?.current?.getBoundingClientRect().bottom;
      const innerHeight = window?.innerHeight;
      if (!refHeight) {
        refHeight = 0;
      }
      const diff = Math.abs(refHeight - innerHeight);
      if (diff < 300) {
        countDebounced.callback();
      }
    });
    return () => {
      document.removeEventListener("scroll", e => console.log(e));
    };
  }, [countDebounced]);

  useEffect(() => {
    paramsRef.current = params;
    if (
      paramsRef.current.filter(p => p.value?.value).length === params.length
    ) {
      getSessions({
        variables: {
          organization_id: organization_id,
          params: paramsRef.current,
          count: count
        }
      });
    }
  }, [count, params, getSessions, organization_id]);

  if (error) {
    return <p>{error.toString()}</p>;
  }
  return (
    <div className={styles.setupWrapper}>
      <div className={styles.sessionsSection}>
        <div className={styles.sessionsHeader}>Session Playlist</div>
        <div className={styles.searchBar}>
          <div className={styles.searchInputSection}>
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
            <div className={styles.mainInputDiv}>
            <input
              placeholder={"Type or select a query below..."}
              ref={mainInput}
              value={mainInputText}
              onChange={e => setMainInputText(e.target.value)}
              onFocus={() => setInputActive(true)}
              autoFocus
              className={styles.searchInput}
            />
            </div>
          </div>
          <div className={styles.searchIconWrapper}>
            <FaSearch className={styles.searchIcon} />
          </div>
        </div>
        {inputActive && (
          <div className={styles.dropdown}>
            {activeParam === -1 ? (
              <OptionsFilter
                input={mainInputText}
                obj={[
                  {
                    action: "last",
                    description: "time duration (e.g. 24 days)"
                  },
                  {
                    action: "more than",
                    description: "time duration (e.g. 20 minutes)"
                  },
                  {
                    action: "less than",
                    description: "time duration (e.g. 1 hour)"
                  },
                  {
                    action: "identifier",
                    description: "identifier (e.g. email@email.com)"
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
            ) : params[activeParam]?.key === "identifier" ? (
              <IdentifierOptions
                defaultText={"Enter a time duration (e.g. 24 days, 2 minutes)"}
                input={params[activeParam].current ?? ""}
                onSelect={(option: Value) => {
                  console.log(option);
                  if (!option) return;
                  var pcopy = [...paramsRef.current];
                  pcopy[activeParam].value = option;
                  mainInput.current?.focus();
                  setActiveParam(-1);
                  setParams(pcopy);
                }}
              />
            ) : (
              <DateOptions
                defaultText={"Enter a time duration (e.g. 24 days, 2 minutes)"}
                input={params[activeParam].current ?? ""}
                onSelect={(option: Value) => {
                  if (!option) return;
                  var pcopy = [...paramsRef.current];
                  pcopy[activeParam].value = option;
                  mainInput.current?.focus();
                  setActiveParam(-1);
                  setParams(pcopy);
                }}
              />
            )}
          </div>
        )}
        <div ref={resultsRef}>
          {sessionData.map(u => {
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
              <Link to={`/${organization_id}/sessions/${u.id}`} key={u.id}>
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
          })}
          {sessionsLoading && (
            <div className={styles.loadingDiv}>
              <Spinner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
