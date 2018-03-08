import React, { Component } from "react";
import { createMonitor } from "redux-dispatch-monitor";
import PropTypes from "prop-types";
import { Provider } from "react-redux";

export default (store, monitor) => (comp) => {
    return class ReduxWrappedComponent extends Component {
        constructor(props, context) {
            super(props, context);
            this.store = store;
            this.monitor = monitor;
        }

        static childContextTypes = {
            monitor: PropTypes.shape({
                dispatch: PropTypes.func.isRequired
            })
        };

        getChildContext = () => {
            return { monitor: { dispatch: this.monitor.dispatch } };
        }

        render() {
            return (
                <Provider store={this.store}>
                    {comp}
                </Provider>
            );
        }
    };
};
