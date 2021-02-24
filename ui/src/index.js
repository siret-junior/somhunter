import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import reducers from "./reducers";

import App from "./components/App";

import "./index.scss";
import "./collage_ui.scss";

function disableProdLogging() {
  window.console.debug = () => null;
  window.console.log = () => null;
  window.console.info = () => null;
  window.console.warn = () => null;
}

let middleware = null;

// If in "development" env
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  // Turn on browser support for dev tools extension
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  ``;

  middleware = composeEnhancers(applyMiddleware(thunk));
}
// "production" env
else {
  disableProdLogging();

  middleware = applyMiddleware(thunk);
}

// Create the Redux state store
const store = createStore(reducers, middleware);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
