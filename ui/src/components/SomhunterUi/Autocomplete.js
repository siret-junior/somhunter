import React, { Component, Fragment, useContext } from "react";
import { connect } from "react-redux";

import { Container, Row, Col, Form } from "react-bootstrap";

// *** Config generated by the Core API ***
import config from "../../__config_generated__.json";
// *** Config generated by the Core API ***

import * as CS from "../../constants";

import coreApi from "../../apis/coreApi";
import { get, post } from "../../apis/coreApi";
import { crNotif } from "../../actions/notificationCreator";
import { createRescore } from "../../actions/rescoreCreator";

import SettingsContext from "../../contexts/settingsContext";

class Autocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: props.search.textQueries[props.index],
      currentWord: "",
    };

    this.currToHandle = null;

    // Bind this to the methods
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onClickHandler = this.onClickHandler.bind(this);
    this.onKeyDownHandler = this.onKeyDownHandler.bind(this);
    this.getAutocompleteSuggestions = this.getAutocompleteSuggestions.bind(
      this
    );
  }

  async getAutocompleteSuggestions(settings, prefix) {
    this.currToHandle = null;

    let response = null;

    try {
      response = await coreApi.get("/get_autocomplete_results", {
        params: { queryValue: prefix },
      });
    } catch (e) {
      this.props.crNotif(
        settings,
        CS.GLOB_NOTIF_ERR,
        "Core request to '/get_autocomplete_results' failed!",
        e.message,
        5000
      );
      return;
    }

    const suggestions = response.data;
    this.setState({ ...this.state, filteredSuggestions: suggestions });
  }

  onChangeHandler(settings, e) {
    // Trigger log system
    this.props.triggerLogTextChange();

    const userInput = e.currentTarget.value;
    const currentWord = userInput.split(" ").slice(-1)[0];

    // Trigger subquery tile
    if (typeof this.props.onInputChange !== "undefined") {
      this.props.onInputChange(userInput, this.props.index);
    }

    if (this.currToHandle !== null) {
      clearTimeout(this.currToHandle);
    }

    this.currToHandle = setTimeout(
      () => this.getAutocompleteSuggestions(this.context, currentWord),
      config.ui.textSearch.autocompleteDelay
    );

    this.setState({
      activeSuggestion: 0,
      filteredSuggestions: this.state.filteredSuggestions,
      showSuggestions: true,
      userInput,
      currentWord: currentWord,
    });

    this.props.setIsAcOpen(true);
  }

  onClickHandler(e) {
    const tarElIndex = e.currentTarget.dataset.index;
    this.selectSuggestion(tarElIndex);
  }

  selectSuggestion(idx) {
    const { activeSuggestion, filteredSuggestions } = this.state;
    const userInput = this.state.userInput;

    let suggestionIndex = idx;
    if (idx === null) {
      suggestionIndex = activeSuggestion;
    }

    if (suggestionIndex >= filteredSuggestions.length) {
      return;
    }

    let inputPrefix = userInput.split(" ").slice(0, -1).join(" ");
    if (inputPrefix !== "") {
      inputPrefix += " ";
    }
    const newUserInput = `${inputPrefix}${filteredSuggestions[suggestionIndex].wordString} `;
    this.setState({
      activeSuggestion: 0,
      showSuggestions: false,
      userInput: newUserInput,
      currentWord: "",
    });
    this.props.setIsAcOpen(false);

    // Trigger log system
    this.props.inputRef.current.value = newUserInput;
    this.props.triggerLogTextChange();
  }

  onKeyDownHandler(settings, e) {
    const { activeSuggestion, filteredSuggestions } = this.state;
    const userInput = this.state.userInput;

    // Key: "ENTER"
    if (e.keyCode === 13) {
      if (filteredSuggestions.length <= activeSuggestion) return;

      // If suggestions not open => RESCORE
      if (!this.state.showSuggestions) {
        if (e.shiftKey) {
          this.props.createRescore(
            settings,
            config.ui.frameGrid.defaultSecondaryRescoreDisplay
          );
        } else {
          this.props.createRescore(
            settings,
            config.ui.frameGrid.defaultRescoreDisplay
          );
        }
        return;
      }

      this.selectSuggestion(null);
    }
    // Key: "ARROW UP"
    else if (e.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }

      this.setState({ activeSuggestion: activeSuggestion - 1 });
    }
    // Key: "ARROW DOWN"
    else if (e.keyCode === 40) {
      if (activeSuggestion - 1 === filteredSuggestions.length) {
        return;
      }

      this.setState({ activeSuggestion: activeSuggestion + 1 });
    }
  }

  onBlurHandler(e) {
    const relTar = e.relatedTarget;

    // If suggestion click
    if (relTar != null && typeof relTar.dataset.index !== "undefined") {
      return;
    }

    this.setState({ ...this.state, showSuggestions: false });
    this.props.setIsAcOpen(false);
  }

  componentDidUpdate(prevProps, prevState) {
    const prev = prevProps.search.textQueries[this.props.index];
    const curr = this.props.search.textQueries[this.props.index];
    if (prev !== curr) {
      this.setState({ ...this.state, userInput: curr });
    }
  }

  render() {
    const {
      onChangeHandler,
      onClickHandler,
      onKeyDownHandler,
      state: {
        activeSuggestion,
        filteredSuggestions,
        showSuggestions,
        userInput,
        currentWord,
      },
    } = this;

    const settings = this.context;

    let suggestionsListComponent;

    if (showSuggestions && userInput) {
      if (filteredSuggestions.length) {
        suggestionsListComponent = (
          <ul className="suggestions">
            {filteredSuggestions.map((suggestion, index) => {
              let className = "autocomplete-suggestion ";

              // Flag the active suggestion with a class
              if (index === activeSuggestion) {
                className += "active";
              }

              let exampleImagesElems = suggestion.exampleFrames.map(
                (frame, i) => <img key={`ei_${i}`} src={frame} alt="Example." />
              );

              return (
                <li
                  tabIndex="-1"
                  data-index={index}
                  className={className}
                  key={`suggestion_${suggestion.id}`}
                  data-synset-id={suggestion.id}
                  onClick={(e) => {
                    onClickHandler(e);
                  }}
                >
                  <h4 className="keyword">{suggestion.wordString}</h4>
                  <p className="description">{suggestion.description}</p>
                  <ul className="example-images">{exampleImagesElems}</ul>
                </li>
              );
            })}
          </ul>
        );
      } else {
        suggestionsListComponent = null;
      }
    }
    console.debug("<Autocomplete>: Rendering...");
    return (
      <Fragment>
        <div
          className="text-search-input"
          id={`textQuery${this.props.index}`}
          onBlur={(e) => this.onBlurHandler(e)}
        >
          <Form.Control
            ref={this.props.inputRef}
            type="text"
            onChange={(e) => onChangeHandler(settings, e)}
            onKeyDown={(e) => onKeyDownHandler(settings, e)}
            value={userInput}
          />
          {suggestionsListComponent}
        </div>
      </Fragment>
    );
  }
}
Autocomplete.contextType = SettingsContext;

const stateToProps = (state) => {
  return { search: state.search };
};

const actionCreators = {
  crNotif,
  createRescore,
};

export default connect(stateToProps, actionCreators)(Autocomplete);
