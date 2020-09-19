import React, { Component, Fragment, useContext } from "react";
import { connect } from "react-redux";

import { Container, Row, Col, Form } from "react-bootstrap";

import config from "../../config/config";
import * as CS from "../../constants";

import coreApi from "../../apis/coreApi";
import { createNotif } from "../../actions/notificationCreator";
import { createRescore } from "../../actions/rescoreCreator";

import SettingsContext from "../../contexts/settingsContext";

class Autocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: props.isAcOpen,
      userInput: "",
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
    console.debug(`=> getAutocompleteSuggestions: prefix ${prefix}`);

    this.currToHandle = null;

    let response = null;

    try {
      console.debug(
        "=> getAutocompleteSuggestions: GET request to '/get_autocomplete_results'"
      );
      response = await coreApi.get("/get_autocomplete_results", {
        params: { queryValue: prefix },
      });
    } catch (e) {
      console.log(e);
      this.props.createNotif(
        settings,
        CS.GLOB_NOTIF_ERR,
        "Core request to '/get_autocomplete_results' failed!",
        e.message,
        5000
      );
      return;
    }

    console.debug("=> getAutocompleteSuggestions: Got response:", response);

    const suggestions = response.data;
    console.debug("=> getAutocompleteSuggestions: suggestions:", suggestions);

    this.setState({ ...this.state, filteredSuggestions: suggestions });
  }

  onChangeHandler(settings, e) {
    const userInput = e.currentTarget.value;

    const currentWord = userInput.split(" ").slice(-1)[0];

    if (this.currToHandle !== null) {
      clearTimeout(this.currToHandle);
    }

    this.currToHandle = setTimeout(
      () => this.getAutocompleteSuggestions(this.context, currentWord),
      settings.coreSettings.ui.textSearch.autocompleteDelay
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

    console.info(
      `=> onKeyDownHandler: Selecting suggestion ${activeSuggestion}`
    );

    if (suggestionIndex >= filteredSuggestions.length) {
      return;
    }

    let inputPrefix = userInput.split(" ").slice(0, -1).join(" ");
    if (inputPrefix !== "") {
      inputPrefix += " ";
    }

    this.setState({
      activeSuggestion: 0,
      showSuggestions: false,
      userInput: `${inputPrefix}${filteredSuggestions[suggestionIndex].wordString} `,
      currentWord: "",
    });
    this.props.setIsAcOpen(false);
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
            config.frameGrid.defaultSecondaryRescoreDisplay
          );
        } else {
          this.props.createRescore(
            settings,
            config.frameGrid.defaultRescoreDisplay
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

    console.debug("=> onBlurHandler: Hiding suggestions...");
    this.setState({ ...this.state, showSuggestions: false });
    this.props.setIsAcOpen(false);
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

    return (
      <Fragment>
        <div
          className="text-search-input"
          id="textQuery0"
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
  return {};
};

const actionCreators = {
  createNotif,
  createRescore,
};

export default connect(stateToProps, actionCreators)(Autocomplete);
