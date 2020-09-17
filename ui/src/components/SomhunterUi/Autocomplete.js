import React, { Component, Fragment } from "react";
import { connect } from "react-redux";

import { Container, Row, Col, Form } from "react-bootstrap";

import config from "../../config/config";
import * as CS from "../../constants";

import coreApi from "../../apis/coreApi";
import { createShowGlobalNotification } from "../../actions/notificationCreator";
import { createRescore } from "../../actions/rescoreCreator";

class Autocomplete extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
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

  async getAutocompleteSuggestions(prefix) {
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
      this.props.createShowGlobalNotification(
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

  onChangeHandler(e) {
    const userInput = e.currentTarget.value;

    const currentWord = userInput.split(" ").slice(-1)[0];

    if (this.currToHandle !== null) {
      clearTimeout(this.currToHandle);
    }
    this.currToHandle = setTimeout(
      () => this.getAutocompleteSuggestions(currentWord),
      config.textSearchPanel.autocompleteDelay
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
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: e.currentTarget.innerText,
    });

    this.props.setIsAcOpen(false);
  }

  onKeyDownHandler(e) {
    const { activeSuggestion, filteredSuggestions } = this.state;
    const userInput = this.state.userInput;

    // Key: "ENTER"
    if (e.keyCode === 13) {
      if (filteredSuggestions.length <= activeSuggestion) return;

      if (!this.state.showSuggestions) {
        if (e.shiftKey) {
          this.props.createRescore(
            config.frameGrid.defaultSecondaryRescoreDisplay
          );
        } else {
          this.props.createRescore(config.frameGrid.defaultRescoreDisplay);
        }
        return;
      }

      console.warn(
        `=> onKeyDownHandler: Selecting suggestion ${activeSuggestion}`
      );
      const inputPrefix = userInput.split(" ").slice(0, -1).join(" ");

      this.setState({
        activeSuggestion: 0,
        showSuggestions: false,
        userInput: `${inputPrefix} ${filteredSuggestions[activeSuggestion].wordString} `,
        currentWord: "",
      });

      this.props.setIsAcOpen(false);
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
                  className={className}
                  key={`suggestion_${suggestion.id}`}
                  data-synset-id={suggestion.id}
                  onClick={() => onClickHandler}
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
        <div className="text-search-input" id="textQuery0">
          <Form.Control
            ref={this.props.inputRef}
            type="text"
            onChange={onChangeHandler}
            onKeyDown={onKeyDownHandler}
            value={userInput}
          />
          {suggestionsListComponent}
        </div>
      </Fragment>
    );
  }
}

const stateToProps = (state) => {
  return {};
};

const actionCreators = {
  createShowGlobalNotification,
  createRescore,
};

export default connect(stateToProps, actionCreators)(Autocomplete);
