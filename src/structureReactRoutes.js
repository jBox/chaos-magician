import matchRoutes from "./matchRoutes";

const ROUTE_PROPS = ["path", "exact", "strict", "location", "authorize", "component", "render", "children"];

const refineRoute = (route, targets) => {
    const { routes: subRoutes } = route;

    // refine sub routes
    const routes = [];
    if (subRoutes && subRoutes.length > 0) {
        const sub = refineRoutes(subRoutes, targets);
        for (const s of sub) {
            routes.push(s);
        }
    }

    return ROUTE_PROPS.reduce((newRoute, key) => {
        newRoute[key] = route[key];
        return newRoute;
    }, { routes });
};

const refineRoutes = (routes, targets) => {
    return routes.map((route) => refineRoute(route, targets));
};

const structureReactRoutes = (pathname, routes) => {
    const targets = matchRoutes(pathname, routes);
    return refineRoutes(routes, targets)
};


export default structureReactRoutes;