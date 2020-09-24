import _ from "lodash";
import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";

import { StoreState } from "../../../reducers/index";
import { useSettings } from "../../../hooks/useSettings";

import Autocomplete from "../Autocomplete";
import SubFrameCanvas from "./SubFrameCanvas";

type Props = {
  index: number;
  inputRef: React.Ref<HTMLInputElement>;
  subInputsRef: React.Ref<HTMLUListElement>;

  setIsAcOpen: (val: boolean) => void;
  triggerLogTextChange: () => void;
};

function TextSearchInput(props: Props) {
  const s = useSettings();

  const [state, setState] = useState(null);

  return (
    <div className="text-query">
      <Autocomplete {...props} />
      <SubFrameCanvas {...props} w={3} h={2} />
    </div>
  );
}

const stateToProps = (_: StoreState) => {
  return {};
};

export default connect(stateToProps)(TextSearchInput);
