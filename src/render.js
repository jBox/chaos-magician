import React from "react";
import warning from "./utils/warning";
import parseUrl from "./utils/parseUrl";
import { matchPath } from "react-browser-router";
import matchRoutes from "./matchRoutes";
import createReduxStore from "./createReduxStore";
import createRouterComponent from "./createRouterComponent";
import ReactDOM from "react-dom";
import { renderToString } from "react-dom/server";
import { createMonitor } from "redux-dispatch-monitor";

const universe = typeof window !== "undefined" ? window : global;

const getInitials = () => {
    return {
        initialState: universe.__INITIAL_STATE__
    }
};

const setInitials = (initialState) => {
    return {
        __INITIAL_STATE__: initialState
    }
};

export default (routes, rootReducer, middlewares) => {
    const render = () => {
        universe.SERVER_RENDER = false;
        if (typeof location === "undefined" || typeof document === "undefined") {
            warning("Using `serverRender` instead of `render` on server end.");
        }

        const { initialState } = getInitials();
        const monitor = createMonitor();
        const store = createReduxStore(null, rootReducer, middlewares, monitor, initialState);
        for (const route of routes) {
            const id = route.id;
            const element = document.getElementById(id);
            if (element) {
                const url = parseUrl(location.href);
                const Comp = createRouterComponent({
                    url,
                    routes: route.routes,
                    store,
                    monitor,
                    initialState
                });
                ReactDOM.hydrate(<Comp />, element);
            }
        }
    };

    const serverRender = ({ url, routerContext = {}, request, preloadedState = {} } = {
        routerContext: {}, preloadedState: {}
    }) => {
        universe.SERVER_RENDER = true;
        if (!url) {
            warning("Parameter `url` cannot be null or empty.");
        }

        url = parseUrl(url);
        const { pathname } = url;
        const targets = matchRoutes(pathname, routes);
        const initialActions = targets.reduce((actions, route) => {
            let initializers = route.initializer;
            if (!Array.isArray(initializers)) {
                initializers = [initializers];
            }

            for (const initializer of initializers) {
                if (typeof initializer === "function") {
                    const preInitialized = initializer(url);
                    if (preInitialized) {
                        actions.push(preInitialized);
                    }
                } else if (initializer) {
                    actions.push(initializer);
                }
            }

            return actions;
        }, []);

        const renderComponentsToString = (routes, options, callback) => {
            const components = {};
            for (const route of routes) {
                const id = route.id;
                try {
                    const RouterComponent = createRouterComponent({ ...options, routes: route.routes });
                    components[id] = renderToString(<RouterComponent />);
                } catch (error) {
                    components[id] = `<div class="error">${error.toString()}</div>`;
                    console.error(error);
                }
            }

            callback({
                components,
                initials: setInitials(options.store.getState())
            });
        };

        const done = (callback) => {
            const monitor = createMonitor();
            createReduxStore(request, rootReducer, middlewares, monitor);
            return monitor.dispatch(...initialActions).done((initialState) => {
                const store = createReduxStore(
                    request,
                    rootReducer,
                    middlewares,
                    monitor,
                    { ...initialState, ...preloadedState });
                renderComponentsToString(routes, {
                    url,
                    request,
                    routerContext,
                    monitor,
                    store
                }, callback);
            });
        };

        return { done }
    };

    return { render, serverRender }
}