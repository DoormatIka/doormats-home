/**
    * Loads file into text.
    * @param {string} path
    */
export function loadFile(path: string): Promise<any>;
/**
    * @callback RouteFunction
    * @param {Element} el
    * @param {string[]} params
    * @returns {Promise<any>}
    */
/**
    * @callback OnJoinFunction
    * @returns {Promise<() => Promise<void>>}
    */
/**
    * The router that handles hash-based routes.
    * ```js
    * const router = new HashRouter();
    * router.add("/route", (shellHTML, params) => {
        shellHTML.innerHTML = "<h1>Hello!</h1>"
    * ])
    * ```
    * `shell` - the developer can inject HTML in.
    * `params` - extra parameters from the route
    * Note: Any hash gets intercepted by this router, please use with caution.
    *
    * Special routes: `index` for the root route. `notFound` for an unknown route.
    */
export class HashRouter {
    /**
        * The hash to be used in the website.
        * @type {string}
        */
    _hash: string;
    /**
        *
        * @type {{ [key: string]: RouteFunction }}
        */
    _routes: {
        [key: string]: RouteFunction;
    };
    /**
        *
        * @type {Array<() => Promise<void>>}
        */
    _previousPageCleanupFunction: Array<() => Promise<void>>;
    /**
        * @param {string} route - The route of the website.
        * @param {RouteFunction} fn - Runs this function when it's on route.
        */
    add(route: string, fn: RouteFunction): this;
    activate(): void;
    _onHashChange(): Promise<string>;
    /**
        * @param {string} path
        */
    set(path: string): void;
}
export type RouteFunction = (el: Element, params: string[]) => Promise<any>;
export type OnJoinFunction = () => Promise<() => Promise<void>>;
//# sourceMappingURL=router.d.ts.map