import _ from "lodash";
import React, { useState, useRef, useEffect, ReactNode } from "react";
import { connect } from "react-redux";
import Draggable, { DraggableCore } from "react-draggable";
import { BiText } from "react-icons/bi";

import { StoreState } from "../../../reducers/index";
import { SettingsState } from "../../../reducers/settingsReducer";
import { useSettings } from "../../../hooks/useSettings";

import Autocomplete from "../Autocomplete";
import { Vec2 } from "../../../../types/coreApi";

type Props = {
  w: number;
  h: number;

  index: number;
  inputRef: React.RefObject<any>;
  subInputsRef: React.RefObject<any>;

  setIsAcOpen: (val: boolean) => void;
  triggerLogTextChange: () => void;
};

type Query = {
  value: string;
  pos: Vec2;
};

type State = {
  queries: Query[];
  setQueries: React.Dispatch<React.SetStateAction<Query[]>>;
};

function addQueryHandler(s: SettingsState, props: Props, state: State, e: any) {
  const tarEl = e.currentTarget;

  const parRect = tarEl.getBoundingClientRect();

  const tarW = tarEl.clientWidth;
  const tarH = tarEl.clientHeight;

  const x = (e.clientX - parRect.left) / tarW;
  const y = (e.clientY - parRect.top) / tarH;

  const q: Query = {
    value: "",
    pos: { x, y },
  };
  const newQs = [...state.queries, q];
  state.setQueries(newQs);
}

function toggleAoe(tarEl: any) {
  return;
  const tar = tarEl.parentNode.querySelector(".toggle");

  if (tar.style.display === "none") {
    tar.style.display = "block";
  } else {
    tar.style.display = "none";
  }
}

function getQueriesJsx(
  s: SettingsState,
  props: Props,
  state: State
): ReactNode {
  const qs = state.queries;

  const subRefs = props.subInputsRef!;

  if (typeof subRefs.current! === "undefined") return null;

  const parX = subRefs.current.clientWidth;
  const parY = subRefs.current.clientHeight;

  return qs.map((q, i) => {
    const posAbs = {
      x: q.pos.x * parX,
      y: q.pos.y * parY,
    };
    return (
      <Draggable>
        <li
          key={i}
          onClick={(e) => {
            toggleAoe(e.currentTarget);
            e.stopPropagation();
            e.preventDefault();
          }}
          className="sub-frame-query-icon"
          style={{
            position: "absolute",
            top: `${q.pos.y * 100}%`,
            left: `${q.pos.x * 100}%`,
          }}
        >
          {/* <BiText className="query-icon" /> */}
          <div className="aoe"></div>
          <div className="toggle" onClick={(e) => e.stopPropagation()}>
            <Autocomplete {...props} />
          </div>
        </li>
      </Draggable>
    );
  });
}

function SubFrameCanvas(props: Props) {
  const s: SettingsState = useSettings();

  const [queries, setQueries] = useState([] as Query[]);

  const state: State = {
    queries,
    setQueries,
  };

  console.debug("<SubFrameCanvas>: Rendering...", props);
  return (
    <div className="sub-frame-text-query-cont">
      <img className="canvas-bg" src="/assets/img/frame_grid.svg" alt="bg" />
      <ul
        ref={props.subInputsRef}
        className="sub-frame-canvas"
        onClick={(e) => addQueryHandler(s, props, state, e)}
      >
        {getQueriesJsx(s, props, state)}
      </ul>
    </div>
  );
}

const stateToProps = (_: StoreState) => {
  return {};
};

export default connect(stateToProps)(SubFrameCanvas);
