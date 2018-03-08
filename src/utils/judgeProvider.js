export default function judgeProvider(route) {
    return route && typeof route.reducers !== "undefined";
}