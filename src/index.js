import CancelTokenSource, { cancelableFn } from "./CancelToken";
import render from "./render";

// CancelToken
export const CancelToken = { ...CancelTokenSource, cancelableFn };
export default render;