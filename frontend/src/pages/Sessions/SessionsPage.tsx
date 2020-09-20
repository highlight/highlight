import React, { useRef, useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";
import { useLazyQuery, gql } from "@apollo/client";
import { useLocation } from "react-router-dom";
import { MillisToMinutesAndSecondsVerbose } from "../../util/time";
import { ReactComponent as PlayButton } from "../../static/play-button.svg";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Skeleton } from "antd";
import fuzzy from "fuzzy";
// @ts-ignore
import written from "written-number";

import * as chrono from "chrono-node";
import parse from "parse-duration";
import AutosizeInput from "react-input-autosize";

import styles from "./SessionsPage.module.css";

export const SessionsPage = () => {
  const location = useLocation();
  const mainInput = useRef<HTMLInputElement>(null);
  const [params, setParams] = useState<
    { key: string; value: string; final?: boolean }[]
  >([]);
  const [activeParam, setActiveParam] = useState<number>(-1);
  const [dateString, setDateString] = useState("");
  const { organization_id } = useParams();
  const [getSessions, { loading, error, data }] = useLazyQuery<
    { sessions: any[] },
    { organization_id: number }
  >(
    gql`
      query GetSessions($organization_id: ID!) {
        sessions(organization_id: $organization_id) {
          id
          details
          user_id
          identifier
          created_at
          length
        }
      }
    `,
    { variables: { organization_id: organization_id }, pollInterval: 5000 }
  );

  if (error) {
    return <p>{error.toString()}</p>;
  }
  const renderResults = (s: string) => {
    chrono.parseDate(s)?.toString();
    setDateString(s);
  };

  return (
    <div className={styles.setupWrapper}>
      <div className={styles.sessionsSection}>
        <div className={styles.sessionsHeader}>Session Playlist</div>
        <div className={styles.searchBar}>
          {params.map((p, i) => (
            <div className={styles.optionInputWrapper}>
              <div className={styles.optionKey}>{p?.key}:</div>
              <AutosizeInput
                autoFocus
                className={styles.optionInput}
                name="option-input"
                value={p.value}
                onChange={function (event) {
                  var pcopy = JSON.parse(JSON.stringify(params));
                  pcopy[i].value = event.target.value;
                  pcopy[i].final = false;
                  setActiveParam(i);
                  setParams(pcopy);
                }}
              />
              {p.final && (
                <FaTimes
                  className={styles.timesIcon}
                  onClick={() => {
                    var pcopy = JSON.parse(JSON.stringify(params));
                    pcopy.splice(i, 1);
                    setParams(pcopy);
                    setActiveParam(-1);
                  }}
                />
              )}
            </div>
          ))}
          <input
            placeholder={"Type or select a query below..."}
            ref={mainInput}
            autoFocus
            onFocus={() => {
              renderResults("");
            }}
            onChange={e => {
              renderResults(e.target.value);
            }}
            className={styles.searchInput}
          />
          <FaSearch className={styles.searchIcon} />
        </div>
        <div className={styles.dropdown}>
          {activeParam === -1 ? (
            <>
              <OptionsFilter
                title="DATES"
                input={mainInput.current?.value ?? ""}
                obj={[
                  {
                    action: "last",
                    description: "time duration (e.g. 24 days, 2 minutes)"
                  }
                ]}
                onClick={(action: string) => {
                  var pcopy = JSON.parse(JSON.stringify(params));
                  pcopy.push({ key: action });
                  setParams(pcopy);
                  setActiveParam(pcopy.length - 1);
                }}
              />
              <OptionsFilter
                title="DURATION"
                input={mainInput.current?.value ?? ""}
                obj={[
                  {
                    action: "more than",
                    description: "e.g. 10 hours, 2 minutes"
                  },
                  {
                    action: "less than",
                    description: "e.g. 10 hours, 2 minutes"
                  }
                ]}
                onClick={(action: string) => {
                  var pcopy = JSON.parse(JSON.stringify(params));
                  pcopy.push({ key: action });
                  setParams(pcopy);
                  setActiveParam(pcopy.length - 1);
                }}
              />
            </>
          ) : (
            <>
              {!params[activeParam]?.value ? (
                <span className={styles.optionsValue}>
                  Enter a time duration (e.g. 24 days, 2 minutes){" "}
                </span>
              ) : (
                <div>
                  {fuzzy
                    .filter(
                      params[activeParam].value,
                      generateDurationStrings(),
                      {
                        pre: `<strong style="color: #5629c6;">`,
                        post: "</strong>"
                      }
                    )
                    .map((f, i) => {
                      console.log(parse(f.original));
                      return (
                        <div
                          onClick={() => {
                            var pcopy = JSON.parse(JSON.stringify(params));
                            pcopy[activeParam].value = f.original;
                            pcopy[activeParam].final = true;
                            mainInput.current?.focus();
                            setActiveParam(-1);
                            setParams(pcopy);
                          }}
                          className={styles.optionsRow}
                          key={i}
                          dangerouslySetInnerHTML={{ __html: f.string }}
                        />
                      );
                    })
                    .slice(0, 5)}
                </div>
              )}
            </>
          )}
        </div>
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

const OptionsFilter = ({
  input,
  obj,
  onClick,
  title
}: {
  input: string;
  obj: { action: string; description: string }[];
  onClick: (action: string) => void;
  title: string;
}) => {
  const res = fuzzy.filter(input, obj, {
    pre: `<strong style="color: #5629c6;">`,
    post: "</strong>",
    extract: f => f.action
  });
  if (!res?.length) {
    return <></>;
  }
  return (
    <div className={styles.optionsSection}>
      <div className={styles.optionsTitle}>{title}</div>{" "}
      {res.map(f => (
        <div
          className={styles.optionsRow}
          onClick={() => onClick(f.original.action)}
        >
          <span
            className={styles.optionsKey}
            dangerouslySetInnerHTML={{ __html: f.string }}
          />
          : &nbsp;
          <span className={styles.optionsValue}>{f.original.description}</span>
        </div>
      ))}
    </div>
  );
};

const generateDurationStrings = (): string[] => {
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
}): string[] => {
  var options: string[] = [];
  for (var i = 1; i < obj.count + 1; i++) {
    var unitStr = i === 1 ? obj.unit : obj.unit + "s";
    options.push(i.toString() + " " + unitStr);
  }
  return options;
};
