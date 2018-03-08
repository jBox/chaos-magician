const noop = (arg) => (arg);

export const cancelableFn = (cancelable, fn = noop) => (...args) => {
    if (!cancelable.canceled) {
        try {
            fn(...args);
        } catch (exception) {
            console.error(exception);
        }
    }
};


const g = typeof window !== "undefined" ? window : global;
if (!g.__cancel_token_sources__) {
    g.__cancel_token_sources__ = [];
}

export default {
    source: (id) => {
        if (typeof id === "number") {
            return g.__cancel_token_sources__[id];
        }

        const s = {};
        s.token = new Promise((resolve, reject) => {
            s.cancel = (reason) => reject(reason);
        });

        s.id = g.__cancel_token_sources__.length;
        g.__cancel_token_sources__[s.id] = s;
        return s;
    },
    release: (source) => {
        if (typeof source === "object") {
            source = source.id;
        }

        if (typeof source === "number") {
            return g.__cancel_token_sources__[source] = null;
        }
    }
};
