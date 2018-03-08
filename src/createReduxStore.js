import { createStore, compose } from "redux";
import applyMiddleware from "./redux/applyMiddleware";
import { createLogger } from "redux-logger";

const PROD = (process.env.NODE_ENV === "production");
export default (request, rootReducer, middlewares, monitor, initialState) => {
    let enhancer = null;
    if (SERVER_RENDER || PROD) {
        enhancer = compose(monitor, applyMiddleware(request, ...middlewares));
    } else {
        middlewares = middlewares.concat([createLogger()]);
        if (window.devToolsExtension) {
            enhancer = compose(monitor, applyMiddleware(request, ...middlewares), window.devToolsExtension());
        } else {
            enhancer = compose(monitor, applyMiddleware(request, ...middlewares));
        }
    }

    return createStore(rootReducer, initialState, enhancer);
};
