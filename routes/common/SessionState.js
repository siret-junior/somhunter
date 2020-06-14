const { resetSearchSession } = require("./endpoints");

exports.Construct = function () {
  return {
    textQueries: {
      q0: { value: "" },
      q1: { value: "" },
    },
    likes: [],
    unlikes: [],
    frameContext: {
      frameId: null,
      frames: [],
    },
    screen: null,
  };
};

exports.switchScreenTo = function (state, screen, frames) {
  // Apply current likes
  for (let i = 0; i < frames.length; ++i) {
    // If UI has it liked
    if (state.likes.includes(frames[i].id)) {
      frames[i].liked = true;
    }
  }

  state.screen = {
    type: screen,
    frames: frames,
  };
};


exports.resetSearchSession = function(state) {
  state = {
    textQueries: {
      q0: { value: "" },
      q1: { value: "" },
    },
    likes: [],
    unlikes: [],
    frameContext: {
      frameId: null,
      frames: [],
    },
    screen: null,
  };
}

exports.getLikes = function (state) {
  return state.likes;
};

exports.getUnlikes = function (state) {
  return state.unlikes;
};

exports.getSomhunterUiState = function (state) {
  // For now it's just the whole state
  return state;
};

exports.likeFrame = function (state, frameId) {
  // Make sure that it's not in unliked
  // Those two sets must be disjunctive
  state.unlikes.filter((x) => x !== frameId);

  // Add it to the likes
  state.likes.push(frameId);

  // Walk all the frames and like it
  const frames = state.screen.frames;
  for (let i = 0; i < frames.length; ++i) {
    if (frames[i].id == frameId) {
      frames[i].liked = true;
    }
  }

  return true;
};

exports.unlikeFrame = function (state, frameId) {
  // Make sure it's liked in the first place
  if (state.likes.includes(frameId)) {
    state.likes.filter((x) => x !== frameId);
    state.unlikes.push(frameId);

    // Walk all the frames and unlike it
    const frames = state.screen.frames;
    for (let i = 0; i < frames.length; ++i) {
      if (frames[i].id == frameId) {
        frames[i].liked = false;
      }
    }

    return true;
  }
  return false;
};
