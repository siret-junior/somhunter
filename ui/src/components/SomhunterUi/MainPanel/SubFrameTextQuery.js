import _ from "lodash";
import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";

import config from "../../../config/config";
import { Container, Row, Col, Form } from "react-bootstrap";
import Autocomplete from "../Autocomplete";
import { get, post } from "../../../apis/coreApi";
import { useSettings } from "../../../hooks/useSettings";

{
  /*  */
}

function getDefState() {
  let subQueries = [];
  for (let i = 0; i < 6; ++i) {
    subQueries.push({
      label: `SQ_${i}`,
      idx: i,
      value: "",
      ref: useRef(),
    });
  }

  return subQueries;
}

function toggleSubQueryTile(s, props, e) {
  const tar = e.currentTarget;

  document
    .querySelectorAll(".sub-query-tile")
    .forEach((x) => x.classList.remove("active"));

  const parEl = tar.parentElement;
  tar.classList.add("active");
}

function getJsx(s, props, state) {
  return state.map((x, i) => {
    return (
      <div
        key={i}
        className="sub-query-tile"
        onClick={(e) => toggleSubQueryTile(s, props, e)}
        data-idx={x.idx}
        title={x.value}
      >
        <span className="label">{x.value}</span>

        <div className="toggle">
          <Autocomplete
            isAcOpen={false}
            setIsAcOpen={() => null}
            inputRef={x.ref}
            triggerLogTextChange={() => null}
            onInputChange={(val, idx) => onInputChange(state, val, idx)}
            index={i}
          />
        </div>
      </div>
    );
  });
}

function onInputChange(state, val, idx) {
  const input = state[idx].ref.current;
  const tile = input.closest(".sub-query-tile");

  console.warn(input.value);

  if (input.value !== "") {
    tile.classList.add("edited");
  } else {
    tile.classList.remove("edited");
  }
}

function SubFrameTextQuery(props) {
  const s = useSettings();
  const dispatch = s.dispatch;

  const [state, setState] = useState(getDefState());

  // Fetch current query state
  useState(() => {
    /* \todo */
  }, []);

  useEffect(() => {
    const newState = state.map((x, i) => {
      if (typeof x.ref.current === "undefined") return x;

      const input = x.ref.current;
      const tile = input.closest(".sub-query-tile");

      console.warn(input.value);
      tile.classList.remove("edited");

      if (input.value !== "") {
        tile.classList.add("edited");
      }
    });
  });

  return (
    <Container className="sub-frame-text-query-cont">
      {getJsx(s, props, state)}
    </Container>
  );
}

const stateToProps = (state) => {
  return {};
};

export default connect(stateToProps)(SubFrameTextQuery);
