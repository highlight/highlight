import React, { useEffect, useRef, useState } from "react";
import parse from "parse-duration";
// @ts-ignore
import written from "written-number";
import fuzzy from "fuzzy";

import styles from "./SessionsPage.module.css";

export const IdentifierOptions = ({
  input,
  onSelect,
  defaultText
}: {
  input: string;
  onSelect: (option: Value) => void;
  defaultText: string;
}) => {
  const [results, setResults] = useState<fuzzy.FilterResult<Value>[]>([]);
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
        .filter<Value>(input, generateDurationObjects(), {
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
              onClick={() => onSelect(f?.original)}
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

export const DateOptions = ({
  input,
  onSelect,
  defaultText
}: {
  input: string;
  onSelect: (option: Value) => void;
  defaultText: string;
}) => {
  const [results, setResults] = useState<fuzzy.FilterResult<Value>[]>([]);
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
        .filter<Value>(input, generateDurationObjects(), {
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
              onClick={() => onSelect(f?.original)}
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

export const OptionsFilter = ({
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
  }, [input, obj]);

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

const generateDurationObjects = (): Value[] => {
  const units = [
    { unit: "day", count: 31 },
    { unit: "minute", count: 60 },
    { unit: "second", count: 60 },
    { unit: "hour", count: 24 },
    { unit: "month", count: 12 }
  ];
  return units.flatMap(u => generateUnitOptions(u));
};

const generateUnitOptions = (obj: { unit: string; count: number }): Value[] => {
  var options: Value[] = [];
  for (var i = 1; i < obj.count + 1; i++) {
    var unitStr = i === 1 ? obj.unit : obj.unit + "s";
    const f = i.toString() + " " + unitStr;
    const d = parse(f);
    if (d) {
      options.push({ text: f, value: d.toString() });
      options.push({
        text: written(i) + " " + unitStr,
        value: d.toString()
      });
    }
  }
  return options;
};

// accepts a limit and incremements/decrements a count accordingly.
// onClick(i) is called with the current count as input when enter is pressed.
const useKeySelector = (l: number, onClick: (arg: any) => void): number => {
  const [index, setIndex] = useState<number>(0);
  const [limit, setLimit] = useState<number>(l);
  const indexRef = useRef(index);
  const limitRef = useRef(limit);
  useEffect(() => {
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
    document.addEventListener("keydown", onPress, false);
    return () => {
      document.removeEventListener("keydown", onPress, false);
    };
  }, [onClick]);
  useEffect(() => {
    limitRef.current = l;
    setLimit(l);
  }, [l]);
  return indexRef.current;
};

export type Value = {
  text: string;
  value: string;
};
