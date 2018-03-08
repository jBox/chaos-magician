import url from "url";
import qs from "qs";

export default function parseUrl(href) {
    if (typeof href === "string") {
        const q = url.parse(href);
        return {
            href,
            pathname: q.pathname,
            query: q.query ? qs.parse(q.query) : {}
        }
    }

    return url;
}