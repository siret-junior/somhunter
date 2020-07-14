
/* This file is part of SOMHunter.
 *
 * Copyright (C) 2020 František Mejzlík <frankmejzlik@gmail.com>
 *                    Mirek Kratochvil <exa.exa@gmail.com>
 *                    Patrik Veselý <prtrikvesely@gmail.com>
 *
 * SOMHunter is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 2 of the License, or (at your option)
 * any later version.
 *
 * SOMHunter is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * SOMHunter. If not, see <https://www.gnu.org/licenses/>.
 */
const { resetSearchSession } = require("../endpoints");

exports.Construct = function () {
  return {
    textQueries: {
      q0: { value: "" },
      q1: { value: "" },
    },
    frameContext: {
      frameId: null,
      frames: [],
    },
    screen: null,
  };
};

exports.setTextQueries = function (state, q0, q1) {
  state.textQueries.q0.value = q0;
  state.textQueries.q1.value = q1;
};

exports.switchScreenTo = function (state, screen, frames, targetFrame) {
  state.screen = {
    type: screen,
    frames: frames,
  };
  
  state.frameContext.frameId = targetFrame;
};

exports.resetSearchSession = function (state) {
  state.textQueries = {
    q0: { value: "" },
    q1: { value: "" },
  };
  
  state.frameContext = {
    frameId: null,
    frames: [],
  };

  state.screen = null;
};

exports.getSomhunterUiState = function (state) {
  // For now it's just the whole state
  return state;
};

