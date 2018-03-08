import { matchPath } from "react-browser-router";

export default function matchRoutes(pathname, routes) {
    const matches = [];
    for (const route of routes) {
        if (route.id && route.routes) {
            const sub = matchRoutes(pathname, route.routes);
            for (const m of sub) {
                matches.push(m);
            }
        } else {
            const match = matchPath(pathname, route);
            if (match) {
                matches.push(route);

                // check children route
                if (route.routes && route.routes.length > 0) {
                    const sub = matchRoutes(pathname, route.routes);
                    for (const m of sub) {
                        matches.push(m);
                    }
                }
            }
        }
    }

    return matches;
}