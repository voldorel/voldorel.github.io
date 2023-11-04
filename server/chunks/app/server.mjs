import { version, h, getCurrentInstance, inject, onUnmounted, shallowRef, ref, computed, useSSRContext, watch, Fragment, readonly, mergeProps, hasInjectionContext, onMounted, nextTick, createApp, withAsyncContext, unref, withCtx, createTextVNode, toDisplayString as toDisplayString$1, reactive, effectScope, isRef, isReactive, toRaw, watchEffect, getCurrentScope, onScopeDispose, toRef, onServerPrefetch, createVNode, Text, provide, onErrorCaptured, resolveDynamicComponent, shallowReactive, isReadonly, toRefs, markRaw, defineComponent, resolveComponent, defineAsyncComponent, isShallow, openBlock, createElementBlock, renderSlot, createElementVNode, resolveDirective, withDirectives, normalizeClass, createBlock, createCommentVNode, Suspense, Transition } from 'vue';
import { $fetch } from 'ofetch';
import { getContext, executeAsync } from 'unctx';
import { createMemoryHistory, createRouter, START_LOCATION, useRoute as useRoute$1, RouterView } from 'vue-router';
import { createError as createError$1, setCookie, getCookie, deleteCookie, sanitizeStatusCode } from 'h3';
import { createHooks } from 'hookable';
import destr from 'destr';
import { renderSSRHead } from '@unhead/ssr';
import VueCookies from 'vue-cookies';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrRenderClass, ssrRenderStyle, ssrRenderAttr, ssrRenderSlot, ssrRenderSuspense, ssrRenderVNode } from 'vue/server-renderer';
import { defu } from 'defu';
import axios from 'axios';
import { Icon } from '@iconify/vue';
import { hash, isEqual } from 'ohash';
import { CompileErrorCodes, createCompileError } from '@intlify/message-compiler';
import { parse as parse$1 } from 'cookie-es';
import { hasProtocol, parseURL, parseQuery, withQuery, joinURL, withTrailingSlash, withoutTrailingSlash } from 'ufo';
import { composableNames, getActiveHead, createServerHead as createServerHead$1 } from 'unhead';
import { defineHeadPlugin } from '@unhead/shared';
import { a as useRuntimeConfig$1 } from '../nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'node:http';
import 'node:https';
import 'unenv/runtime/fetch/index';
import 'scule';
import 'klona';
import 'unstorage';
import 'radix3';
import 'node:fs';
import 'node:url';
import 'pathe';
import 'http-graceful-shutdown';

const appConfig = useRuntimeConfig$1().app;
const baseURL = () => appConfig.baseURL;
const nuxtAppCtx = /* @__PURE__ */ getContext("nuxt-app");
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.6.5";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: reactive({
      data: {},
      state: {},
      _errors: {},
      ...{ serverRendered: true }
    }),
    static: {
      data: {}
    },
    runWithContext: (fn) => callWithNuxt(nuxtApp, fn),
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: {},
    _payloadRevivers: {},
    ...options
  };
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    async function contextCaller(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    }
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  {
    if (nuxtApp.ssrContext) {
      nuxtApp.ssrContext.nuxt = nuxtApp;
      nuxtApp.ssrContext._payloadReducers = {};
      nuxtApp.payload.path = nuxtApp.ssrContext.url;
    }
    nuxtApp.ssrContext = nuxtApp.ssrContext || {};
    if (nuxtApp.ssrContext.payload) {
      Object.assign(nuxtApp.payload, nuxtApp.ssrContext.payload);
    }
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: options.ssrContext.runtimeConfig.public,
      app: options.ssrContext.runtimeConfig.app
    };
  }
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
async function applyPlugin(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
  if (typeof plugin2 === "function") {
    const { provide: provide4 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide4 && typeof provide4 === "object") {
      for (const key in provide4) {
        nuxtApp.provide(key, provide4[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const parallels = [];
  const errors = [];
  for (const plugin2 of plugins2) {
    const promise = applyPlugin(nuxtApp, plugin2);
    if (plugin2.parallel) {
      parallels.push(promise.catch((e) => errors.push(e)));
    } else {
      await promise;
    }
  }
  await Promise.all(parallels);
  if (errors.length) {
    throw errors[0];
  }
}
/*! @__NO_SIDE_EFFECTS__ */
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => args ? setup(...args) : setup();
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
/*! @__NO_SIDE_EFFECTS__ */
function useNuxtApp() {
  var _a;
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = (_a = getCurrentInstance()) == null ? void 0 : _a.appContext.app.$nuxt;
  }
  nuxtAppInstance = nuxtAppInstance || nuxtAppCtx.tryUse();
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
/*! @__NO_SIDE_EFFECTS__ */
function useRuntimeConfig() {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxt = useNuxtApp();
  const state = toRef(nuxt.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxt.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const LayoutMetaSymbol = Symbol("layout-meta");
const PageRouteSymbol = Symbol("route");
const useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
/*! @__NO_SIDE_EFFECTS__ */
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
};
const navigateTo = (to, options) => {
  if (!to) {
    to = "/";
  }
  const toPath = typeof to === "string" ? to : withQuery(to.path || "/", to.query || {}) + (to.hash || "");
  if (options == null ? void 0 : options.open) {
    return Promise.resolve();
  }
  const isExternal = (options == null ? void 0 : options.external) || hasProtocol(toPath, { acceptRelative: true });
  if (isExternal && !(options == null ? void 0 : options.external)) {
    throw new Error("Navigating to external URL is not allowed by default. Use `navigateTo (url, { external: true })`.");
  }
  if (isExternal && parseURL(toPath).protocol === "script:") {
    throw new Error("Cannot navigate to an URL with script protocol.");
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL(useRuntimeConfig().app.baseURL, fullPath);
      async function redirect(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(/"/g, "%22");
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode((options == null ? void 0 : options.redirectCode) || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: location2 }
        };
        return response;
      }
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    if (options == null ? void 0 : options.replace) {
      location.replace(toPath);
    } else {
      location.href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (_err) => {
  const err = createError(_err);
  try {
    const nuxtApp = useNuxtApp();
    const error = useError();
    if (false)
      ;
    error.value = error.value || err;
  } catch {
    throw err;
  }
  return err;
};
const isNuxtError = (err) => !!(err && typeof err === "object" && "__nuxt_error" in err);
const createError = (err) => {
  const _err = createError$1(err);
  _err.__nuxt_error = true;
  return _err;
};
const _routes = [
  {
    name: "404",
    path: "/404",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => Promise.resolve().then(function() {
      return _404;
    }).then((m) => m.default || m)
  },
  {
    name: "GithubRepo",
    path: "/GithubRepo",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => Promise.resolve().then(function() {
      return GithubRepo;
    }).then((m) => m.default || m)
  },
  {
    name: "blog",
    path: "/blog",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => Promise.resolve().then(function() {
      return index$1;
    }).then((m) => m.default || m)
  },
  {
    name: "github",
    path: "/github",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => Promise.resolve().then(function() {
      return github;
    }).then((m) => m.default || m)
  },
  {
    name: "index",
    path: "/",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => Promise.resolve().then(function() {
      return index2;
    }).then((m) => m.default || m)
  },
  {
    name: "portfolio",
    path: "/portfolio",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => Promise.resolve().then(function() {
      return portfolio;
    }).then((m) => m.default || m)
  },
  {
    name: "resume",
    path: "/resume",
    meta: {},
    alias: [],
    redirect: void 0,
    component: () => Promise.resolve().then(function() {
      return resume;
    }).then((m) => m.default || m)
  }
];
const appHead = { "meta": [{ "name": "viewport", "content": "width=device-width, initial-scale=1" }, { "charset": "utf-8" }], "link": [], "style": [], "script": [], "noscript": [] };
const appLayoutTransition = false;
const appPageTransition = false;
const appKeepalive = false;
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    let position = savedPosition || void 0;
    if (!position && from && to && to.meta.scrollToTop !== false && _isDifferentRoute(from, to)) {
      position = { left: 0, top: 0 };
    }
    if (to.path === from.path) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash) };
      }
    }
    const hasTransition = (route) => !!(route.meta.pageTransition ?? appPageTransition);
    const hookToWait = hasTransition(from) && hasTransition(to) ? "page:transition:finish" : "page:finish";
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce(hookToWait, async () => {
        await nextTick();
        if (to.hash) {
          position = { el: to.hash, top: _getHashElementScrollMarginTop(to.hash) };
        }
        resolve(position);
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = document.querySelector(selector);
    if (elem) {
      return parseFloat(getComputedStyle(elem).scrollMarginTop);
    }
  } catch {
  }
  return 0;
}
function _isDifferentRoute(from, to) {
  const samePageComponent = to.matched.every((comp, index3) => {
    var _a, _b, _c;
    return ((_a = comp.components) == null ? void 0 : _a.default) === ((_c = (_b = from.matched[index3]) == null ? void 0 : _b.components) == null ? void 0 : _c.default);
  });
  if (!samePageComponent) {
    return true;
  }
  if (samePageComponent && JSON.stringify(from.params) !== JSON.stringify(to.params)) {
    return true;
  }
  return false;
}
const configRouterOptions = {};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  var _a;
  let __temp, __restore;
  if (!((_a = to.meta) == null ? void 0 : _a.validate)) {
    return;
  }
  useRouter();
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  {
    return result;
  }
});
const globalMiddleware = [
  validate
];
const namedMiddleware = {};
const plugin$1 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    var _a, _b;
    let __temp, __restore;
    let routerBase = useRuntimeConfig().app.baseURL;
    if (routerOptions.hashMode && !routerBase.includes("#")) {
      routerBase += "#";
    }
    const history = ((_a = routerOptions.history) == null ? void 0 : _a.call(routerOptions, routerBase)) ?? createMemoryHistory(routerBase);
    const routes = ((_b = routerOptions.routes) == null ? void 0 : _b.call(routerOptions, _routes)) ?? _routes;
    let startPosition;
    const initialURL = nuxtApp.ssrContext.url;
    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        var _a2;
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        router.options.scrollBehavior = routerOptions.scrollBehavior;
        return (_a2 = routerOptions.scrollBehavior) == null ? void 0 : _a2.call(routerOptions, to, START_LOCATION, startPosition || savedPosition);
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const _route = shallowRef(router.resolve(initialURL));
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    nuxtApp.hook("page:finish", syncCurrentRoute);
    router.afterEach((to, from) => {
      var _a2, _b2, _c, _d;
      if (((_b2 = (_a2 = to.matched[0]) == null ? void 0 : _a2.components) == null ? void 0 : _b2.default) === ((_d = (_c = from.matched[0]) == null ? void 0 : _c.components) == null ? void 0 : _d.default)) {
        syncCurrentRoute();
      }
    });
    const route = {};
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key]
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware = nuxtApp._middleware || {
      global: [],
      named: {}
    };
    useError();
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const initialLayout = useState("_layout");
    router.beforeEach(async (to, from) => {
      var _a2, _b2;
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout.value && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout.value;
      }
      nuxtApp._processingMiddleware = true;
      if (!((_a2 = nuxtApp.ssrContext) == null ? void 0 : _a2.islandContext)) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          if (Array.isArray(componentMiddleware)) {
            for (const entry2 of componentMiddleware) {
              middlewareEntries.add(entry2);
            }
          } else {
            middlewareEntries.add(componentMiddleware);
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await ((_b2 = namedMiddleware[entry2]) == null ? void 0 : _b2.call(namedMiddleware).then((r) => r.default || r)) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          const result = await nuxtApp.runWithContext(() => middleware(to, from));
          {
            if (result === false || result instanceof Error) {
              const error2 = result || createError$1({
                statusCode: 404,
                statusMessage: `Page Not Found: ${initialURL}`
              });
              await nuxtApp.runWithContext(() => showError(error2));
              return false;
            }
          }
          if (result || result === false) {
            return result;
          }
        }
      }
    });
    router.onError(() => {
      delete nuxtApp._processingMiddleware;
    });
    router.afterEach(async (to, _from, failure) => {
      var _a2;
      delete nuxtApp._processingMiddleware;
      if ((failure == null ? void 0 : failure.type) === 4) {
        return;
      }
      if (to.matched.length === 0 && !((_a2 = nuxtApp.ssrContext) == null ? void 0 : _a2.islandContext)) {
        await nuxtApp.runWithContext(() => showError(createError$1({
          statusCode: 404,
          fatal: false,
          statusMessage: `Page not found: ${to.fullPath}`
        })));
      } else if (to.redirectedFrom && to.fullPath !== initialURL) {
        await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        await router.replace({
          ...router.resolve(initialURL),
          name: void 0,
          // #4920, #4982
          force: true
        });
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
const isVue2 = false;
/*!
  * pinia v2.1.4
  * (c) 2023 Eduardo San Martin Morote
  * @license MIT
  */
let activePinia;
const setActivePinia = (pinia) => activePinia = pinia;
const piniaSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function isPlainObject$1(o) {
  return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
}
var MutationType;
(function(MutationType2) {
  MutationType2["direct"] = "direct";
  MutationType2["patchObject"] = "patch object";
  MutationType2["patchFunction"] = "patch function";
})(MutationType || (MutationType = {}));
function createPinia() {
  const scope = effectScope(true);
  const state = scope.run(() => ref({}));
  let _p = [];
  let toBeInstalled = [];
  const pinia = markRaw({
    install(app) {
      setActivePinia(pinia);
      {
        pinia._a = app;
        app.provide(piniaSymbol, pinia);
        app.config.globalProperties.$pinia = pinia;
        toBeInstalled.forEach((plugin2) => _p.push(plugin2));
        toBeInstalled = [];
      }
    },
    use(plugin2) {
      if (!this._a && !isVue2) {
        toBeInstalled.push(plugin2);
      } else {
        _p.push(plugin2);
      }
      return this;
    },
    _p,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: /* @__PURE__ */ new Map(),
    state
  });
  return pinia;
}
const noop = () => {
};
function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
  subscriptions.push(callback);
  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback);
    if (idx > -1) {
      subscriptions.splice(idx, 1);
      onCleanup();
    }
  };
  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription);
  }
  return removeSubscription;
}
function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.slice().forEach((callback) => {
    callback(...args);
  });
}
const fallbackRunWithContext = (fn) => fn();
function mergeReactiveObjects(target, patchToApply) {
  if (target instanceof Map && patchToApply instanceof Map) {
    patchToApply.forEach((value, key) => target.set(key, value));
  }
  if (target instanceof Set && patchToApply instanceof Set) {
    patchToApply.forEach(target.add, target);
  }
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key))
      continue;
    const subPatch = patchToApply[key];
    const targetValue = target[key];
    if (isPlainObject$1(targetValue) && isPlainObject$1(subPatch) && target.hasOwnProperty(key) && !isRef(subPatch) && !isReactive(subPatch)) {
      target[key] = mergeReactiveObjects(targetValue, subPatch);
    } else {
      target[key] = subPatch;
    }
  }
  return target;
}
const skipHydrateSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function shouldHydrate(obj) {
  return !isPlainObject$1(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
}
const { assign: assign$2 } = Object;
function isComputed(o) {
  return !!(isRef(o) && o.effect);
}
function createOptionsStore(id, options, pinia, hot) {
  const { state, actions, getters } = options;
  const initialState = pinia.state.value[id];
  let store;
  function setup() {
    if (!initialState && (!("production" !== "production") )) {
      {
        pinia.state.value[id] = state ? state() : {};
      }
    }
    const localState = toRefs(pinia.state.value[id]);
    return assign$2(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
      computedGetters[name] = markRaw(computed(() => {
        setActivePinia(pinia);
        const store2 = pinia._s.get(id);
        return getters[name].call(store2, store2);
      }));
      return computedGetters;
    }, {}));
  }
  store = createSetupStore(id, setup, options, pinia, hot, true);
  return store;
}
function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
  let scope;
  const optionsForPlugin = assign$2({ actions: {} }, options);
  const $subscribeOptions = {
    deep: true
    // flush: 'post',
  };
  let isListening;
  let isSyncListening;
  let subscriptions = [];
  let actionSubscriptions = [];
  let debuggerEvents;
  const initialState = pinia.state.value[$id];
  if (!isOptionsStore && !initialState && (!("production" !== "production") )) {
    {
      pinia.state.value[$id] = {};
    }
  }
  ref({});
  let activeListener;
  function $patch(partialStateOrMutator) {
    let subscriptionMutation;
    isListening = isSyncListening = false;
    if (typeof partialStateOrMutator === "function") {
      partialStateOrMutator(pinia.state.value[$id]);
      subscriptionMutation = {
        type: MutationType.patchFunction,
        storeId: $id,
        events: debuggerEvents
      };
    } else {
      mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
      subscriptionMutation = {
        type: MutationType.patchObject,
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents
      };
    }
    const myListenerId = activeListener = Symbol();
    nextTick().then(() => {
      if (activeListener === myListenerId) {
        isListening = true;
      }
    });
    isSyncListening = true;
    triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
  }
  const $reset = isOptionsStore ? function $reset2() {
    const { state } = options;
    const newState = state ? state() : {};
    this.$patch(($state) => {
      assign$2($state, newState);
    });
  } : (
    /* istanbul ignore next */
    noop
  );
  function $dispose() {
    scope.stop();
    subscriptions = [];
    actionSubscriptions = [];
    pinia._s.delete($id);
  }
  function wrapAction(name, action) {
    return function() {
      setActivePinia(pinia);
      const args = Array.from(arguments);
      const afterCallbackList = [];
      const onErrorCallbackList = [];
      function after(callback) {
        afterCallbackList.push(callback);
      }
      function onError(callback) {
        onErrorCallbackList.push(callback);
      }
      triggerSubscriptions(actionSubscriptions, {
        args,
        name,
        store,
        after,
        onError
      });
      let ret;
      try {
        ret = action.apply(this && this.$id === $id ? this : store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
        throw error;
      }
      if (ret instanceof Promise) {
        return ret.then((value) => {
          triggerSubscriptions(afterCallbackList, value);
          return value;
        }).catch((error) => {
          triggerSubscriptions(onErrorCallbackList, error);
          return Promise.reject(error);
        });
      }
      triggerSubscriptions(afterCallbackList, ret);
      return ret;
    };
  }
  const partialStore = {
    _p: pinia,
    // _s: scope,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $reset,
    $subscribe(callback, options2 = {}) {
      const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
      const stopWatcher = scope.run(() => watch(() => pinia.state.value[$id], (state) => {
        if (options2.flush === "sync" ? isSyncListening : isListening) {
          callback({
            storeId: $id,
            type: MutationType.direct,
            events: debuggerEvents
          }, state);
        }
      }, assign$2({}, $subscribeOptions, options2)));
      return removeSubscription;
    },
    $dispose
  };
  const store = reactive(partialStore);
  pinia._s.set($id, store);
  const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
  const setupStore = pinia._e.run(() => {
    scope = effectScope();
    return runWithContext(() => scope.run(setup));
  });
  for (const key in setupStore) {
    const prop = setupStore[key];
    if (isRef(prop) && !isComputed(prop) || isReactive(prop)) {
      if (!isOptionsStore) {
        if (initialState && shouldHydrate(prop)) {
          if (isRef(prop)) {
            prop.value = initialState[key];
          } else {
            mergeReactiveObjects(prop, initialState[key]);
          }
        }
        {
          pinia.state.value[$id][key] = prop;
        }
      }
    } else if (typeof prop === "function") {
      const actionValue = wrapAction(key, prop);
      {
        setupStore[key] = actionValue;
      }
      optionsForPlugin.actions[key] = prop;
    } else ;
  }
  {
    assign$2(store, setupStore);
    assign$2(toRaw(store), setupStore);
  }
  Object.defineProperty(store, "$state", {
    get: () => pinia.state.value[$id],
    set: (state) => {
      $patch(($state) => {
        assign$2($state, state);
      });
    }
  });
  pinia._p.forEach((extender) => {
    {
      assign$2(store, scope.run(() => extender({
        store,
        app: pinia._a,
        pinia,
        options: optionsForPlugin
      })));
    }
  });
  if (initialState && isOptionsStore && options.hydrate) {
    options.hydrate(store.$state, initialState);
  }
  isListening = true;
  isSyncListening = true;
  return store;
}
function defineStore(idOrOptions, setup, setupOptions) {
  let id;
  let options;
  const isSetupStore = typeof setup === "function";
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = isSetupStore ? setupOptions : setup;
  } else {
    options = idOrOptions;
    id = idOrOptions.id;
  }
  function useStore(pinia, hot) {
    const hasContext = hasInjectionContext();
    pinia = // in test mode, ignore the argument provided as we can always retrieve a
    // pinia instance with getActivePinia()
    (pinia) || (hasContext ? inject(piniaSymbol, null) : null);
    if (pinia)
      setActivePinia(pinia);
    pinia = activePinia;
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia);
      } else {
        createOptionsStore(id, options, pinia);
      }
    }
    const store = pinia._s.get(id);
    return store;
  }
  useStore.$id = id;
  return useStore;
}
function resolveUnref(r) {
  return typeof r === "function" ? r() : unref(r);
}
function resolveUnrefHeadInput(ref2, lastKey = "") {
  if (ref2 instanceof Promise)
    return ref2;
  const root3 = resolveUnref(ref2);
  if (!ref2 || !root3)
    return root3;
  if (Array.isArray(root3))
    return root3.map((r) => resolveUnrefHeadInput(r, lastKey));
  if (typeof root3 === "object") {
    return Object.fromEntries(
      Object.entries(root3).map(([k, v]) => {
        if (k === "titleTemplate" || k.startsWith("on"))
          return [k, unref(v)];
        return [k, resolveUnrefHeadInput(v, k)];
      })
    );
  }
  return root3;
}
const Vue3 = version.startsWith("3");
const headSymbol = "usehead";
function injectHead() {
  return getCurrentInstance() && inject(headSymbol) || getActiveHead();
}
function vueInstall(head) {
  const plugin2 = {
    install(app) {
      if (Vue3) {
        app.config.globalProperties.$unhead = head;
        app.config.globalProperties.$head = head;
        app.provide(headSymbol, head);
      }
    }
  };
  return plugin2.install;
}
function createServerHead(options = {}) {
  const head = createServerHead$1({
    ...options,
    plugins: [
      VueReactiveUseHeadPlugin(),
      ...(options == null ? void 0 : options.plugins) || []
    ]
  });
  head.install = vueInstall(head);
  return head;
}
function VueReactiveUseHeadPlugin() {
  return defineHeadPlugin({
    hooks: {
      "entries:resolve": function(ctx) {
        for (const entry2 of ctx.entries)
          entry2.resolvedInput = resolveUnrefHeadInput(entry2.input);
      }
    }
  });
}
function clientUseHead(input, options = {}) {
  const head = injectHead();
  const deactivated = ref(false);
  const resolvedInput = ref({});
  watchEffect(() => {
    resolvedInput.value = deactivated.value ? {} : resolveUnrefHeadInput(input);
  });
  const entry2 = head.push(resolvedInput.value, options);
  watch(resolvedInput, (e) => {
    entry2.patch(e);
  });
  getCurrentInstance();
  return entry2;
}
function serverUseHead(input, options = {}) {
  const head = injectHead();
  return head.push(input, options);
}
function useHead(input, options = {}) {
  var _a;
  const head = injectHead();
  if (head) {
    const isBrowser = !!((_a = head.resolvedOptions) == null ? void 0 : _a.document);
    if (options.mode === "server" && isBrowser || options.mode === "client" && !isBrowser)
      return;
    return isBrowser ? clientUseHead(input, options) : serverUseHead(input, options);
  }
}
const coreComposableNames = [
  "injectHead"
];
({
  "@unhead/vue": [...coreComposableNames, ...composableNames]
});
const getDefault = () => null;
function useAsyncData(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  let [key, handler2, options = {}] = args;
  if (typeof key !== "string") {
    throw new TypeError("[nuxt] [asyncData] key must be a string.");
  }
  if (typeof handler2 !== "function") {
    throw new TypeError("[nuxt] [asyncData] handler must be a function.");
  }
  options.server = options.server ?? true;
  options.default = options.default ?? getDefault;
  options.lazy = options.lazy ?? false;
  options.immediate = options.immediate ?? true;
  const nuxt = useNuxtApp();
  const getCachedData = () => nuxt.isHydrating ? nuxt.payload.data[key] : nuxt.static.data[key];
  const hasCachedData = () => getCachedData() !== void 0;
  if (!nuxt._asyncData[key]) {
    nuxt._asyncData[key] = {
      data: ref(getCachedData() ?? options.default()),
      pending: ref(!hasCachedData()),
      error: toRef(nuxt.payload._errors, key),
      status: ref("idle")
    };
  }
  const asyncData = { ...nuxt._asyncData[key] };
  asyncData.refresh = asyncData.execute = (opts = {}) => {
    if (nuxt._asyncDataPromises[key]) {
      if (opts.dedupe === false) {
        return nuxt._asyncDataPromises[key];
      }
      nuxt._asyncDataPromises[key].cancelled = true;
    }
    if ((opts._initial || nuxt.isHydrating && opts._initial !== false) && hasCachedData()) {
      return getCachedData();
    }
    asyncData.pending.value = true;
    asyncData.status.value = "pending";
    const promise = new Promise(
      (resolve, reject) => {
        try {
          resolve(handler2(nuxt));
        } catch (err) {
          reject(err);
        }
      }
    ).then((_result) => {
      if (promise.cancelled) {
        return nuxt._asyncDataPromises[key];
      }
      let result = _result;
      if (options.transform) {
        result = options.transform(_result);
      }
      if (options.pick) {
        result = pick(result, options.pick);
      }
      asyncData.data.value = result;
      asyncData.error.value = null;
      asyncData.status.value = "success";
    }).catch((error) => {
      if (promise.cancelled) {
        return nuxt._asyncDataPromises[key];
      }
      asyncData.error.value = error;
      asyncData.data.value = unref(options.default());
      asyncData.status.value = "error";
    }).finally(() => {
      if (promise.cancelled) {
        return;
      }
      asyncData.pending.value = false;
      nuxt.payload.data[key] = asyncData.data.value;
      if (asyncData.error.value) {
        nuxt.payload._errors[key] = createError(asyncData.error.value);
      }
      delete nuxt._asyncDataPromises[key];
    });
    nuxt._asyncDataPromises[key] = promise;
    return nuxt._asyncDataPromises[key];
  };
  const initialFetch = () => asyncData.refresh({ _initial: true });
  const fetchOnServer = options.server !== false && nuxt.payload.serverRendered;
  if (fetchOnServer && options.immediate) {
    const promise = initialFetch();
    if (getCurrentInstance()) {
      onServerPrefetch(() => promise);
    } else {
      nuxt.hook("app:created", () => promise);
    }
  }
  const asyncDataPromise = Promise.resolve(nuxt._asyncDataPromises[key]).then(() => asyncData);
  Object.assign(asyncDataPromise, asyncData);
  return asyncDataPromise;
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
function useRequestEvent(nuxtApp = useNuxtApp()) {
  var _a;
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}
function useRequestFetch() {
  var _a;
  const event = (_a = useNuxtApp().ssrContext) == null ? void 0 : _a.event;
  return (event == null ? void 0 : event.$fetch) || globalThis.$fetch;
}
function useFetch(request, arg1, arg2) {
  const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  const _key = opts.key || hash([autoKey, unref(opts.baseURL), typeof request === "string" ? request : "", unref(opts.params || opts.query)]);
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useFetch] key must be a string: " + _key);
  }
  if (!request) {
    throw new Error("[nuxt] [useFetch] request is missing.");
  }
  const key = _key === autoKey ? "$f" + _key : _key;
  const _request = computed(() => {
    let r = request;
    if (typeof r === "function") {
      r = r();
    }
    return unref(r);
  });
  if (!opts.baseURL && typeof _request.value === "string" && _request.value.startsWith("//")) {
    throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
  }
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    watch: watch2,
    immediate,
    ...fetchOptions
  } = opts;
  const _fetchOptions = reactive({
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  });
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    immediate,
    watch: watch2 === false ? [] : [_fetchOptions, _request, ...watch2 || []]
  };
  let controller;
  const asyncData = useAsyncData(key, () => {
    var _a;
    (_a = controller == null ? void 0 : controller.abort) == null ? void 0 : _a.call(controller);
    controller = typeof AbortController !== "undefined" ? new AbortController() : {};
    const isLocalFetch = typeof _request.value === "string" && _request.value.startsWith("/");
    let _$fetch = opts.$fetch || globalThis.$fetch;
    if (!opts.$fetch && isLocalFetch) {
      _$fetch = useRequestFetch();
    }
    return _$fetch(_request.value, { signal: controller.signal, ..._fetchOptions });
  }, _asyncDataOptions);
  return asyncData;
}
const CookieDefaults = {
  path: "/",
  watch: true,
  decode: (val) => destr(decodeURIComponent(val)),
  encode: (val) => encodeURIComponent(typeof val === "string" ? val : JSON.stringify(val))
};
function useCookie(name, _opts) {
  var _a;
  const opts = { ...CookieDefaults, ..._opts };
  const cookies = readRawCookies(opts) || {};
  const cookie = ref(cookies[name] ?? ((_a = opts.default) == null ? void 0 : _a.call(opts)));
  {
    const nuxtApp = useNuxtApp();
    const writeFinalCookieValue = () => {
      if (!isEqual(cookie.value, cookies[name])) {
        writeServerCookie(useRequestEvent(nuxtApp), name, cookie.value, opts);
      }
    };
    const unhook = nuxtApp.hooks.hookOnce("app:rendered", writeFinalCookieValue);
    nuxtApp.hooks.hookOnce("app:error", () => {
      unhook();
      return writeFinalCookieValue();
    });
  }
  return cookie;
}
function readRawCookies(opts = {}) {
  var _a;
  {
    return parse$1(((_a = useRequestEvent()) == null ? void 0 : _a.node.req.headers.cookie) || "", opts);
  }
}
function writeServerCookie(event, name, value, opts = {}) {
  if (event) {
    if (value !== null && value !== void 0) {
      return setCookie(event, name, value, opts);
    }
    if (getCookie(event, name) !== void 0) {
      return deleteCookie(event, name, opts);
    }
  }
}
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext._payloadReducers[name] = reduce;
  }
}
const firstNonUndefined = (...args) => args.find((arg) => arg !== void 0);
const DEFAULT_EXTERNAL_REL_ATTRIBUTE = "noopener noreferrer";
/*! @__NO_SIDE_EFFECTS__ */
function defineNuxtLink(options) {
  const componentName = options.componentName || "NuxtLink";
  const resolveTrailingSlashBehavior = (to, resolve) => {
    if (!to || options.trailingSlash !== "append" && options.trailingSlash !== "remove") {
      return to;
    }
    const normalizeTrailingSlash = options.trailingSlash === "append" ? withTrailingSlash : withoutTrailingSlash;
    if (typeof to === "string") {
      return normalizeTrailingSlash(to, true);
    }
    const path = "path" in to ? to.path : resolve(to).path;
    return {
      ...to,
      name: void 0,
      // named routes would otherwise always override trailing slash behavior
      path: normalizeTrailingSlash(path, true)
    };
  };
  return /* @__PURE__ */ defineComponent({
    name: componentName,
    props: {
      // Routing
      to: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      href: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      // Attributes
      target: {
        type: String,
        default: void 0,
        required: false
      },
      rel: {
        type: String,
        default: void 0,
        required: false
      },
      noRel: {
        type: Boolean,
        default: void 0,
        required: false
      },
      // Prefetching
      prefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      noPrefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      // Styling
      activeClass: {
        type: String,
        default: void 0,
        required: false
      },
      exactActiveClass: {
        type: String,
        default: void 0,
        required: false
      },
      prefetchedClass: {
        type: String,
        default: void 0,
        required: false
      },
      // Vue Router's `<RouterLink>` additional props
      replace: {
        type: Boolean,
        default: void 0,
        required: false
      },
      ariaCurrentValue: {
        type: String,
        default: void 0,
        required: false
      },
      // Edge cases handling
      external: {
        type: Boolean,
        default: void 0,
        required: false
      },
      // Slot API
      custom: {
        type: Boolean,
        default: void 0,
        required: false
      }
    },
    setup(props, { slots }) {
      const router = useRouter();
      const to = computed(() => {
        const path = props.to || props.href || "";
        return resolveTrailingSlashBehavior(path, router.resolve);
      });
      const isExternal = computed(() => {
        if (props.external) {
          return true;
        }
        if (props.target && props.target !== "_self") {
          return true;
        }
        if (typeof to.value === "object") {
          return false;
        }
        return to.value === "" || hasProtocol(to.value, { acceptRelative: true });
      });
      const prefetched = ref(false);
      const el = void 0;
      const elRef = void 0;
      return () => {
        var _a, _b;
        if (!isExternal.value) {
          const routerLinkProps = {
            ref: elRef,
            to: to.value,
            activeClass: props.activeClass || options.activeClass,
            exactActiveClass: props.exactActiveClass || options.exactActiveClass,
            replace: props.replace,
            ariaCurrentValue: props.ariaCurrentValue,
            custom: props.custom
          };
          if (!props.custom) {
            if (prefetched.value) {
              routerLinkProps.class = props.prefetchedClass || options.prefetchedClass;
            }
            routerLinkProps.rel = props.rel;
          }
          return h(
            resolveComponent("RouterLink"),
            routerLinkProps,
            slots.default
          );
        }
        const href = typeof to.value === "object" ? ((_a = router.resolve(to.value)) == null ? void 0 : _a.href) ?? null : to.value || null;
        const target = props.target || null;
        const rel = props.noRel ? null : firstNonUndefined(props.rel, options.externalRelAttribute, href ? DEFAULT_EXTERNAL_REL_ATTRIBUTE : "") || null;
        const navigate = () => navigateTo(href, { replace: props.replace });
        if (props.custom) {
          if (!slots.default) {
            return null;
          }
          return slots.default({
            href,
            navigate,
            get route() {
              if (!href) {
                return void 0;
              }
              const url = parseURL(href);
              return {
                path: url.pathname,
                fullPath: url.pathname,
                get query() {
                  return parseQuery(url.search);
                },
                hash: url.hash,
                // stub properties for compat with vue-router
                params: {},
                name: void 0,
                matched: [],
                redirectedFrom: void 0,
                meta: {},
                href
              };
            },
            rel,
            target,
            isExternal: isExternal.value,
            isActive: false,
            isExactActive: false
          });
        }
        return h("a", { ref: el, href, rel, target }, (_b = slots.default) == null ? void 0 : _b.call(slots));
      };
    }
  });
}
const __nuxt_component_0$3 = /* @__PURE__ */ defineNuxtLink({ componentName: "NuxtLink" });
const plugin = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia();
  nuxtApp.vueApp.use(pinia);
  setActivePinia(pinia);
  {
    nuxtApp.payload.pinia = pinia.state.value;
  }
  return {
    provide: {
      pinia
    }
  };
});
const reducers = {
  NuxtError: (data) => isNuxtError(data) && data.toJSON(),
  EmptyShallowRef: (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_"),
  EmptyRef: (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_"),
  ShallowRef: (data) => isRef(data) && isShallow(data) && data.value,
  ShallowReactive: (data) => isReactive(data) && isShallow(data) && toRaw(data),
  Ref: (data) => isRef(data) && data.value,
  Reactive: (data) => isReactive(data) && toRaw(data)
};
const revive_payload_server_eJ33V7gbc6 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const reducer in reducers) {
      definePayloadReducer(reducer, reducers[reducer]);
    }
  }
});
const components_plugin_KR1HBZs4kY = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const unhead_KgADcZ0jPj = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  setup(nuxtApp) {
    const createHead = createServerHead;
    const head = createHead();
    head.push(appHead);
    nuxtApp.vueApp.use(head);
    {
      nuxtApp.ssrContext.renderMeta = async () => {
        const meta = await renderSSRHead(head);
        return {
          ...meta,
          bodyScriptsPrepend: meta.bodyTagsOpen,
          // resolves naming difference with NuxtMeta and Unhead
          bodyScripts: meta.bodyTags
        };
      };
    }
  }
});
/*!
  * shared v9.2.2
  * (c) 2022 kazuya kawaguchi
  * Released under the MIT License.
  */
const inBrowser = false;
const hasSymbol = typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol";
const makeSymbol = (name) => hasSymbol ? Symbol(name) : name;
const generateFormatCacheKey = (locale, key, source) => friendlyJSONstringify({ l: locale, k: key, s: source });
const friendlyJSONstringify = (json) => JSON.stringify(json).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029").replace(/\u0027/g, "\\u0027");
const isNumber = (val) => typeof val === "number" && isFinite(val);
const isDate = (val) => toTypeString(val) === "[object Date]";
const isRegExp = (val) => toTypeString(val) === "[object RegExp]";
const isEmptyObject = (val) => isPlainObject(val) && Object.keys(val).length === 0;
function warn(msg, err) {
  if (typeof console !== "undefined") {
    console.warn(`[intlify] ` + msg);
    if (err) {
      console.warn(err.stack);
    }
  }
}
const assign = Object.assign;
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {});
};
function escapeHtml(rawText) {
  return rawText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}
const isArray = Array.isArray;
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isBoolean = (val) => typeof val === "boolean";
const isObject = (val) => (
  // eslint-disable-line
  val !== null && typeof val === "object"
);
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const toDisplayString = (val) => {
  return val == null ? "" : isArray(val) || isPlainObject(val) && val.toString === objectToString ? JSON.stringify(val, null, 2) : String(val);
};
/*!
  * devtools-if v9.2.2
  * (c) 2022 kazuya kawaguchi
  * Released under the MIT License.
  */
const IntlifyDevToolsHooks = {
  I18nInit: "i18n:init",
  FunctionTranslate: "function:translate"
};
/*!
  * core-base v9.2.2
  * (c) 2022 kazuya kawaguchi
  * Released under the MIT License.
  */
const pathStateMachine = [];
pathStateMachine[
  0
  /* BEFORE_PATH */
] = {
  [
    "w"
    /* WORKSPACE */
  ]: [
    0
    /* BEFORE_PATH */
  ],
  [
    "i"
    /* IDENT */
  ]: [
    3,
    0
    /* APPEND */
  ],
  [
    "["
    /* LEFT_BRACKET */
  ]: [
    4
    /* IN_SUB_PATH */
  ],
  [
    "o"
    /* END_OF_FAIL */
  ]: [
    7
    /* AFTER_PATH */
  ]
};
pathStateMachine[
  1
  /* IN_PATH */
] = {
  [
    "w"
    /* WORKSPACE */
  ]: [
    1
    /* IN_PATH */
  ],
  [
    "."
    /* DOT */
  ]: [
    2
    /* BEFORE_IDENT */
  ],
  [
    "["
    /* LEFT_BRACKET */
  ]: [
    4
    /* IN_SUB_PATH */
  ],
  [
    "o"
    /* END_OF_FAIL */
  ]: [
    7
    /* AFTER_PATH */
  ]
};
pathStateMachine[
  2
  /* BEFORE_IDENT */
] = {
  [
    "w"
    /* WORKSPACE */
  ]: [
    2
    /* BEFORE_IDENT */
  ],
  [
    "i"
    /* IDENT */
  ]: [
    3,
    0
    /* APPEND */
  ],
  [
    "0"
    /* ZERO */
  ]: [
    3,
    0
    /* APPEND */
  ]
};
pathStateMachine[
  3
  /* IN_IDENT */
] = {
  [
    "i"
    /* IDENT */
  ]: [
    3,
    0
    /* APPEND */
  ],
  [
    "0"
    /* ZERO */
  ]: [
    3,
    0
    /* APPEND */
  ],
  [
    "w"
    /* WORKSPACE */
  ]: [
    1,
    1
    /* PUSH */
  ],
  [
    "."
    /* DOT */
  ]: [
    2,
    1
    /* PUSH */
  ],
  [
    "["
    /* LEFT_BRACKET */
  ]: [
    4,
    1
    /* PUSH */
  ],
  [
    "o"
    /* END_OF_FAIL */
  ]: [
    7,
    1
    /* PUSH */
  ]
};
pathStateMachine[
  4
  /* IN_SUB_PATH */
] = {
  [
    "'"
    /* SINGLE_QUOTE */
  ]: [
    5,
    0
    /* APPEND */
  ],
  [
    '"'
    /* DOUBLE_QUOTE */
  ]: [
    6,
    0
    /* APPEND */
  ],
  [
    "["
    /* LEFT_BRACKET */
  ]: [
    4,
    2
    /* INC_SUB_PATH_DEPTH */
  ],
  [
    "]"
    /* RIGHT_BRACKET */
  ]: [
    1,
    3
    /* PUSH_SUB_PATH */
  ],
  [
    "o"
    /* END_OF_FAIL */
  ]: 8,
  [
    "l"
    /* ELSE */
  ]: [
    4,
    0
    /* APPEND */
  ]
};
pathStateMachine[
  5
  /* IN_SINGLE_QUOTE */
] = {
  [
    "'"
    /* SINGLE_QUOTE */
  ]: [
    4,
    0
    /* APPEND */
  ],
  [
    "o"
    /* END_OF_FAIL */
  ]: 8,
  [
    "l"
    /* ELSE */
  ]: [
    5,
    0
    /* APPEND */
  ]
};
pathStateMachine[
  6
  /* IN_DOUBLE_QUOTE */
] = {
  [
    '"'
    /* DOUBLE_QUOTE */
  ]: [
    4,
    0
    /* APPEND */
  ],
  [
    "o"
    /* END_OF_FAIL */
  ]: 8,
  [
    "l"
    /* ELSE */
  ]: [
    6,
    0
    /* APPEND */
  ]
};
const literalValueRE = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
function isLiteral(exp) {
  return literalValueRE.test(exp);
}
function stripQuotes(str) {
  const a = str.charCodeAt(0);
  const b = str.charCodeAt(str.length - 1);
  return a === b && (a === 34 || a === 39) ? str.slice(1, -1) : str;
}
function getPathCharType(ch) {
  if (ch === void 0 || ch === null) {
    return "o";
  }
  const code2 = ch.charCodeAt(0);
  switch (code2) {
    case 91:
    case 93:
    case 46:
    case 34:
    case 39:
      return ch;
    case 95:
    case 36:
    case 45:
      return "i";
    case 9:
    case 10:
    case 13:
    case 160:
    case 65279:
    case 8232:
    case 8233:
      return "w";
  }
  return "i";
}
function formatSubPath(path) {
  const trimmed = path.trim();
  if (path.charAt(0) === "0" && isNaN(parseInt(path))) {
    return false;
  }
  return isLiteral(trimmed) ? stripQuotes(trimmed) : "*" + trimmed;
}
function parse(path) {
  const keys = [];
  let index3 = -1;
  let mode = 0;
  let subPathDepth = 0;
  let c;
  let key;
  let newChar;
  let type;
  let transition;
  let action;
  let typeMap;
  const actions = [];
  actions[
    0
    /* APPEND */
  ] = () => {
    if (key === void 0) {
      key = newChar;
    } else {
      key += newChar;
    }
  };
  actions[
    1
    /* PUSH */
  ] = () => {
    if (key !== void 0) {
      keys.push(key);
      key = void 0;
    }
  };
  actions[
    2
    /* INC_SUB_PATH_DEPTH */
  ] = () => {
    actions[
      0
      /* APPEND */
    ]();
    subPathDepth++;
  };
  actions[
    3
    /* PUSH_SUB_PATH */
  ] = () => {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = 4;
      actions[
        0
        /* APPEND */
      ]();
    } else {
      subPathDepth = 0;
      if (key === void 0) {
        return false;
      }
      key = formatSubPath(key);
      if (key === false) {
        return false;
      } else {
        actions[
          1
          /* PUSH */
        ]();
      }
    }
  };
  function maybeUnescapeQuote() {
    const nextChar = path[index3 + 1];
    if (mode === 5 && nextChar === "'" || mode === 6 && nextChar === '"') {
      index3++;
      newChar = "\\" + nextChar;
      actions[
        0
        /* APPEND */
      ]();
      return true;
    }
  }
  while (mode !== null) {
    index3++;
    c = path[index3];
    if (c === "\\" && maybeUnescapeQuote()) {
      continue;
    }
    type = getPathCharType(c);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap[
      "l"
      /* ELSE */
    ] || 8;
    if (transition === 8) {
      return;
    }
    mode = transition[0];
    if (transition[1] !== void 0) {
      action = actions[transition[1]];
      if (action) {
        newChar = c;
        if (action() === false) {
          return;
        }
      }
    }
    if (mode === 7) {
      return keys;
    }
  }
}
const cache = /* @__PURE__ */ new Map();
function resolveWithKeyValue(obj, path) {
  return isObject(obj) ? obj[path] : null;
}
function resolveValue(obj, path) {
  if (!isObject(obj)) {
    return null;
  }
  let hit = cache.get(path);
  if (!hit) {
    hit = parse(path);
    if (hit) {
      cache.set(path, hit);
    }
  }
  if (!hit) {
    return null;
  }
  const len = hit.length;
  let last = obj;
  let i = 0;
  while (i < len) {
    const val = last[hit[i]];
    if (val === void 0) {
      return null;
    }
    last = val;
    i++;
  }
  return last;
}
const DEFAULT_MODIFIER = (str) => str;
const DEFAULT_MESSAGE = (ctx) => "";
const DEFAULT_MESSAGE_DATA_TYPE = "text";
const DEFAULT_NORMALIZE = (values) => values.length === 0 ? "" : values.join("");
const DEFAULT_INTERPOLATE = toDisplayString;
function pluralDefault(choice, choicesLength) {
  choice = Math.abs(choice);
  if (choicesLength === 2) {
    return choice ? choice > 1 ? 1 : 0 : 1;
  }
  return choice ? Math.min(choice, 2) : 0;
}
function getPluralIndex(options) {
  const index3 = isNumber(options.pluralIndex) ? options.pluralIndex : -1;
  return options.named && (isNumber(options.named.count) || isNumber(options.named.n)) ? isNumber(options.named.count) ? options.named.count : isNumber(options.named.n) ? options.named.n : index3 : index3;
}
function normalizeNamed(pluralIndex, props) {
  if (!props.count) {
    props.count = pluralIndex;
  }
  if (!props.n) {
    props.n = pluralIndex;
  }
}
function createMessageContext(options = {}) {
  const locale = options.locale;
  const pluralIndex = getPluralIndex(options);
  const pluralRule = isObject(options.pluralRules) && isString(locale) && isFunction(options.pluralRules[locale]) ? options.pluralRules[locale] : pluralDefault;
  const orgPluralRule = isObject(options.pluralRules) && isString(locale) && isFunction(options.pluralRules[locale]) ? pluralDefault : void 0;
  const plural = (messages2) => {
    return messages2[pluralRule(pluralIndex, messages2.length, orgPluralRule)];
  };
  const _list = options.list || [];
  const list = (index3) => _list[index3];
  const _named = options.named || {};
  isNumber(options.pluralIndex) && normalizeNamed(pluralIndex, _named);
  const named = (key) => _named[key];
  function message(key) {
    const msg = isFunction(options.messages) ? options.messages(key) : isObject(options.messages) ? options.messages[key] : false;
    return !msg ? options.parent ? options.parent.message(key) : DEFAULT_MESSAGE : msg;
  }
  const _modifier = (name) => options.modifiers ? options.modifiers[name] : DEFAULT_MODIFIER;
  const normalize = isPlainObject(options.processor) && isFunction(options.processor.normalize) ? options.processor.normalize : DEFAULT_NORMALIZE;
  const interpolate = isPlainObject(options.processor) && isFunction(options.processor.interpolate) ? options.processor.interpolate : DEFAULT_INTERPOLATE;
  const type = isPlainObject(options.processor) && isString(options.processor.type) ? options.processor.type : DEFAULT_MESSAGE_DATA_TYPE;
  const linked = (key, ...args) => {
    const [arg1, arg2] = args;
    let type2 = "text";
    let modifier = "";
    if (args.length === 1) {
      if (isObject(arg1)) {
        modifier = arg1.modifier || modifier;
        type2 = arg1.type || type2;
      } else if (isString(arg1)) {
        modifier = arg1 || modifier;
      }
    } else if (args.length === 2) {
      if (isString(arg1)) {
        modifier = arg1 || modifier;
      }
      if (isString(arg2)) {
        type2 = arg2 || type2;
      }
    }
    let msg = message(key)(ctx);
    if (type2 === "vnode" && isArray(msg) && modifier) {
      msg = msg[0];
    }
    return modifier ? _modifier(modifier)(msg, type2) : msg;
  };
  const ctx = {
    [
      "list"
      /* LIST */
    ]: list,
    [
      "named"
      /* NAMED */
    ]: named,
    [
      "plural"
      /* PLURAL */
    ]: plural,
    [
      "linked"
      /* LINKED */
    ]: linked,
    [
      "message"
      /* MESSAGE */
    ]: message,
    [
      "type"
      /* TYPE */
    ]: type,
    [
      "interpolate"
      /* INTERPOLATE */
    ]: interpolate,
    [
      "normalize"
      /* NORMALIZE */
    ]: normalize
  };
  return ctx;
}
let devtools = null;
function setDevToolsHook(hook) {
  devtools = hook;
}
function initI18nDevTools(i18n, version2, meta) {
  devtools && devtools.emit(IntlifyDevToolsHooks.I18nInit, {
    timestamp: Date.now(),
    i18n,
    version: version2,
    meta
  });
}
const translateDevTools = /* @__PURE__ */ createDevToolsHook(IntlifyDevToolsHooks.FunctionTranslate);
function createDevToolsHook(hook) {
  return (payloads) => devtools && devtools.emit(hook, payloads);
}
function fallbackWithSimple(ctx, fallback, start) {
  return [.../* @__PURE__ */ new Set([
    start,
    ...isArray(fallback) ? fallback : isObject(fallback) ? Object.keys(fallback) : isString(fallback) ? [fallback] : [start]
  ])];
}
function fallbackWithLocaleChain(ctx, fallback, start) {
  const startLocale = isString(start) ? start : DEFAULT_LOCALE;
  const context = ctx;
  if (!context.__localeChainCache) {
    context.__localeChainCache = /* @__PURE__ */ new Map();
  }
  let chain = context.__localeChainCache.get(startLocale);
  if (!chain) {
    chain = [];
    let block = [start];
    while (isArray(block)) {
      block = appendBlockToChain(chain, block, fallback);
    }
    const defaults = isArray(fallback) || !isPlainObject(fallback) ? fallback : fallback["default"] ? fallback["default"] : null;
    block = isString(defaults) ? [defaults] : defaults;
    if (isArray(block)) {
      appendBlockToChain(chain, block, false);
    }
    context.__localeChainCache.set(startLocale, chain);
  }
  return chain;
}
function appendBlockToChain(chain, block, blocks) {
  let follow = true;
  for (let i = 0; i < block.length && isBoolean(follow); i++) {
    const locale = block[i];
    if (isString(locale)) {
      follow = appendLocaleToChain(chain, block[i], blocks);
    }
  }
  return follow;
}
function appendLocaleToChain(chain, locale, blocks) {
  let follow;
  const tokens = locale.split("-");
  do {
    const target = tokens.join("-");
    follow = appendItemToChain(chain, target, blocks);
    tokens.splice(-1, 1);
  } while (tokens.length && follow === true);
  return follow;
}
function appendItemToChain(chain, target, blocks) {
  let follow = false;
  if (!chain.includes(target)) {
    follow = true;
    if (target) {
      follow = target[target.length - 1] !== "!";
      const locale = target.replace(/!/g, "");
      chain.push(locale);
      if ((isArray(blocks) || isPlainObject(blocks)) && blocks[locale]) {
        follow = blocks[locale];
      }
    }
  }
  return follow;
}
const VERSION$1 = "9.2.2";
const NOT_REOSLVED = -1;
const DEFAULT_LOCALE = "en-US";
const MISSING_RESOLVE_VALUE = "";
const capitalize = (str) => `${str.charAt(0).toLocaleUpperCase()}${str.substr(1)}`;
function getDefaultLinkedModifiers() {
  return {
    upper: (val, type) => {
      return type === "text" && isString(val) ? val.toUpperCase() : type === "vnode" && isObject(val) && "__v_isVNode" in val ? val.children.toUpperCase() : val;
    },
    lower: (val, type) => {
      return type === "text" && isString(val) ? val.toLowerCase() : type === "vnode" && isObject(val) && "__v_isVNode" in val ? val.children.toLowerCase() : val;
    },
    capitalize: (val, type) => {
      return type === "text" && isString(val) ? capitalize(val) : type === "vnode" && isObject(val) && "__v_isVNode" in val ? capitalize(val.children) : val;
    }
  };
}
let _compiler;
let _resolver;
function registerMessageResolver(resolver) {
  _resolver = resolver;
}
let _fallbacker;
function registerLocaleFallbacker(fallbacker) {
  _fallbacker = fallbacker;
}
let _additionalMeta = null;
const setAdditionalMeta = (meta) => {
  _additionalMeta = meta;
};
const getAdditionalMeta = () => _additionalMeta;
let _fallbackContext = null;
const setFallbackContext = (context) => {
  _fallbackContext = context;
};
const getFallbackContext = () => _fallbackContext;
let _cid = 0;
function createCoreContext(options = {}) {
  const version2 = isString(options.version) ? options.version : VERSION$1;
  const locale = isString(options.locale) ? options.locale : DEFAULT_LOCALE;
  const fallbackLocale = isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || isString(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : locale;
  const messages2 = isPlainObject(options.messages) ? options.messages : { [locale]: {} };
  const datetimeFormats = isPlainObject(options.datetimeFormats) ? options.datetimeFormats : { [locale]: {} };
  const numberFormats = isPlainObject(options.numberFormats) ? options.numberFormats : { [locale]: {} };
  const modifiers = assign({}, options.modifiers || {}, getDefaultLinkedModifiers());
  const pluralRules = options.pluralRules || {};
  const missing = isFunction(options.missing) ? options.missing : null;
  const missingWarn = isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
  const fallbackWarn = isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
  const fallbackFormat = !!options.fallbackFormat;
  const unresolving = !!options.unresolving;
  const postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
  const processor = isPlainObject(options.processor) ? options.processor : null;
  const warnHtmlMessage = isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
  const escapeParameter = !!options.escapeParameter;
  const messageCompiler = isFunction(options.messageCompiler) ? options.messageCompiler : _compiler;
  const messageResolver = isFunction(options.messageResolver) ? options.messageResolver : _resolver || resolveWithKeyValue;
  const localeFallbacker = isFunction(options.localeFallbacker) ? options.localeFallbacker : _fallbacker || fallbackWithSimple;
  const fallbackContext = isObject(options.fallbackContext) ? options.fallbackContext : void 0;
  const onWarn = isFunction(options.onWarn) ? options.onWarn : warn;
  const internalOptions = options;
  const __datetimeFormatters = isObject(internalOptions.__datetimeFormatters) ? internalOptions.__datetimeFormatters : /* @__PURE__ */ new Map();
  const __numberFormatters = isObject(internalOptions.__numberFormatters) ? internalOptions.__numberFormatters : /* @__PURE__ */ new Map();
  const __meta = isObject(internalOptions.__meta) ? internalOptions.__meta : {};
  _cid++;
  const context = {
    version: version2,
    cid: _cid,
    locale,
    fallbackLocale,
    messages: messages2,
    modifiers,
    pluralRules,
    missing,
    missingWarn,
    fallbackWarn,
    fallbackFormat,
    unresolving,
    postTranslation,
    processor,
    warnHtmlMessage,
    escapeParameter,
    messageCompiler,
    messageResolver,
    localeFallbacker,
    fallbackContext,
    onWarn,
    __meta
  };
  {
    context.datetimeFormats = datetimeFormats;
    context.numberFormats = numberFormats;
    context.__datetimeFormatters = __datetimeFormatters;
    context.__numberFormatters = __numberFormatters;
  }
  if (__INTLIFY_PROD_DEVTOOLS__) {
    initI18nDevTools(context, version2, __meta);
  }
  return context;
}
function handleMissing(context, key, locale, missingWarn, type) {
  const { missing, onWarn } = context;
  if (missing !== null) {
    const ret = missing(context, locale, key, type);
    return isString(ret) ? ret : key;
  } else {
    return key;
  }
}
function updateFallbackLocale(ctx, locale, fallback) {
  const context = ctx;
  context.__localeChainCache = /* @__PURE__ */ new Map();
  ctx.localeFallbacker(ctx, fallback, locale);
}
let code$2 = CompileErrorCodes.__EXTEND_POINT__;
const inc$2 = () => ++code$2;
const CoreErrorCodes = {
  INVALID_ARGUMENT: code$2,
  INVALID_DATE_ARGUMENT: inc$2(),
  INVALID_ISO_DATE_ARGUMENT: inc$2(),
  __EXTEND_POINT__: inc$2()
  // 18
};
function createCoreError(code2) {
  return createCompileError(code2, null, void 0);
}
const NOOP_MESSAGE_FUNCTION = () => "";
const isMessageFunction = (val) => isFunction(val);
function translate(context, ...args) {
  const { fallbackFormat, postTranslation, unresolving, messageCompiler, fallbackLocale, messages: messages2 } = context;
  const [key, options] = parseTranslateArgs(...args);
  const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
  const fallbackWarn = isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
  const escapeParameter = isBoolean(options.escapeParameter) ? options.escapeParameter : context.escapeParameter;
  const resolvedMessage = !!options.resolvedMessage;
  const defaultMsgOrKey = isString(options.default) || isBoolean(options.default) ? !isBoolean(options.default) ? options.default : !messageCompiler ? () => key : key : fallbackFormat ? !messageCompiler ? () => key : key : "";
  const enableDefaultMsg = fallbackFormat || defaultMsgOrKey !== "";
  const locale = isString(options.locale) ? options.locale : context.locale;
  escapeParameter && escapeParams(options);
  let [formatScope, targetLocale, message] = !resolvedMessage ? resolveMessageFormat(context, key, locale, fallbackLocale, fallbackWarn, missingWarn) : [
    key,
    locale,
    messages2[locale] || {}
  ];
  let format2 = formatScope;
  let cacheBaseKey = key;
  if (!resolvedMessage && !(isString(format2) || isMessageFunction(format2))) {
    if (enableDefaultMsg) {
      format2 = defaultMsgOrKey;
      cacheBaseKey = format2;
    }
  }
  if (!resolvedMessage && (!(isString(format2) || isMessageFunction(format2)) || !isString(targetLocale))) {
    return unresolving ? NOT_REOSLVED : key;
  }
  let occurred = false;
  const errorDetector = () => {
    occurred = true;
  };
  const msg = !isMessageFunction(format2) ? compileMessageFormat(context, key, targetLocale, format2, cacheBaseKey, errorDetector) : format2;
  if (occurred) {
    return format2;
  }
  const ctxOptions = getMessageContextOptions(context, targetLocale, message, options);
  const msgContext = createMessageContext(ctxOptions);
  const messaged = evaluateMessage(context, msg, msgContext);
  const ret = postTranslation ? postTranslation(messaged, key) : messaged;
  if (__INTLIFY_PROD_DEVTOOLS__) {
    const payloads = {
      timestamp: Date.now(),
      key: isString(key) ? key : isMessageFunction(format2) ? format2.key : "",
      locale: targetLocale || (isMessageFunction(format2) ? format2.locale : ""),
      format: isString(format2) ? format2 : isMessageFunction(format2) ? format2.source : "",
      message: ret
    };
    payloads.meta = assign({}, context.__meta, getAdditionalMeta() || {});
    translateDevTools(payloads);
  }
  return ret;
}
function escapeParams(options) {
  if (isArray(options.list)) {
    options.list = options.list.map((item) => isString(item) ? escapeHtml(item) : item);
  } else if (isObject(options.named)) {
    Object.keys(options.named).forEach((key) => {
      if (isString(options.named[key])) {
        options.named[key] = escapeHtml(options.named[key]);
      }
    });
  }
}
function resolveMessageFormat(context, key, locale, fallbackLocale, fallbackWarn, missingWarn) {
  const { messages: messages2, onWarn, messageResolver: resolveValue2, localeFallbacker } = context;
  const locales = localeFallbacker(context, fallbackLocale, locale);
  let message = {};
  let targetLocale;
  let format2 = null;
  const type = "translate";
  for (let i = 0; i < locales.length; i++) {
    targetLocale = locales[i];
    message = messages2[targetLocale] || {};
    if ((format2 = resolveValue2(message, key)) === null) {
      format2 = message[key];
    }
    if (isString(format2) || isFunction(format2))
      break;
    const missingRet = handleMissing(
      context,
      // eslint-disable-line @typescript-eslint/no-explicit-any
      key,
      targetLocale,
      missingWarn,
      type
    );
    if (missingRet !== key) {
      format2 = missingRet;
    }
  }
  return [format2, targetLocale, message];
}
function compileMessageFormat(context, key, targetLocale, format2, cacheBaseKey, errorDetector) {
  const { messageCompiler, warnHtmlMessage } = context;
  if (isMessageFunction(format2)) {
    const msg2 = format2;
    msg2.locale = msg2.locale || targetLocale;
    msg2.key = msg2.key || key;
    return msg2;
  }
  if (messageCompiler == null) {
    const msg2 = () => format2;
    msg2.locale = targetLocale;
    msg2.key = key;
    return msg2;
  }
  const msg = messageCompiler(format2, getCompileOptions(context, targetLocale, cacheBaseKey, format2, warnHtmlMessage, errorDetector));
  msg.locale = targetLocale;
  msg.key = key;
  msg.source = format2;
  return msg;
}
function evaluateMessage(context, msg, msgCtx) {
  const messaged = msg(msgCtx);
  return messaged;
}
function parseTranslateArgs(...args) {
  const [arg1, arg2, arg3] = args;
  const options = {};
  if (!isString(arg1) && !isNumber(arg1) && !isMessageFunction(arg1)) {
    throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
  }
  const key = isNumber(arg1) ? String(arg1) : isMessageFunction(arg1) ? arg1 : arg1;
  if (isNumber(arg2)) {
    options.plural = arg2;
  } else if (isString(arg2)) {
    options.default = arg2;
  } else if (isPlainObject(arg2) && !isEmptyObject(arg2)) {
    options.named = arg2;
  } else if (isArray(arg2)) {
    options.list = arg2;
  }
  if (isNumber(arg3)) {
    options.plural = arg3;
  } else if (isString(arg3)) {
    options.default = arg3;
  } else if (isPlainObject(arg3)) {
    assign(options, arg3);
  }
  return [key, options];
}
function getCompileOptions(context, locale, key, source, warnHtmlMessage, errorDetector) {
  return {
    warnHtmlMessage,
    onError: (err) => {
      errorDetector && errorDetector(err);
      {
        throw err;
      }
    },
    onCacheKey: (source2) => generateFormatCacheKey(locale, key, source2)
  };
}
function getMessageContextOptions(context, locale, message, options) {
  const { modifiers, pluralRules, messageResolver: resolveValue2, fallbackLocale, fallbackWarn, missingWarn, fallbackContext } = context;
  const resolveMessage = (key) => {
    let val = resolveValue2(message, key);
    if (val == null && fallbackContext) {
      const [, , message2] = resolveMessageFormat(fallbackContext, key, locale, fallbackLocale, fallbackWarn, missingWarn);
      val = resolveValue2(message2, key);
    }
    if (isString(val)) {
      let occurred = false;
      const errorDetector = () => {
        occurred = true;
      };
      const msg = compileMessageFormat(context, key, locale, val, key, errorDetector);
      return !occurred ? msg : NOOP_MESSAGE_FUNCTION;
    } else if (isMessageFunction(val)) {
      return val;
    } else {
      return NOOP_MESSAGE_FUNCTION;
    }
  };
  const ctxOptions = {
    locale,
    modifiers,
    pluralRules,
    messages: resolveMessage
  };
  if (context.processor) {
    ctxOptions.processor = context.processor;
  }
  if (options.list) {
    ctxOptions.list = options.list;
  }
  if (options.named) {
    ctxOptions.named = options.named;
  }
  if (isNumber(options.plural)) {
    ctxOptions.pluralIndex = options.plural;
  }
  return ctxOptions;
}
function datetime(context, ...args) {
  const { datetimeFormats, unresolving, fallbackLocale, onWarn, localeFallbacker } = context;
  const { __datetimeFormatters } = context;
  const [key, value, options, overrides] = parseDateTimeArgs(...args);
  const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
  isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
  const part = !!options.part;
  const locale = isString(options.locale) ? options.locale : context.locale;
  const locales = localeFallbacker(
    context,
    // eslint-disable-line @typescript-eslint/no-explicit-any
    fallbackLocale,
    locale
  );
  if (!isString(key) || key === "") {
    return new Intl.DateTimeFormat(locale, overrides).format(value);
  }
  let datetimeFormat = {};
  let targetLocale;
  let format2 = null;
  const type = "datetime format";
  for (let i = 0; i < locales.length; i++) {
    targetLocale = locales[i];
    datetimeFormat = datetimeFormats[targetLocale] || {};
    format2 = datetimeFormat[key];
    if (isPlainObject(format2))
      break;
    handleMissing(context, key, targetLocale, missingWarn, type);
  }
  if (!isPlainObject(format2) || !isString(targetLocale)) {
    return unresolving ? NOT_REOSLVED : key;
  }
  let id = `${targetLocale}__${key}`;
  if (!isEmptyObject(overrides)) {
    id = `${id}__${JSON.stringify(overrides)}`;
  }
  let formatter = __datetimeFormatters.get(id);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(targetLocale, assign({}, format2, overrides));
    __datetimeFormatters.set(id, formatter);
  }
  return !part ? formatter.format(value) : formatter.formatToParts(value);
}
const DATETIME_FORMAT_OPTIONS_KEYS = [
  "localeMatcher",
  "weekday",
  "era",
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
  "timeZoneName",
  "formatMatcher",
  "hour12",
  "timeZone",
  "dateStyle",
  "timeStyle",
  "calendar",
  "dayPeriod",
  "numberingSystem",
  "hourCycle",
  "fractionalSecondDigits"
];
function parseDateTimeArgs(...args) {
  const [arg1, arg2, arg3, arg4] = args;
  const options = {};
  let overrides = {};
  let value;
  if (isString(arg1)) {
    const matches = arg1.match(/(\d{4}-\d{2}-\d{2})(T|\s)?(.*)/);
    if (!matches) {
      throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
    }
    const dateTime = matches[3] ? matches[3].trim().startsWith("T") ? `${matches[1].trim()}${matches[3].trim()}` : `${matches[1].trim()}T${matches[3].trim()}` : matches[1].trim();
    value = new Date(dateTime);
    try {
      value.toISOString();
    } catch (e) {
      throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
    }
  } else if (isDate(arg1)) {
    if (isNaN(arg1.getTime())) {
      throw createCoreError(CoreErrorCodes.INVALID_DATE_ARGUMENT);
    }
    value = arg1;
  } else if (isNumber(arg1)) {
    value = arg1;
  } else {
    throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
  }
  if (isString(arg2)) {
    options.key = arg2;
  } else if (isPlainObject(arg2)) {
    Object.keys(arg2).forEach((key) => {
      if (DATETIME_FORMAT_OPTIONS_KEYS.includes(key)) {
        overrides[key] = arg2[key];
      } else {
        options[key] = arg2[key];
      }
    });
  }
  if (isString(arg3)) {
    options.locale = arg3;
  } else if (isPlainObject(arg3)) {
    overrides = arg3;
  }
  if (isPlainObject(arg4)) {
    overrides = arg4;
  }
  return [options.key || "", value, options, overrides];
}
function clearDateTimeFormat(ctx, locale, format2) {
  const context = ctx;
  for (const key in format2) {
    const id = `${locale}__${key}`;
    if (!context.__datetimeFormatters.has(id)) {
      continue;
    }
    context.__datetimeFormatters.delete(id);
  }
}
function number(context, ...args) {
  const { numberFormats, unresolving, fallbackLocale, onWarn, localeFallbacker } = context;
  const { __numberFormatters } = context;
  const [key, value, options, overrides] = parseNumberArgs(...args);
  const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
  isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
  const part = !!options.part;
  const locale = isString(options.locale) ? options.locale : context.locale;
  const locales = localeFallbacker(
    context,
    // eslint-disable-line @typescript-eslint/no-explicit-any
    fallbackLocale,
    locale
  );
  if (!isString(key) || key === "") {
    return new Intl.NumberFormat(locale, overrides).format(value);
  }
  let numberFormat = {};
  let targetLocale;
  let format2 = null;
  const type = "number format";
  for (let i = 0; i < locales.length; i++) {
    targetLocale = locales[i];
    numberFormat = numberFormats[targetLocale] || {};
    format2 = numberFormat[key];
    if (isPlainObject(format2))
      break;
    handleMissing(context, key, targetLocale, missingWarn, type);
  }
  if (!isPlainObject(format2) || !isString(targetLocale)) {
    return unresolving ? NOT_REOSLVED : key;
  }
  let id = `${targetLocale}__${key}`;
  if (!isEmptyObject(overrides)) {
    id = `${id}__${JSON.stringify(overrides)}`;
  }
  let formatter = __numberFormatters.get(id);
  if (!formatter) {
    formatter = new Intl.NumberFormat(targetLocale, assign({}, format2, overrides));
    __numberFormatters.set(id, formatter);
  }
  return !part ? formatter.format(value) : formatter.formatToParts(value);
}
const NUMBER_FORMAT_OPTIONS_KEYS = [
  "localeMatcher",
  "style",
  "currency",
  "currencyDisplay",
  "currencySign",
  "useGrouping",
  "minimumIntegerDigits",
  "minimumFractionDigits",
  "maximumFractionDigits",
  "minimumSignificantDigits",
  "maximumSignificantDigits",
  "compactDisplay",
  "notation",
  "signDisplay",
  "unit",
  "unitDisplay",
  "roundingMode",
  "roundingPriority",
  "roundingIncrement",
  "trailingZeroDisplay"
];
function parseNumberArgs(...args) {
  const [arg1, arg2, arg3, arg4] = args;
  const options = {};
  let overrides = {};
  if (!isNumber(arg1)) {
    throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
  }
  const value = arg1;
  if (isString(arg2)) {
    options.key = arg2;
  } else if (isPlainObject(arg2)) {
    Object.keys(arg2).forEach((key) => {
      if (NUMBER_FORMAT_OPTIONS_KEYS.includes(key)) {
        overrides[key] = arg2[key];
      } else {
        options[key] = arg2[key];
      }
    });
  }
  if (isString(arg3)) {
    options.locale = arg3;
  } else if (isPlainObject(arg3)) {
    overrides = arg3;
  }
  if (isPlainObject(arg4)) {
    overrides = arg4;
  }
  return [options.key || "", value, options, overrides];
}
function clearNumberFormat(ctx, locale, format2) {
  const context = ctx;
  for (const key in format2) {
    const id = `${locale}__${key}`;
    if (!context.__numberFormatters.has(id)) {
      continue;
    }
    context.__numberFormatters.delete(id);
  }
}
{
  if (typeof __INTLIFY_PROD_DEVTOOLS__ !== "boolean") {
    getGlobalThis().__INTLIFY_PROD_DEVTOOLS__ = false;
  }
}
/*!
  * vue-i18n v9.2.2
  * (c) 2022 kazuya kawaguchi
  * Released under the MIT License.
  */
const VERSION = "9.2.2";
function initFeatureFlags() {
  if (typeof __INTLIFY_PROD_DEVTOOLS__ !== "boolean") {
    getGlobalThis().__INTLIFY_PROD_DEVTOOLS__ = false;
  }
}
let code = CompileErrorCodes.__EXTEND_POINT__;
const inc = () => ++code;
const I18nErrorCodes = {
  // composer module errors
  UNEXPECTED_RETURN_TYPE: code,
  // legacy module errors
  INVALID_ARGUMENT: inc(),
  // i18n module errors
  MUST_BE_CALL_SETUP_TOP: inc(),
  NOT_INSLALLED: inc(),
  NOT_AVAILABLE_IN_LEGACY_MODE: inc(),
  // directive module errors
  REQUIRED_VALUE: inc(),
  INVALID_VALUE: inc(),
  // vue-devtools errors
  CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN: inc(),
  NOT_INSLALLED_WITH_PROVIDE: inc(),
  // unexpected error
  UNEXPECTED_ERROR: inc(),
  // not compatible legacy vue-i18n constructor
  NOT_COMPATIBLE_LEGACY_VUE_I18N: inc(),
  // bridge support vue 2.x only
  BRIDGE_SUPPORT_VUE_2_ONLY: inc(),
  // need to define `i18n` option in `allowComposition: true` and `useScope: 'local' at `useI18n``
  MUST_DEFINE_I18N_OPTION_IN_ALLOW_COMPOSITION: inc(),
  // Not available Compostion API in Legacy API mode. Please make sure that the legacy API mode is working properly
  NOT_AVAILABLE_COMPOSITION_IN_LEGACY: inc(),
  // for enhancement
  __EXTEND_POINT__: inc()
  // 29
};
function createI18nError(code2, ...args) {
  return createCompileError(code2, null, void 0);
}
const TransrateVNodeSymbol = /* @__PURE__ */ makeSymbol("__transrateVNode");
const DatetimePartsSymbol = /* @__PURE__ */ makeSymbol("__datetimeParts");
const NumberPartsSymbol = /* @__PURE__ */ makeSymbol("__numberParts");
const SetPluralRulesSymbol = makeSymbol("__setPluralRules");
const InejctWithOption = /* @__PURE__ */ makeSymbol("__injectWithOption");
function handleFlatJson(obj) {
  if (!isObject(obj)) {
    return obj;
  }
  for (const key in obj) {
    if (!hasOwn(obj, key)) {
      continue;
    }
    if (!key.includes(".")) {
      if (isObject(obj[key])) {
        handleFlatJson(obj[key]);
      }
    } else {
      const subKeys = key.split(".");
      const lastIndex = subKeys.length - 1;
      let currentObj = obj;
      for (let i = 0; i < lastIndex; i++) {
        if (!(subKeys[i] in currentObj)) {
          currentObj[subKeys[i]] = {};
        }
        currentObj = currentObj[subKeys[i]];
      }
      currentObj[subKeys[lastIndex]] = obj[key];
      delete obj[key];
      if (isObject(currentObj[subKeys[lastIndex]])) {
        handleFlatJson(currentObj[subKeys[lastIndex]]);
      }
    }
  }
  return obj;
}
function getLocaleMessages(locale, options) {
  const { messages: messages2, __i18n, messageResolver, flatJson } = options;
  const ret = isPlainObject(messages2) ? messages2 : isArray(__i18n) ? {} : { [locale]: {} };
  if (isArray(__i18n)) {
    __i18n.forEach((custom) => {
      if ("locale" in custom && "resource" in custom) {
        const { locale: locale2, resource: resource2 } = custom;
        if (locale2) {
          ret[locale2] = ret[locale2] || {};
          deepCopy(resource2, ret[locale2]);
        } else {
          deepCopy(resource2, ret);
        }
      } else {
        isString(custom) && deepCopy(JSON.parse(custom), ret);
      }
    });
  }
  if (messageResolver == null && flatJson) {
    for (const key in ret) {
      if (hasOwn(ret, key)) {
        handleFlatJson(ret[key]);
      }
    }
  }
  return ret;
}
const isNotObjectOrIsArray = (val) => !isObject(val) || isArray(val);
function deepCopy(src, des) {
  if (isNotObjectOrIsArray(src) || isNotObjectOrIsArray(des)) {
    throw createI18nError(I18nErrorCodes.INVALID_VALUE);
  }
  for (const key in src) {
    if (hasOwn(src, key)) {
      if (isNotObjectOrIsArray(src[key]) || isNotObjectOrIsArray(des[key])) {
        des[key] = src[key];
      } else {
        deepCopy(src[key], des[key]);
      }
    }
  }
}
function getComponentOptions(instance) {
  return instance.type;
}
function adjustI18nResources(global2, options, componentOptions) {
  let messages2 = isObject(options.messages) ? options.messages : {};
  if ("__i18nGlobal" in componentOptions) {
    messages2 = getLocaleMessages(globalThis.locale.value, {
      messages: messages2,
      __i18n: componentOptions.__i18nGlobal
    });
  }
  const locales = Object.keys(messages2);
  if (locales.length) {
    locales.forEach((locale) => {
      global2.mergeLocaleMessage(locale, messages2[locale]);
    });
  }
  {
    if (isObject(options.datetimeFormats)) {
      const locales2 = Object.keys(options.datetimeFormats);
      if (locales2.length) {
        locales2.forEach((locale) => {
          global2.mergeDateTimeFormat(locale, options.datetimeFormats[locale]);
        });
      }
    }
    if (isObject(options.numberFormats)) {
      const locales2 = Object.keys(options.numberFormats);
      if (locales2.length) {
        locales2.forEach((locale) => {
          global2.mergeNumberFormat(locale, options.numberFormats[locale]);
        });
      }
    }
  }
}
function createTextNode(key) {
  return createVNode(Text, null, key, 0);
}
const DEVTOOLS_META = "__INTLIFY_META__";
let composerID = 0;
function defineCoreMissingHandler(missing) {
  return (ctx, locale, key, type) => {
    return missing(locale, key, getCurrentInstance() || void 0, type);
  };
}
const getMetaInfo = () => {
  const instance = getCurrentInstance();
  let meta = null;
  return instance && (meta = getComponentOptions(instance)[DEVTOOLS_META]) ? { [DEVTOOLS_META]: meta } : null;
};
function createComposer(options = {}, VueI18nLegacy) {
  const { __root } = options;
  const _isGlobal = __root === void 0;
  let _inheritLocale = isBoolean(options.inheritLocale) ? options.inheritLocale : true;
  const _locale = ref(
    // prettier-ignore
    __root && _inheritLocale ? __root.locale.value : isString(options.locale) ? options.locale : DEFAULT_LOCALE
  );
  const _fallbackLocale = ref(
    // prettier-ignore
    __root && _inheritLocale ? __root.fallbackLocale.value : isString(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : _locale.value
  );
  const _messages = ref(getLocaleMessages(_locale.value, options));
  const _datetimeFormats = ref(isPlainObject(options.datetimeFormats) ? options.datetimeFormats : { [_locale.value]: {} });
  const _numberFormats = ref(isPlainObject(options.numberFormats) ? options.numberFormats : { [_locale.value]: {} });
  let _missingWarn = __root ? __root.missingWarn : isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
  let _fallbackWarn = __root ? __root.fallbackWarn : isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
  let _fallbackRoot = __root ? __root.fallbackRoot : isBoolean(options.fallbackRoot) ? options.fallbackRoot : true;
  let _fallbackFormat = !!options.fallbackFormat;
  let _missing = isFunction(options.missing) ? options.missing : null;
  let _runtimeMissing = isFunction(options.missing) ? defineCoreMissingHandler(options.missing) : null;
  let _postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
  let _warnHtmlMessage = __root ? __root.warnHtmlMessage : isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
  let _escapeParameter = !!options.escapeParameter;
  const _modifiers = __root ? __root.modifiers : isPlainObject(options.modifiers) ? options.modifiers : {};
  let _pluralRules = options.pluralRules || __root && __root.pluralRules;
  let _context;
  const getCoreContext = () => {
    _isGlobal && setFallbackContext(null);
    const ctxOptions = {
      version: VERSION,
      locale: _locale.value,
      fallbackLocale: _fallbackLocale.value,
      messages: _messages.value,
      modifiers: _modifiers,
      pluralRules: _pluralRules,
      missing: _runtimeMissing === null ? void 0 : _runtimeMissing,
      missingWarn: _missingWarn,
      fallbackWarn: _fallbackWarn,
      fallbackFormat: _fallbackFormat,
      unresolving: true,
      postTranslation: _postTranslation === null ? void 0 : _postTranslation,
      warnHtmlMessage: _warnHtmlMessage,
      escapeParameter: _escapeParameter,
      messageResolver: options.messageResolver,
      __meta: { framework: "vue" }
    };
    {
      ctxOptions.datetimeFormats = _datetimeFormats.value;
      ctxOptions.numberFormats = _numberFormats.value;
      ctxOptions.__datetimeFormatters = isPlainObject(_context) ? _context.__datetimeFormatters : void 0;
      ctxOptions.__numberFormatters = isPlainObject(_context) ? _context.__numberFormatters : void 0;
    }
    const ctx = createCoreContext(ctxOptions);
    _isGlobal && setFallbackContext(ctx);
    return ctx;
  };
  _context = getCoreContext();
  updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
  function trackReactivityValues() {
    return [
      _locale.value,
      _fallbackLocale.value,
      _messages.value,
      _datetimeFormats.value,
      _numberFormats.value
    ];
  }
  const locale = computed({
    get: () => _locale.value,
    set: (val) => {
      _locale.value = val;
      _context.locale = _locale.value;
    }
  });
  const fallbackLocale = computed({
    get: () => _fallbackLocale.value,
    set: (val) => {
      _fallbackLocale.value = val;
      _context.fallbackLocale = _fallbackLocale.value;
      updateFallbackLocale(_context, _locale.value, val);
    }
  });
  const messages2 = computed(() => _messages.value);
  const datetimeFormats = /* @__PURE__ */ computed(() => _datetimeFormats.value);
  const numberFormats = /* @__PURE__ */ computed(() => _numberFormats.value);
  function getPostTranslationHandler() {
    return isFunction(_postTranslation) ? _postTranslation : null;
  }
  function setPostTranslationHandler(handler2) {
    _postTranslation = handler2;
    _context.postTranslation = handler2;
  }
  function getMissingHandler() {
    return _missing;
  }
  function setMissingHandler(handler2) {
    if (handler2 !== null) {
      _runtimeMissing = defineCoreMissingHandler(handler2);
    }
    _missing = handler2;
    _context.missing = _runtimeMissing;
  }
  const wrapWithDeps = (fn, argumentParser, warnType, fallbackSuccess, fallbackFail, successCondition) => {
    trackReactivityValues();
    let ret;
    if (__INTLIFY_PROD_DEVTOOLS__) {
      try {
        setAdditionalMeta(getMetaInfo());
        if (!_isGlobal) {
          _context.fallbackContext = __root ? getFallbackContext() : void 0;
        }
        ret = fn(_context);
      } finally {
        setAdditionalMeta(null);
        if (!_isGlobal) {
          _context.fallbackContext = void 0;
        }
      }
    } else {
      ret = fn(_context);
    }
    if (isNumber(ret) && ret === NOT_REOSLVED) {
      const [key, arg2] = argumentParser();
      return __root && _fallbackRoot ? fallbackSuccess(__root) : fallbackFail(key);
    } else if (successCondition(ret)) {
      return ret;
    } else {
      throw createI18nError(I18nErrorCodes.UNEXPECTED_RETURN_TYPE);
    }
  };
  function t(...args) {
    return wrapWithDeps((context) => Reflect.apply(translate, null, [context, ...args]), () => parseTranslateArgs(...args), "translate", (root3) => Reflect.apply(root3.t, root3, [...args]), (key) => key, (val) => isString(val));
  }
  function rt(...args) {
    const [arg1, arg2, arg3] = args;
    if (arg3 && !isObject(arg3)) {
      throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT);
    }
    return t(...[arg1, arg2, assign({ resolvedMessage: true }, arg3 || {})]);
  }
  function d(...args) {
    return wrapWithDeps((context) => Reflect.apply(datetime, null, [context, ...args]), () => parseDateTimeArgs(...args), "datetime format", (root3) => Reflect.apply(root3.d, root3, [...args]), () => MISSING_RESOLVE_VALUE, (val) => isString(val));
  }
  function n(...args) {
    return wrapWithDeps((context) => Reflect.apply(number, null, [context, ...args]), () => parseNumberArgs(...args), "number format", (root3) => Reflect.apply(root3.n, root3, [...args]), () => MISSING_RESOLVE_VALUE, (val) => isString(val));
  }
  function normalize(values) {
    return values.map((val) => isString(val) || isNumber(val) || isBoolean(val) ? createTextNode(String(val)) : val);
  }
  const interpolate = (val) => val;
  const processor = {
    normalize,
    interpolate,
    type: "vnode"
  };
  function transrateVNode(...args) {
    return wrapWithDeps(
      (context) => {
        let ret;
        const _context2 = context;
        try {
          _context2.processor = processor;
          ret = Reflect.apply(translate, null, [_context2, ...args]);
        } finally {
          _context2.processor = null;
        }
        return ret;
      },
      () => parseTranslateArgs(...args),
      "translate",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (root3) => root3[TransrateVNodeSymbol](...args),
      (key) => [createTextNode(key)],
      (val) => isArray(val)
    );
  }
  function numberParts(...args) {
    return wrapWithDeps(
      (context) => Reflect.apply(number, null, [context, ...args]),
      () => parseNumberArgs(...args),
      "number format",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (root3) => root3[NumberPartsSymbol](...args),
      () => [],
      (val) => isString(val) || isArray(val)
    );
  }
  function datetimeParts(...args) {
    return wrapWithDeps(
      (context) => Reflect.apply(datetime, null, [context, ...args]),
      () => parseDateTimeArgs(...args),
      "datetime format",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (root3) => root3[DatetimePartsSymbol](...args),
      () => [],
      (val) => isString(val) || isArray(val)
    );
  }
  function setPluralRules(rules) {
    _pluralRules = rules;
    _context.pluralRules = _pluralRules;
  }
  function te(key, locale2) {
    const targetLocale = isString(locale2) ? locale2 : _locale.value;
    const message = getLocaleMessage(targetLocale);
    return _context.messageResolver(message, key) !== null;
  }
  function resolveMessages(key) {
    let messages3 = null;
    const locales = fallbackWithLocaleChain(_context, _fallbackLocale.value, _locale.value);
    for (let i = 0; i < locales.length; i++) {
      const targetLocaleMessages = _messages.value[locales[i]] || {};
      const messageValue = _context.messageResolver(targetLocaleMessages, key);
      if (messageValue != null) {
        messages3 = messageValue;
        break;
      }
    }
    return messages3;
  }
  function tm(key) {
    const messages3 = resolveMessages(key);
    return messages3 != null ? messages3 : __root ? __root.tm(key) || {} : {};
  }
  function getLocaleMessage(locale2) {
    return _messages.value[locale2] || {};
  }
  function setLocaleMessage(locale2, message) {
    _messages.value[locale2] = message;
    _context.messages = _messages.value;
  }
  function mergeLocaleMessage(locale2, message) {
    _messages.value[locale2] = _messages.value[locale2] || {};
    deepCopy(message, _messages.value[locale2]);
    _context.messages = _messages.value;
  }
  function getDateTimeFormat(locale2) {
    return _datetimeFormats.value[locale2] || {};
  }
  function setDateTimeFormat(locale2, format2) {
    _datetimeFormats.value[locale2] = format2;
    _context.datetimeFormats = _datetimeFormats.value;
    clearDateTimeFormat(_context, locale2, format2);
  }
  function mergeDateTimeFormat(locale2, format2) {
    _datetimeFormats.value[locale2] = assign(_datetimeFormats.value[locale2] || {}, format2);
    _context.datetimeFormats = _datetimeFormats.value;
    clearDateTimeFormat(_context, locale2, format2);
  }
  function getNumberFormat(locale2) {
    return _numberFormats.value[locale2] || {};
  }
  function setNumberFormat(locale2, format2) {
    _numberFormats.value[locale2] = format2;
    _context.numberFormats = _numberFormats.value;
    clearNumberFormat(_context, locale2, format2);
  }
  function mergeNumberFormat(locale2, format2) {
    _numberFormats.value[locale2] = assign(_numberFormats.value[locale2] || {}, format2);
    _context.numberFormats = _numberFormats.value;
    clearNumberFormat(_context, locale2, format2);
  }
  composerID++;
  if (__root && inBrowser) {
    watch(__root.locale, (val) => {
      if (_inheritLocale) {
        _locale.value = val;
        _context.locale = val;
        updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
      }
    });
    watch(__root.fallbackLocale, (val) => {
      if (_inheritLocale) {
        _fallbackLocale.value = val;
        _context.fallbackLocale = val;
        updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
      }
    });
  }
  const composer = {
    id: composerID,
    locale,
    fallbackLocale,
    get inheritLocale() {
      return _inheritLocale;
    },
    set inheritLocale(val) {
      _inheritLocale = val;
      if (val && __root) {
        _locale.value = __root.locale.value;
        _fallbackLocale.value = __root.fallbackLocale.value;
        updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
      }
    },
    get availableLocales() {
      return Object.keys(_messages.value).sort();
    },
    messages: messages2,
    get modifiers() {
      return _modifiers;
    },
    get pluralRules() {
      return _pluralRules || {};
    },
    get isGlobal() {
      return _isGlobal;
    },
    get missingWarn() {
      return _missingWarn;
    },
    set missingWarn(val) {
      _missingWarn = val;
      _context.missingWarn = _missingWarn;
    },
    get fallbackWarn() {
      return _fallbackWarn;
    },
    set fallbackWarn(val) {
      _fallbackWarn = val;
      _context.fallbackWarn = _fallbackWarn;
    },
    get fallbackRoot() {
      return _fallbackRoot;
    },
    set fallbackRoot(val) {
      _fallbackRoot = val;
    },
    get fallbackFormat() {
      return _fallbackFormat;
    },
    set fallbackFormat(val) {
      _fallbackFormat = val;
      _context.fallbackFormat = _fallbackFormat;
    },
    get warnHtmlMessage() {
      return _warnHtmlMessage;
    },
    set warnHtmlMessage(val) {
      _warnHtmlMessage = val;
      _context.warnHtmlMessage = val;
    },
    get escapeParameter() {
      return _escapeParameter;
    },
    set escapeParameter(val) {
      _escapeParameter = val;
      _context.escapeParameter = val;
    },
    t,
    getLocaleMessage,
    setLocaleMessage,
    mergeLocaleMessage,
    getPostTranslationHandler,
    setPostTranslationHandler,
    getMissingHandler,
    setMissingHandler,
    [SetPluralRulesSymbol]: setPluralRules
  };
  {
    composer.datetimeFormats = datetimeFormats;
    composer.numberFormats = numberFormats;
    composer.rt = rt;
    composer.te = te;
    composer.tm = tm;
    composer.d = d;
    composer.n = n;
    composer.getDateTimeFormat = getDateTimeFormat;
    composer.setDateTimeFormat = setDateTimeFormat;
    composer.mergeDateTimeFormat = mergeDateTimeFormat;
    composer.getNumberFormat = getNumberFormat;
    composer.setNumberFormat = setNumberFormat;
    composer.mergeNumberFormat = mergeNumberFormat;
    composer[InejctWithOption] = options.__injectWithOption;
    composer[TransrateVNodeSymbol] = transrateVNode;
    composer[DatetimePartsSymbol] = datetimeParts;
    composer[NumberPartsSymbol] = numberParts;
  }
  return composer;
}
function convertComposerOptions(options) {
  const locale = isString(options.locale) ? options.locale : DEFAULT_LOCALE;
  const fallbackLocale = isString(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : locale;
  const missing = isFunction(options.missing) ? options.missing : void 0;
  const missingWarn = isBoolean(options.silentTranslationWarn) || isRegExp(options.silentTranslationWarn) ? !options.silentTranslationWarn : true;
  const fallbackWarn = isBoolean(options.silentFallbackWarn) || isRegExp(options.silentFallbackWarn) ? !options.silentFallbackWarn : true;
  const fallbackRoot = isBoolean(options.fallbackRoot) ? options.fallbackRoot : true;
  const fallbackFormat = !!options.formatFallbackMessages;
  const modifiers = isPlainObject(options.modifiers) ? options.modifiers : {};
  const pluralizationRules = options.pluralizationRules;
  const postTranslation = isFunction(options.postTranslation) ? options.postTranslation : void 0;
  const warnHtmlMessage = isString(options.warnHtmlInMessage) ? options.warnHtmlInMessage !== "off" : true;
  const escapeParameter = !!options.escapeParameterHtml;
  const inheritLocale = isBoolean(options.sync) ? options.sync : true;
  let messages2 = options.messages;
  if (isPlainObject(options.sharedMessages)) {
    const sharedMessages = options.sharedMessages;
    const locales = Object.keys(sharedMessages);
    messages2 = locales.reduce((messages3, locale2) => {
      const message = messages3[locale2] || (messages3[locale2] = {});
      assign(message, sharedMessages[locale2]);
      return messages3;
    }, messages2 || {});
  }
  const { __i18n, __root, __injectWithOption } = options;
  const datetimeFormats = options.datetimeFormats;
  const numberFormats = options.numberFormats;
  const flatJson = options.flatJson;
  return {
    locale,
    fallbackLocale,
    messages: messages2,
    flatJson,
    datetimeFormats,
    numberFormats,
    missing,
    missingWarn,
    fallbackWarn,
    fallbackRoot,
    fallbackFormat,
    modifiers,
    pluralRules: pluralizationRules,
    postTranslation,
    warnHtmlMessage,
    escapeParameter,
    messageResolver: options.messageResolver,
    inheritLocale,
    __i18n,
    __root,
    __injectWithOption
  };
}
function createVueI18n(options = {}, VueI18nLegacy) {
  {
    const composer = createComposer(convertComposerOptions(options));
    const vueI18n = {
      // id
      id: composer.id,
      // locale
      get locale() {
        return composer.locale.value;
      },
      set locale(val) {
        composer.locale.value = val;
      },
      // fallbackLocale
      get fallbackLocale() {
        return composer.fallbackLocale.value;
      },
      set fallbackLocale(val) {
        composer.fallbackLocale.value = val;
      },
      // messages
      get messages() {
        return composer.messages.value;
      },
      // datetimeFormats
      get datetimeFormats() {
        return composer.datetimeFormats.value;
      },
      // numberFormats
      get numberFormats() {
        return composer.numberFormats.value;
      },
      // availableLocales
      get availableLocales() {
        return composer.availableLocales;
      },
      // formatter
      get formatter() {
        return {
          interpolate() {
            return [];
          }
        };
      },
      set formatter(val) {
      },
      // missing
      get missing() {
        return composer.getMissingHandler();
      },
      set missing(handler2) {
        composer.setMissingHandler(handler2);
      },
      // silentTranslationWarn
      get silentTranslationWarn() {
        return isBoolean(composer.missingWarn) ? !composer.missingWarn : composer.missingWarn;
      },
      set silentTranslationWarn(val) {
        composer.missingWarn = isBoolean(val) ? !val : val;
      },
      // silentFallbackWarn
      get silentFallbackWarn() {
        return isBoolean(composer.fallbackWarn) ? !composer.fallbackWarn : composer.fallbackWarn;
      },
      set silentFallbackWarn(val) {
        composer.fallbackWarn = isBoolean(val) ? !val : val;
      },
      // modifiers
      get modifiers() {
        return composer.modifiers;
      },
      // formatFallbackMessages
      get formatFallbackMessages() {
        return composer.fallbackFormat;
      },
      set formatFallbackMessages(val) {
        composer.fallbackFormat = val;
      },
      // postTranslation
      get postTranslation() {
        return composer.getPostTranslationHandler();
      },
      set postTranslation(handler2) {
        composer.setPostTranslationHandler(handler2);
      },
      // sync
      get sync() {
        return composer.inheritLocale;
      },
      set sync(val) {
        composer.inheritLocale = val;
      },
      // warnInHtmlMessage
      get warnHtmlInMessage() {
        return composer.warnHtmlMessage ? "warn" : "off";
      },
      set warnHtmlInMessage(val) {
        composer.warnHtmlMessage = val !== "off";
      },
      // escapeParameterHtml
      get escapeParameterHtml() {
        return composer.escapeParameter;
      },
      set escapeParameterHtml(val) {
        composer.escapeParameter = val;
      },
      // preserveDirectiveContent
      get preserveDirectiveContent() {
        return true;
      },
      set preserveDirectiveContent(val) {
      },
      // pluralizationRules
      get pluralizationRules() {
        return composer.pluralRules || {};
      },
      // for internal
      __composer: composer,
      // t
      t(...args) {
        const [arg1, arg2, arg3] = args;
        const options2 = {};
        let list = null;
        let named = null;
        if (!isString(arg1)) {
          throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT);
        }
        const key = arg1;
        if (isString(arg2)) {
          options2.locale = arg2;
        } else if (isArray(arg2)) {
          list = arg2;
        } else if (isPlainObject(arg2)) {
          named = arg2;
        }
        if (isArray(arg3)) {
          list = arg3;
        } else if (isPlainObject(arg3)) {
          named = arg3;
        }
        return Reflect.apply(composer.t, composer, [
          key,
          list || named || {},
          options2
        ]);
      },
      rt(...args) {
        return Reflect.apply(composer.rt, composer, [...args]);
      },
      // tc
      tc(...args) {
        const [arg1, arg2, arg3] = args;
        const options2 = { plural: 1 };
        let list = null;
        let named = null;
        if (!isString(arg1)) {
          throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT);
        }
        const key = arg1;
        if (isString(arg2)) {
          options2.locale = arg2;
        } else if (isNumber(arg2)) {
          options2.plural = arg2;
        } else if (isArray(arg2)) {
          list = arg2;
        } else if (isPlainObject(arg2)) {
          named = arg2;
        }
        if (isString(arg3)) {
          options2.locale = arg3;
        } else if (isArray(arg3)) {
          list = arg3;
        } else if (isPlainObject(arg3)) {
          named = arg3;
        }
        return Reflect.apply(composer.t, composer, [
          key,
          list || named || {},
          options2
        ]);
      },
      // te
      te(key, locale) {
        return composer.te(key, locale);
      },
      // tm
      tm(key) {
        return composer.tm(key);
      },
      // getLocaleMessage
      getLocaleMessage(locale) {
        return composer.getLocaleMessage(locale);
      },
      // setLocaleMessage
      setLocaleMessage(locale, message) {
        composer.setLocaleMessage(locale, message);
      },
      // mergeLocaleMessage
      mergeLocaleMessage(locale, message) {
        composer.mergeLocaleMessage(locale, message);
      },
      // d
      d(...args) {
        return Reflect.apply(composer.d, composer, [...args]);
      },
      // getDateTimeFormat
      getDateTimeFormat(locale) {
        return composer.getDateTimeFormat(locale);
      },
      // setDateTimeFormat
      setDateTimeFormat(locale, format2) {
        composer.setDateTimeFormat(locale, format2);
      },
      // mergeDateTimeFormat
      mergeDateTimeFormat(locale, format2) {
        composer.mergeDateTimeFormat(locale, format2);
      },
      // n
      n(...args) {
        return Reflect.apply(composer.n, composer, [...args]);
      },
      // getNumberFormat
      getNumberFormat(locale) {
        return composer.getNumberFormat(locale);
      },
      // setNumberFormat
      setNumberFormat(locale, format2) {
        composer.setNumberFormat(locale, format2);
      },
      // mergeNumberFormat
      mergeNumberFormat(locale, format2) {
        composer.mergeNumberFormat(locale, format2);
      },
      // getChoiceIndex
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getChoiceIndex(choice, choicesLength) {
        return -1;
      },
      // for internal
      __onComponentInstanceCreated(target) {
        const { componentInstanceCreatedListener } = options;
        if (componentInstanceCreatedListener) {
          componentInstanceCreatedListener(target, vueI18n);
        }
      }
    };
    return vueI18n;
  }
}
const baseFormatProps = {
  tag: {
    type: [String, Object]
  },
  locale: {
    type: String
  },
  scope: {
    type: String,
    // NOTE: avoid https://github.com/microsoft/rushstack/issues/1050
    validator: (val) => val === "parent" || val === "global",
    default: "parent"
    /* ComponetI18nScope */
  },
  i18n: {
    type: Object
  }
};
function getInterpolateArg({ slots }, keys) {
  if (keys.length === 1 && keys[0] === "default") {
    const ret = slots.default ? slots.default() : [];
    return ret.reduce((slot, current) => {
      return slot = [
        ...slot,
        ...isArray(current.children) ? current.children : [current]
      ];
    }, []);
  } else {
    return keys.reduce((arg, key) => {
      const slot = slots[key];
      if (slot) {
        arg[key] = slot();
      }
      return arg;
    }, {});
  }
}
function getFragmentableTag(tag) {
  return Fragment;
}
const Translation = (
  /* defineComponent */
  {
    /* eslint-disable */
    name: "i18n-t",
    props: assign({
      keypath: {
        type: String,
        required: true
      },
      plural: {
        type: [Number, String],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validator: (val) => isNumber(val) || !isNaN(val)
      }
    }, baseFormatProps),
    /* eslint-enable */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setup(props, context) {
      const { slots, attrs } = context;
      const i18n = props.i18n || useI18n({
        useScope: props.scope,
        __useComponent: true
      });
      return () => {
        const keys = Object.keys(slots).filter((key) => key !== "_");
        const options = {};
        if (props.locale) {
          options.locale = props.locale;
        }
        if (props.plural !== void 0) {
          options.plural = isString(props.plural) ? +props.plural : props.plural;
        }
        const arg = getInterpolateArg(context, keys);
        const children = i18n[TransrateVNodeSymbol](props.keypath, arg, options);
        const assignedAttrs = assign({}, attrs);
        const tag = isString(props.tag) || isObject(props.tag) ? props.tag : getFragmentableTag();
        return h(tag, assignedAttrs, children);
      };
    }
  }
);
function isVNode(target) {
  return isArray(target) && !isString(target[0]);
}
function renderFormatter(props, context, slotKeys, partFormatter) {
  const { slots, attrs } = context;
  return () => {
    const options = { part: true };
    let overrides = {};
    if (props.locale) {
      options.locale = props.locale;
    }
    if (isString(props.format)) {
      options.key = props.format;
    } else if (isObject(props.format)) {
      if (isString(props.format.key)) {
        options.key = props.format.key;
      }
      overrides = Object.keys(props.format).reduce((options2, prop) => {
        return slotKeys.includes(prop) ? assign({}, options2, { [prop]: props.format[prop] }) : options2;
      }, {});
    }
    const parts = partFormatter(...[props.value, options, overrides]);
    let children = [options.key];
    if (isArray(parts)) {
      children = parts.map((part, index3) => {
        const slot = slots[part.type];
        const node = slot ? slot({ [part.type]: part.value, index: index3, parts }) : [part.value];
        if (isVNode(node)) {
          node[0].key = `${part.type}-${index3}`;
        }
        return node;
      });
    } else if (isString(parts)) {
      children = [parts];
    }
    const assignedAttrs = assign({}, attrs);
    const tag = isString(props.tag) || isObject(props.tag) ? props.tag : getFragmentableTag();
    return h(tag, assignedAttrs, children);
  };
}
const NumberFormat = (
  /* defineComponent */
  {
    /* eslint-disable */
    name: "i18n-n",
    props: assign({
      value: {
        type: Number,
        required: true
      },
      format: {
        type: [String, Object]
      }
    }, baseFormatProps),
    /* eslint-enable */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setup(props, context) {
      const i18n = props.i18n || useI18n({ useScope: "parent", __useComponent: true });
      return renderFormatter(props, context, NUMBER_FORMAT_OPTIONS_KEYS, (...args) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18n[NumberPartsSymbol](...args)
      ));
    }
  }
);
const DatetimeFormat = (
  /*defineComponent */
  {
    /* eslint-disable */
    name: "i18n-d",
    props: assign({
      value: {
        type: [Number, Date],
        required: true
      },
      format: {
        type: [String, Object]
      }
    }, baseFormatProps),
    /* eslint-enable */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setup(props, context) {
      const i18n = props.i18n || useI18n({ useScope: "parent", __useComponent: true });
      return renderFormatter(props, context, DATETIME_FORMAT_OPTIONS_KEYS, (...args) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18n[DatetimePartsSymbol](...args)
      ));
    }
  }
);
function getComposer$2(i18n, instance) {
  const i18nInternal = i18n;
  if (i18n.mode === "composition") {
    return i18nInternal.__getInstance(instance) || i18n.global;
  } else {
    const vueI18n = i18nInternal.__getInstance(instance);
    return vueI18n != null ? vueI18n.__composer : i18n.global.__composer;
  }
}
function vTDirective(i18n) {
  const _process = (binding) => {
    const { instance, modifiers, value } = binding;
    if (!instance || !instance.$) {
      throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
    }
    const composer = getComposer$2(i18n, instance.$);
    const parsedValue = parseValue(value);
    return [
      Reflect.apply(composer.t, composer, [...makeParams(parsedValue)]),
      composer
    ];
  };
  const register = (el, binding) => {
    const [textContent, composer] = _process(binding);
    el.__composer = composer;
    el.textContent = textContent;
  };
  const unregister = (el) => {
    if (el.__composer) {
      el.__composer = void 0;
      delete el.__composer;
    }
  };
  const update = (el, { value }) => {
    if (el.__composer) {
      const composer = el.__composer;
      const parsedValue = parseValue(value);
      el.textContent = Reflect.apply(composer.t, composer, [
        ...makeParams(parsedValue)
      ]);
    }
  };
  const getSSRProps = (binding) => {
    const [textContent] = _process(binding);
    return { textContent };
  };
  return {
    created: register,
    unmounted: unregister,
    beforeUpdate: update,
    getSSRProps
  };
}
function parseValue(value) {
  if (isString(value)) {
    return { path: value };
  } else if (isPlainObject(value)) {
    if (!("path" in value)) {
      throw createI18nError(I18nErrorCodes.REQUIRED_VALUE, "path");
    }
    return value;
  } else {
    throw createI18nError(I18nErrorCodes.INVALID_VALUE);
  }
}
function makeParams(value) {
  const { path, locale, args, choice, plural } = value;
  const options = {};
  const named = args || {};
  if (isString(locale)) {
    options.locale = locale;
  }
  if (isNumber(choice)) {
    options.plural = choice;
  }
  if (isNumber(plural)) {
    options.plural = plural;
  }
  return [path, named, options];
}
function apply(app, i18n, ...options) {
  const pluginOptions = isPlainObject(options[0]) ? options[0] : {};
  const useI18nComponentName = !!pluginOptions.useI18nComponentName;
  const globalInstall = isBoolean(pluginOptions.globalInstall) ? pluginOptions.globalInstall : true;
  if (globalInstall) {
    app.component(!useI18nComponentName ? Translation.name : "i18n", Translation);
    app.component(NumberFormat.name, NumberFormat);
    app.component(DatetimeFormat.name, DatetimeFormat);
  }
  {
    app.directive("t", vTDirective(i18n));
  }
}
function defineMixin(vuei18n, composer, i18n) {
  return {
    beforeCreate() {
      const instance = getCurrentInstance();
      if (!instance) {
        throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
      }
      const options = this.$options;
      if (options.i18n) {
        const optionsI18n = options.i18n;
        if (options.__i18n) {
          optionsI18n.__i18n = options.__i18n;
        }
        optionsI18n.__root = composer;
        if (this === this.$root) {
          this.$i18n = mergeToRoot(vuei18n, optionsI18n);
        } else {
          optionsI18n.__injectWithOption = true;
          this.$i18n = createVueI18n(optionsI18n);
        }
      } else if (options.__i18n) {
        if (this === this.$root) {
          this.$i18n = mergeToRoot(vuei18n, options);
        } else {
          this.$i18n = createVueI18n({
            __i18n: options.__i18n,
            __injectWithOption: true,
            __root: composer
          });
        }
      } else {
        this.$i18n = vuei18n;
      }
      if (options.__i18nGlobal) {
        adjustI18nResources(composer, options, options);
      }
      vuei18n.__onComponentInstanceCreated(this.$i18n);
      i18n.__setInstance(instance, this.$i18n);
      this.$t = (...args) => this.$i18n.t(...args);
      this.$rt = (...args) => this.$i18n.rt(...args);
      this.$tc = (...args) => this.$i18n.tc(...args);
      this.$te = (key, locale) => this.$i18n.te(key, locale);
      this.$d = (...args) => this.$i18n.d(...args);
      this.$n = (...args) => this.$i18n.n(...args);
      this.$tm = (key) => this.$i18n.tm(key);
    },
    mounted() {
    },
    unmounted() {
      const instance = getCurrentInstance();
      if (!instance) {
        throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
      }
      delete this.$t;
      delete this.$rt;
      delete this.$tc;
      delete this.$te;
      delete this.$d;
      delete this.$n;
      delete this.$tm;
      i18n.__deleteInstance(instance);
      delete this.$i18n;
    }
  };
}
function mergeToRoot(root3, options) {
  root3.locale = options.locale || root3.locale;
  root3.fallbackLocale = options.fallbackLocale || root3.fallbackLocale;
  root3.missing = options.missing || root3.missing;
  root3.silentTranslationWarn = options.silentTranslationWarn || root3.silentFallbackWarn;
  root3.silentFallbackWarn = options.silentFallbackWarn || root3.silentFallbackWarn;
  root3.formatFallbackMessages = options.formatFallbackMessages || root3.formatFallbackMessages;
  root3.postTranslation = options.postTranslation || root3.postTranslation;
  root3.warnHtmlInMessage = options.warnHtmlInMessage || root3.warnHtmlInMessage;
  root3.escapeParameterHtml = options.escapeParameterHtml || root3.escapeParameterHtml;
  root3.sync = options.sync || root3.sync;
  root3.__composer[SetPluralRulesSymbol](options.pluralizationRules || root3.pluralizationRules);
  const messages2 = getLocaleMessages(root3.locale, {
    messages: options.messages,
    __i18n: options.__i18n
  });
  Object.keys(messages2).forEach((locale) => root3.mergeLocaleMessage(locale, messages2[locale]));
  if (options.datetimeFormats) {
    Object.keys(options.datetimeFormats).forEach((locale) => root3.mergeDateTimeFormat(locale, options.datetimeFormats[locale]));
  }
  if (options.numberFormats) {
    Object.keys(options.numberFormats).forEach((locale) => root3.mergeNumberFormat(locale, options.numberFormats[locale]));
  }
  return root3;
}
const I18nInjectionKey = /* @__PURE__ */ makeSymbol("global-vue-i18n");
function createI18n(options = {}, VueI18nLegacy) {
  const __legacyMode = isBoolean(options.legacy) ? options.legacy : true;
  const __globalInjection = isBoolean(options.globalInjection) ? options.globalInjection : true;
  const __allowComposition = __legacyMode ? !!options.allowComposition : true;
  const __instances = /* @__PURE__ */ new Map();
  const [globalScope, __global] = createGlobal(options, __legacyMode);
  const symbol = makeSymbol("");
  function __getInstance(component) {
    return __instances.get(component) || null;
  }
  function __setInstance(component, instance) {
    __instances.set(component, instance);
  }
  function __deleteInstance(component) {
    __instances.delete(component);
  }
  {
    const i18n = {
      // mode
      get mode() {
        return __legacyMode ? "legacy" : "composition";
      },
      // allowComposition
      get allowComposition() {
        return __allowComposition;
      },
      // install plugin
      async install(app, ...options2) {
        app.__VUE_I18N_SYMBOL__ = symbol;
        app.provide(app.__VUE_I18N_SYMBOL__, i18n);
        if (!__legacyMode && __globalInjection) {
          injectGlobalFields(app, i18n.global);
        }
        {
          apply(app, i18n, ...options2);
        }
        if (__legacyMode) {
          app.mixin(defineMixin(__global, __global.__composer, i18n));
        }
        const unmountApp = app.unmount;
        app.unmount = () => {
          i18n.dispose();
          unmountApp();
        };
      },
      // global accessor
      get global() {
        return __global;
      },
      dispose() {
        globalScope.stop();
      },
      // @internal
      __instances,
      // @internal
      __getInstance,
      // @internal
      __setInstance,
      // @internal
      __deleteInstance
    };
    return i18n;
  }
}
function useI18n(options = {}) {
  const instance = getCurrentInstance();
  if (instance == null) {
    throw createI18nError(I18nErrorCodes.MUST_BE_CALL_SETUP_TOP);
  }
  if (!instance.isCE && instance.appContext.app != null && !instance.appContext.app.__VUE_I18N_SYMBOL__) {
    throw createI18nError(I18nErrorCodes.NOT_INSLALLED);
  }
  const i18n = getI18nInstance(instance);
  const global2 = getGlobalComposer(i18n);
  const componentOptions = getComponentOptions(instance);
  const scope = getScope(options, componentOptions);
  {
    if (i18n.mode === "legacy" && !options.__useComponent) {
      if (!i18n.allowComposition) {
        throw createI18nError(I18nErrorCodes.NOT_AVAILABLE_IN_LEGACY_MODE);
      }
      return useI18nForLegacy(instance, scope, global2, options);
    }
  }
  if (scope === "global") {
    adjustI18nResources(global2, options, componentOptions);
    return global2;
  }
  if (scope === "parent") {
    let composer2 = getComposer(i18n, instance, options.__useComponent);
    if (composer2 == null) {
      composer2 = global2;
    }
    return composer2;
  }
  const i18nInternal = i18n;
  let composer = i18nInternal.__getInstance(instance);
  if (composer == null) {
    const composerOptions = assign({}, options);
    if ("__i18n" in componentOptions) {
      composerOptions.__i18n = componentOptions.__i18n;
    }
    if (global2) {
      composerOptions.__root = global2;
    }
    composer = createComposer(composerOptions);
    setupLifeCycle(i18nInternal, instance);
    i18nInternal.__setInstance(instance, composer);
  }
  return composer;
}
function createGlobal(options, legacyMode, VueI18nLegacy) {
  const scope = effectScope();
  {
    const obj = legacyMode ? scope.run(() => createVueI18n(options)) : scope.run(() => createComposer(options));
    if (obj == null) {
      throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
    }
    return [scope, obj];
  }
}
function getI18nInstance(instance) {
  {
    const i18n = inject(!instance.isCE ? instance.appContext.app.__VUE_I18N_SYMBOL__ : I18nInjectionKey);
    if (!i18n) {
      throw createI18nError(!instance.isCE ? I18nErrorCodes.UNEXPECTED_ERROR : I18nErrorCodes.NOT_INSLALLED_WITH_PROVIDE);
    }
    return i18n;
  }
}
function getScope(options, componentOptions) {
  return isEmptyObject(options) ? "__i18n" in componentOptions ? "local" : "global" : !options.useScope ? "local" : options.useScope;
}
function getGlobalComposer(i18n) {
  return i18n.mode === "composition" ? i18n.global : i18n.global.__composer;
}
function getComposer(i18n, target, useComponent = false) {
  let composer = null;
  const root3 = target.root;
  let current = target.parent;
  while (current != null) {
    const i18nInternal = i18n;
    if (i18n.mode === "composition") {
      composer = i18nInternal.__getInstance(current);
    } else {
      {
        const vueI18n = i18nInternal.__getInstance(current);
        if (vueI18n != null) {
          composer = vueI18n.__composer;
          if (useComponent && composer && !composer[InejctWithOption]) {
            composer = null;
          }
        }
      }
    }
    if (composer != null) {
      break;
    }
    if (root3 === current) {
      break;
    }
    current = current.parent;
  }
  return composer;
}
function setupLifeCycle(i18n, target, composer) {
  {
    onUnmounted(() => {
      i18n.__deleteInstance(target);
    }, target);
  }
}
function useI18nForLegacy(instance, scope, root3, options = {}) {
  const isLocale = scope === "local";
  const _composer = shallowRef(null);
  if (isLocale && instance.proxy && !(instance.proxy.$options.i18n || instance.proxy.$options.__i18n)) {
    throw createI18nError(I18nErrorCodes.MUST_DEFINE_I18N_OPTION_IN_ALLOW_COMPOSITION);
  }
  const _inheritLocale = isBoolean(options.inheritLocale) ? options.inheritLocale : true;
  const _locale = ref(
    // prettier-ignore
    isLocale && _inheritLocale ? root3.locale.value : isString(options.locale) ? options.locale : DEFAULT_LOCALE
  );
  const _fallbackLocale = ref(
    // prettier-ignore
    isLocale && _inheritLocale ? root3.fallbackLocale.value : isString(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : _locale.value
  );
  const _messages = ref(getLocaleMessages(_locale.value, options));
  const _datetimeFormats = ref(isPlainObject(options.datetimeFormats) ? options.datetimeFormats : { [_locale.value]: {} });
  const _numberFormats = ref(isPlainObject(options.numberFormats) ? options.numberFormats : { [_locale.value]: {} });
  const _missingWarn = isLocale ? root3.missingWarn : isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
  const _fallbackWarn = isLocale ? root3.fallbackWarn : isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
  const _fallbackRoot = isLocale ? root3.fallbackRoot : isBoolean(options.fallbackRoot) ? options.fallbackRoot : true;
  const _fallbackFormat = !!options.fallbackFormat;
  const _missing = isFunction(options.missing) ? options.missing : null;
  const _postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
  const _warnHtmlMessage = isLocale ? root3.warnHtmlMessage : isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
  const _escapeParameter = !!options.escapeParameter;
  const _modifiers = isLocale ? root3.modifiers : isPlainObject(options.modifiers) ? options.modifiers : {};
  const _pluralRules = options.pluralRules || isLocale && root3.pluralRules;
  function trackReactivityValues() {
    return [
      _locale.value,
      _fallbackLocale.value,
      _messages.value,
      _datetimeFormats.value,
      _numberFormats.value
    ];
  }
  const locale = computed({
    get: () => {
      return _composer.value ? _composer.value.locale.value : _locale.value;
    },
    set: (val) => {
      if (_composer.value) {
        _composer.value.locale.value = val;
      }
      _locale.value = val;
    }
  });
  const fallbackLocale = computed({
    get: () => {
      return _composer.value ? _composer.value.fallbackLocale.value : _fallbackLocale.value;
    },
    set: (val) => {
      if (_composer.value) {
        _composer.value.fallbackLocale.value = val;
      }
      _fallbackLocale.value = val;
    }
  });
  const messages2 = computed(() => {
    if (_composer.value) {
      return _composer.value.messages.value;
    } else {
      return _messages.value;
    }
  });
  const datetimeFormats = computed(() => _datetimeFormats.value);
  const numberFormats = computed(() => _numberFormats.value);
  function getPostTranslationHandler() {
    return _composer.value ? _composer.value.getPostTranslationHandler() : _postTranslation;
  }
  function setPostTranslationHandler(handler2) {
    if (_composer.value) {
      _composer.value.setPostTranslationHandler(handler2);
    }
  }
  function getMissingHandler() {
    return _composer.value ? _composer.value.getMissingHandler() : _missing;
  }
  function setMissingHandler(handler2) {
    if (_composer.value) {
      _composer.value.setMissingHandler(handler2);
    }
  }
  function warpWithDeps(fn) {
    trackReactivityValues();
    return fn();
  }
  function t(...args) {
    return _composer.value ? warpWithDeps(() => Reflect.apply(_composer.value.t, null, [...args])) : warpWithDeps(() => "");
  }
  function rt(...args) {
    return _composer.value ? Reflect.apply(_composer.value.rt, null, [...args]) : "";
  }
  function d(...args) {
    return _composer.value ? warpWithDeps(() => Reflect.apply(_composer.value.d, null, [...args])) : warpWithDeps(() => "");
  }
  function n(...args) {
    return _composer.value ? warpWithDeps(() => Reflect.apply(_composer.value.n, null, [...args])) : warpWithDeps(() => "");
  }
  function tm(key) {
    return _composer.value ? _composer.value.tm(key) : {};
  }
  function te(key, locale2) {
    return _composer.value ? _composer.value.te(key, locale2) : false;
  }
  function getLocaleMessage(locale2) {
    return _composer.value ? _composer.value.getLocaleMessage(locale2) : {};
  }
  function setLocaleMessage(locale2, message) {
    if (_composer.value) {
      _composer.value.setLocaleMessage(locale2, message);
      _messages.value[locale2] = message;
    }
  }
  function mergeLocaleMessage(locale2, message) {
    if (_composer.value) {
      _composer.value.mergeLocaleMessage(locale2, message);
    }
  }
  function getDateTimeFormat(locale2) {
    return _composer.value ? _composer.value.getDateTimeFormat(locale2) : {};
  }
  function setDateTimeFormat(locale2, format2) {
    if (_composer.value) {
      _composer.value.setDateTimeFormat(locale2, format2);
      _datetimeFormats.value[locale2] = format2;
    }
  }
  function mergeDateTimeFormat(locale2, format2) {
    if (_composer.value) {
      _composer.value.mergeDateTimeFormat(locale2, format2);
    }
  }
  function getNumberFormat(locale2) {
    return _composer.value ? _composer.value.getNumberFormat(locale2) : {};
  }
  function setNumberFormat(locale2, format2) {
    if (_composer.value) {
      _composer.value.setNumberFormat(locale2, format2);
      _numberFormats.value[locale2] = format2;
    }
  }
  function mergeNumberFormat(locale2, format2) {
    if (_composer.value) {
      _composer.value.mergeNumberFormat(locale2, format2);
    }
  }
  const wrapper = {
    get id() {
      return _composer.value ? _composer.value.id : -1;
    },
    locale,
    fallbackLocale,
    messages: messages2,
    datetimeFormats,
    numberFormats,
    get inheritLocale() {
      return _composer.value ? _composer.value.inheritLocale : _inheritLocale;
    },
    set inheritLocale(val) {
      if (_composer.value) {
        _composer.value.inheritLocale = val;
      }
    },
    get availableLocales() {
      return _composer.value ? _composer.value.availableLocales : Object.keys(_messages.value);
    },
    get modifiers() {
      return _composer.value ? _composer.value.modifiers : _modifiers;
    },
    get pluralRules() {
      return _composer.value ? _composer.value.pluralRules : _pluralRules;
    },
    get isGlobal() {
      return _composer.value ? _composer.value.isGlobal : false;
    },
    get missingWarn() {
      return _composer.value ? _composer.value.missingWarn : _missingWarn;
    },
    set missingWarn(val) {
      if (_composer.value) {
        _composer.value.missingWarn = val;
      }
    },
    get fallbackWarn() {
      return _composer.value ? _composer.value.fallbackWarn : _fallbackWarn;
    },
    set fallbackWarn(val) {
      if (_composer.value) {
        _composer.value.missingWarn = val;
      }
    },
    get fallbackRoot() {
      return _composer.value ? _composer.value.fallbackRoot : _fallbackRoot;
    },
    set fallbackRoot(val) {
      if (_composer.value) {
        _composer.value.fallbackRoot = val;
      }
    },
    get fallbackFormat() {
      return _composer.value ? _composer.value.fallbackFormat : _fallbackFormat;
    },
    set fallbackFormat(val) {
      if (_composer.value) {
        _composer.value.fallbackFormat = val;
      }
    },
    get warnHtmlMessage() {
      return _composer.value ? _composer.value.warnHtmlMessage : _warnHtmlMessage;
    },
    set warnHtmlMessage(val) {
      if (_composer.value) {
        _composer.value.warnHtmlMessage = val;
      }
    },
    get escapeParameter() {
      return _composer.value ? _composer.value.escapeParameter : _escapeParameter;
    },
    set escapeParameter(val) {
      if (_composer.value) {
        _composer.value.escapeParameter = val;
      }
    },
    t,
    getPostTranslationHandler,
    setPostTranslationHandler,
    getMissingHandler,
    setMissingHandler,
    rt,
    d,
    n,
    tm,
    te,
    getLocaleMessage,
    setLocaleMessage,
    mergeLocaleMessage,
    getDateTimeFormat,
    setDateTimeFormat,
    mergeDateTimeFormat,
    getNumberFormat,
    setNumberFormat,
    mergeNumberFormat
  };
  return wrapper;
}
const globalExportProps = [
  "locale",
  "fallbackLocale",
  "availableLocales"
];
const globalExportMethods = ["t", "rt", "d", "n", "tm"];
function injectGlobalFields(app, composer) {
  const i18n = /* @__PURE__ */ Object.create(null);
  globalExportProps.forEach((prop) => {
    const desc = Object.getOwnPropertyDescriptor(composer, prop);
    if (!desc) {
      throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
    }
    const wrap = isRef(desc.value) ? {
      get() {
        return desc.value.value;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set(val) {
        desc.value.value = val;
      }
    } : {
      get() {
        return desc.get && desc.get();
      }
    };
    Object.defineProperty(i18n, prop, wrap);
  });
  app.config.globalProperties.$i18n = i18n;
  globalExportMethods.forEach((method) => {
    const desc = Object.getOwnPropertyDescriptor(composer, method);
    if (!desc || !desc.value) {
      throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
    }
    Object.defineProperty(app.config.globalProperties, `$${method}`, desc);
  });
}
registerMessageResolver(resolveValue);
registerLocaleFallbacker(fallbackWithLocaleChain);
{
  initFeatureFlags();
}
if (__INTLIFY_PROD_DEVTOOLS__) {
  const target = getGlobalThis();
  target.__INTLIFY__ = true;
  setDevToolsHook(target.__INTLIFY_DEVTOOLS_GLOBAL_HOOK__);
}
const optionsLoader = () => Promise.resolve({});
const resource$1 = {
  "hello": (ctx) => {
    const { normalize: _normalize } = ctx;
    return _normalize(["Hello"]);
  },
  "goodbye": (ctx) => {
    const { normalize: _normalize } = ctx;
    return _normalize(["Good Bye"]);
  },
  "pageTitles": {
    "about": (ctx) => {
      const { normalize: _normalize } = ctx;
      return _normalize(["About"]);
    },
    "resume": (ctx) => {
      const { normalize: _normalize } = ctx;
      return _normalize(["Resume"]);
    },
    "portfolio": (ctx) => {
      const { normalize: _normalize } = ctx;
      return _normalize(["Portfolio"]);
    },
    "blog": (ctx) => {
      const { normalize: _normalize } = ctx;
      return _normalize(["Blog"]);
    },
    "github": (ctx) => {
      const { normalize: _normalize } = ctx;
      return _normalize(["Github"]);
    }
  }
};
const resource = {
  "hello": (ctx) => {
    const { normalize: _normalize } = ctx;
    return _normalize(["Halo"]);
  },
  "goodbye": (ctx) => {
    const { normalize: _normalize } = ctx;
    return _normalize(["Sampai jumpa"]);
  },
  "pageTitles": {
    "about": (ctx) => {
      const { normalize: _normalize } = ctx;
      return _normalize(["Tentang"]);
    },
    "resume": (ctx) => {
      const { normalize: _normalize } = ctx;
      return _normalize(["Pengalaman"]);
    },
    "portfolio": (ctx) => {
      const { normalize: _normalize } = ctx;
      return _normalize(["Proyek"]);
    },
    "blog": (ctx) => {
      const { normalize: _normalize } = ctx;
      return _normalize(["Artikel"]);
    },
    "github": (ctx) => {
      const { normalize: _normalize } = ctx;
      return _normalize(["Github"]);
    }
  }
};
const messages = { "en": resource$1, "id_ID": resource };
const isEmpty = (obj) => Object.keys(obj).length === 0;
const plugin_FRmGFsEaPh = /* @__PURE__ */ defineNuxtPlugin(async (nuxt) => {
  let __temp, __restore;
  const { vueApp: app } = nuxt;
  const loadedOptions = ([__temp, __restore] = executeAsync(() => optionsLoader()), __temp = await __temp, __restore(), __temp);
  if (!isEmpty(messages)) {
    loadedOptions.messages = messages;
  }
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: "en",
    ...loadedOptions
  });
  app.use(i18n);
});
const preference = "system";
const plugin_server_XNCxeHyTuP = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  const colorMode = useState("color-mode", () => reactive({
    preference,
    value: preference,
    unknown: true,
    forced: false
  })).value;
  const htmlAttrs = {};
  {
    useHead({ htmlAttrs });
  }
  useRouter().afterEach((to) => {
    const forcedColorMode = to.meta.colorMode;
    if (forcedColorMode && forcedColorMode !== "system") {
      colorMode.value = htmlAttrs["data-color-mode-forced"] = forcedColorMode;
      colorMode.forced = true;
    } else if (forcedColorMode === "system") {
      console.warn("You cannot force the colorMode to system at the page level.");
    }
  });
  nuxtApp.provide("colorMode", colorMode);
});
const cookies_fWsGjKD4Pq = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueCookies);
});
const useLocaleStore = defineStore("localeStore", () => {
  const locale = ref(useCookie("locale"));
  function setLocale(val) {
    return this.locale = val;
  }
  const getLocale = computed(() => {
    return locale.value;
  });
  return { locale, setLocale, getLocale };
});
const i18n_VfGcjrvSkj = /* @__PURE__ */ defineNuxtPlugin(() => {
  createI18n({
    legacy: false,
    inheritLocale: false,
    globalInjection: true,
    localeDir: "locales",
    fallbackLocale: useLocaleStore().getLocale || "id",
    locale: useLocaleStore().getLocale || "id"
  });
});
function _createForOfIteratorHelper$1(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it)
        o = it;
      var i = 0;
      var F = function F2() {
      };
      return { s: F, n: function n() {
        if (i >= o.length)
          return { done: true };
        return { done: false, value: o[i++] };
      }, e: function e(_e2) {
        throw _e2;
      }, f: F };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true, didErr = false, err;
  return { s: function s() {
    it = it.call(o);
  }, n: function n() {
    var step = it.next();
    normalCompletion = step.done;
    return step;
  }, e: function e(_e3) {
    didErr = true;
    err = _e3;
  }, f: function f() {
    try {
      if (!normalCompletion && it["return"] != null)
        it["return"]();
    } finally {
      if (didErr)
        throw err;
    }
  } };
}
function _toConsumableArray$2(arr) {
  return _arrayWithoutHoles$2(arr) || _iterableToArray$2(arr) || _unsupportedIterableToArray$2(arr) || _nonIterableSpread$2();
}
function _nonIterableSpread$2() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArray$2(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
    return Array.from(iter);
}
function _arrayWithoutHoles$2(arr) {
  if (Array.isArray(arr))
    return _arrayLikeToArray$2(arr);
}
function _typeof$2$1(obj) {
  "@babel/helpers - typeof";
  return _typeof$2$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof$2$1(obj);
}
function _slicedToArray$1(arr, i) {
  return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i) || _unsupportedIterableToArray$2(arr, i) || _nonIterableRest$1();
}
function _nonIterableRest$1() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$2(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray$2(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray$2(o, minLen);
}
function _arrayLikeToArray$2(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _iterableToArrayLimit$1(arr, i) {
  var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
  if (null != _i) {
    var _s, _e, _x, _r, _arr = [], _n = true, _d = false;
    try {
      if (_x = (_i = _i.call(arr)).next, 0 === i) {
        if (Object(_i) !== _i)
          return;
        _n = false;
      } else
        for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = true)
          ;
    } catch (err) {
      _d = true, _e = err;
    } finally {
      try {
        if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r))
          return;
      } finally {
        if (_d)
          throw _e;
      }
    }
    return _arr;
  }
}
function _arrayWithHoles$1(arr) {
  if (Array.isArray(arr))
    return arr;
}
var DomHandler = {
  innerWidth: function innerWidth(el) {
    if (el) {
      var width2 = el.offsetWidth;
      var style2 = getComputedStyle(el);
      width2 += parseFloat(style2.paddingLeft) + parseFloat(style2.paddingRight);
      return width2;
    }
    return 0;
  },
  width: function width(el) {
    if (el) {
      var width2 = el.offsetWidth;
      var style2 = getComputedStyle(el);
      width2 -= parseFloat(style2.paddingLeft) + parseFloat(style2.paddingRight);
      return width2;
    }
    return 0;
  },
  getWindowScrollTop: function getWindowScrollTop() {
    var doc = document.documentElement;
    return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
  },
  getWindowScrollLeft: function getWindowScrollLeft() {
    var doc = document.documentElement;
    return (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  },
  getOuterWidth: function getOuterWidth(el, margin) {
    if (el) {
      var width2 = el.offsetWidth;
      if (margin) {
        var style2 = getComputedStyle(el);
        width2 += parseFloat(style2.marginLeft) + parseFloat(style2.marginRight);
      }
      return width2;
    }
    return 0;
  },
  getOuterHeight: function getOuterHeight(el, margin) {
    if (el) {
      var height = el.offsetHeight;
      if (margin) {
        var style2 = getComputedStyle(el);
        height += parseFloat(style2.marginTop) + parseFloat(style2.marginBottom);
      }
      return height;
    }
    return 0;
  },
  getClientHeight: function getClientHeight(el, margin) {
    if (el) {
      var height = el.clientHeight;
      if (margin) {
        var style2 = getComputedStyle(el);
        height += parseFloat(style2.marginTop) + parseFloat(style2.marginBottom);
      }
      return height;
    }
    return 0;
  },
  getViewport: function getViewport() {
    var win = window, d = document, e = d.documentElement, g = d.getElementsByTagName("body")[0], w = win.innerWidth || e.clientWidth || g.clientWidth, h2 = win.innerHeight || e.clientHeight || g.clientHeight;
    return {
      width: w,
      height: h2
    };
  },
  getOffset: function getOffset(el) {
    if (el) {
      var rect = el.getBoundingClientRect();
      return {
        top: rect.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
        left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0)
      };
    }
    return {
      top: "auto",
      left: "auto"
    };
  },
  index: function index(element) {
    if (element) {
      var children = element.parentNode.childNodes;
      var num = 0;
      for (var i = 0; i < children.length; i++) {
        if (children[i] === element)
          return num;
        if (children[i].nodeType === 1)
          num++;
      }
    }
    return -1;
  },
  addMultipleClasses: function addMultipleClasses(element, className) {
    var _this = this;
    if (element && className) {
      className.split(" ").forEach(function(style2) {
        return _this.addClass(element, style2);
      });
    }
  },
  addClass: function addClass(element, className) {
    if (element && className && !this.hasClass(element, className)) {
      if (element.classList)
        element.classList.add(className);
      else
        element.className += " " + className;
    }
  },
  removeClass: function removeClass(element, className) {
    if (element && className) {
      if (element.classList)
        element.classList.remove(className);
      else
        element.className = element.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    }
  },
  hasClass: function hasClass(element, className) {
    if (element) {
      if (element.classList)
        return element.classList.contains(className);
      else
        return new RegExp("(^| )" + className + "( |$)", "gi").test(element.className);
    }
    return false;
  },
  addStyles: function addStyles(element) {
    var styles2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (element) {
      Object.entries(styles2).forEach(function(_ref) {
        var _ref2 = _slicedToArray$1(_ref, 2), key = _ref2[0], value = _ref2[1];
        return element.style[key] = value;
      });
    }
  },
  find: function find(element, selector) {
    return this.isElement(element) ? element.querySelectorAll(selector) : [];
  },
  findSingle: function findSingle(element, selector) {
    return this.isElement(element) ? element.querySelector(selector) : null;
  },
  createElement: function createElement(type) {
    var attributes = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (type) {
      var element = document.createElement(type);
      this.setAttributes(element, attributes);
      for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
      }
      element.append.apply(element, children);
      return element;
    }
    return void 0;
  },
  setAttributes: function setAttributes(element) {
    var _this2 = this;
    var attributes = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (element) {
      var computedStyles = function computedStyles2(rule, value) {
        var _element$$attrs, _element$$attrs2;
        var styles2 = element !== null && element !== void 0 && (_element$$attrs = element.$attrs) !== null && _element$$attrs !== void 0 && _element$$attrs[rule] ? [element === null || element === void 0 || (_element$$attrs2 = element.$attrs) === null || _element$$attrs2 === void 0 ? void 0 : _element$$attrs2[rule]] : [];
        return [value].flat().reduce(function(cv, v) {
          if (v !== null && v !== void 0) {
            var type = _typeof$2$1(v);
            if (type === "string" || type === "number") {
              cv.push(v);
            } else if (type === "object") {
              var _cv = Array.isArray(v) ? computedStyles2(rule, v) : Object.entries(v).map(function(_ref3) {
                var _ref4 = _slicedToArray$1(_ref3, 2), _k = _ref4[0], _v = _ref4[1];
                return rule === "style" && (!!_v || _v === 0) ? "".concat(_k.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), ":").concat(_v) : !!_v ? _k : void 0;
              });
              cv = _cv.length ? cv.concat(_cv.filter(function(c) {
                return !!c;
              })) : cv;
            }
          }
          return cv;
        }, styles2);
      };
      Object.entries(attributes).forEach(function(_ref5) {
        var _ref6 = _slicedToArray$1(_ref5, 2), key = _ref6[0], value = _ref6[1];
        if (value !== void 0 && value !== null) {
          var matchedEvent = key.match(/^on(.+)/);
          if (matchedEvent) {
            element.addEventListener(matchedEvent[1].toLowerCase(), value);
          } else if (key === "p-bind") {
            _this2.setAttributes(element, value);
          } else {
            value = key === "class" ? _toConsumableArray$2(new Set(computedStyles("class", value))).join(" ").trim() : key === "style" ? computedStyles("style", value).join(";").trim() : value;
            (element.$attrs = element.$attrs || {}) && (element.$attrs[key] = value);
            element.setAttribute(key, value);
          }
        }
      });
    }
  },
  getAttribute: function getAttribute(element, name) {
    if (element) {
      var value = element.getAttribute(name);
      if (!isNaN(value)) {
        return +value;
      }
      if (value === "true" || value === "false") {
        return value === "true";
      }
      return value;
    }
    return void 0;
  },
  isAttributeEquals: function isAttributeEquals(element, name, value) {
    return element ? this.getAttribute(element, name) === value : false;
  },
  isAttributeNotEquals: function isAttributeNotEquals(element, name, value) {
    return !this.isAttributeEquals(element, name, value);
  },
  getHeight: function getHeight(el) {
    if (el) {
      var height = el.offsetHeight;
      var style2 = getComputedStyle(el);
      height -= parseFloat(style2.paddingTop) + parseFloat(style2.paddingBottom) + parseFloat(style2.borderTopWidth) + parseFloat(style2.borderBottomWidth);
      return height;
    }
    return 0;
  },
  getWidth: function getWidth(el) {
    if (el) {
      var width2 = el.offsetWidth;
      var style2 = getComputedStyle(el);
      width2 -= parseFloat(style2.paddingLeft) + parseFloat(style2.paddingRight) + parseFloat(style2.borderLeftWidth) + parseFloat(style2.borderRightWidth);
      return width2;
    }
    return 0;
  },
  absolutePosition: function absolutePosition(element, target) {
    if (element) {
      var elementDimensions = element.offsetParent ? {
        width: element.offsetWidth,
        height: element.offsetHeight
      } : this.getHiddenElementDimensions(element);
      var elementOuterHeight = elementDimensions.height;
      var elementOuterWidth = elementDimensions.width;
      var targetOuterHeight = target.offsetHeight;
      var targetOuterWidth = target.offsetWidth;
      var targetOffset = target.getBoundingClientRect();
      var windowScrollTop = this.getWindowScrollTop();
      var windowScrollLeft = this.getWindowScrollLeft();
      var viewport = this.getViewport();
      var top, left;
      if (targetOffset.top + targetOuterHeight + elementOuterHeight > viewport.height) {
        top = targetOffset.top + windowScrollTop - elementOuterHeight;
        element.style.transformOrigin = "bottom";
        if (top < 0) {
          top = windowScrollTop;
        }
      } else {
        top = targetOuterHeight + targetOffset.top + windowScrollTop;
        element.style.transformOrigin = "top";
      }
      if (targetOffset.left + elementOuterWidth > viewport.width)
        left = Math.max(0, targetOffset.left + windowScrollLeft + targetOuterWidth - elementOuterWidth);
      else
        left = targetOffset.left + windowScrollLeft;
      element.style.top = top + "px";
      element.style.left = left + "px";
    }
  },
  relativePosition: function relativePosition(element, target) {
    if (element) {
      var elementDimensions = element.offsetParent ? {
        width: element.offsetWidth,
        height: element.offsetHeight
      } : this.getHiddenElementDimensions(element);
      var targetHeight = target.offsetHeight;
      var targetOffset = target.getBoundingClientRect();
      var viewport = this.getViewport();
      var top, left;
      if (targetOffset.top + targetHeight + elementDimensions.height > viewport.height) {
        top = -1 * elementDimensions.height;
        element.style.transformOrigin = "bottom";
        if (targetOffset.top + top < 0) {
          top = -1 * targetOffset.top;
        }
      } else {
        top = targetHeight;
        element.style.transformOrigin = "top";
      }
      if (elementDimensions.width > viewport.width) {
        left = targetOffset.left * -1;
      } else if (targetOffset.left + elementDimensions.width > viewport.width) {
        left = (targetOffset.left + elementDimensions.width - viewport.width) * -1;
      } else {
        left = 0;
      }
      element.style.top = top + "px";
      element.style.left = left + "px";
    }
  },
  getParents: function getParents(element) {
    var parents = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
    return element["parentNode"] === null ? parents : this.getParents(element.parentNode, parents.concat([element.parentNode]));
  },
  getScrollableParents: function getScrollableParents(element) {
    var scrollableParents = [];
    if (element) {
      var parents = this.getParents(element);
      var overflowRegex = /(auto|scroll)/;
      var overflowCheck = function overflowCheck2(node) {
        try {
          var styleDeclaration = window["getComputedStyle"](node, null);
          return overflowRegex.test(styleDeclaration.getPropertyValue("overflow")) || overflowRegex.test(styleDeclaration.getPropertyValue("overflowX")) || overflowRegex.test(styleDeclaration.getPropertyValue("overflowY"));
        } catch (err) {
          return false;
        }
      };
      var _iterator = _createForOfIteratorHelper$1(parents), _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
          var parent = _step.value;
          var scrollSelectors = parent.nodeType === 1 && parent.dataset["scrollselectors"];
          if (scrollSelectors) {
            var selectors = scrollSelectors.split(",");
            var _iterator2 = _createForOfIteratorHelper$1(selectors), _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
                var selector = _step2.value;
                var el = this.findSingle(parent, selector);
                if (el && overflowCheck(el)) {
                  scrollableParents.push(el);
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }
          if (parent.nodeType !== 9 && overflowCheck(parent)) {
            scrollableParents.push(parent);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    return scrollableParents;
  },
  getHiddenElementOuterHeight: function getHiddenElementOuterHeight(element) {
    if (element) {
      element.style.visibility = "hidden";
      element.style.display = "block";
      var elementHeight = element.offsetHeight;
      element.style.display = "none";
      element.style.visibility = "visible";
      return elementHeight;
    }
    return 0;
  },
  getHiddenElementOuterWidth: function getHiddenElementOuterWidth(element) {
    if (element) {
      element.style.visibility = "hidden";
      element.style.display = "block";
      var elementWidth = element.offsetWidth;
      element.style.display = "none";
      element.style.visibility = "visible";
      return elementWidth;
    }
    return 0;
  },
  getHiddenElementDimensions: function getHiddenElementDimensions(element) {
    if (element) {
      var dimensions = {};
      element.style.visibility = "hidden";
      element.style.display = "block";
      dimensions.width = element.offsetWidth;
      dimensions.height = element.offsetHeight;
      element.style.display = "none";
      element.style.visibility = "visible";
      return dimensions;
    }
    return 0;
  },
  fadeIn: function fadeIn(element, duration) {
    if (element) {
      element.style.opacity = 0;
      var last = +/* @__PURE__ */ new Date();
      var opacity = 0;
      var tick = function tick2() {
        opacity = +element.style.opacity + ((/* @__PURE__ */ new Date()).getTime() - last) / duration;
        element.style.opacity = opacity;
        last = +/* @__PURE__ */ new Date();
        if (+opacity < 1) {
          window.requestAnimationFrame && requestAnimationFrame(tick2) || setTimeout(tick2, 16);
        }
      };
      tick();
    }
  },
  fadeOut: function fadeOut(element, ms) {
    if (element) {
      var opacity = 1, interval = 50, duration = ms, gap = interval / duration;
      var fading = setInterval(function() {
        opacity -= gap;
        if (opacity <= 0) {
          opacity = 0;
          clearInterval(fading);
        }
        element.style.opacity = opacity;
      }, interval);
    }
  },
  getUserAgent: function getUserAgent() {
    return navigator.userAgent;
  },
  appendChild: function appendChild(element, target) {
    if (this.isElement(target))
      target.appendChild(element);
    else if (target.el && target.elElement)
      target.elElement.appendChild(element);
    else
      throw new Error("Cannot append " + target + " to " + element);
  },
  isElement: function isElement(obj) {
    return (typeof HTMLElement === "undefined" ? "undefined" : _typeof$2$1(HTMLElement)) === "object" ? obj instanceof HTMLElement : obj && _typeof$2$1(obj) === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string";
  },
  scrollInView: function scrollInView(container, item) {
    var borderTopValue = getComputedStyle(container).getPropertyValue("borderTopWidth");
    var borderTop = borderTopValue ? parseFloat(borderTopValue) : 0;
    var paddingTopValue = getComputedStyle(container).getPropertyValue("paddingTop");
    var paddingTop = paddingTopValue ? parseFloat(paddingTopValue) : 0;
    var containerRect = container.getBoundingClientRect();
    var itemRect = item.getBoundingClientRect();
    var offset = itemRect.top + document.body.scrollTop - (containerRect.top + document.body.scrollTop) - borderTop - paddingTop;
    var scroll = container.scrollTop;
    var elementHeight = container.clientHeight;
    var itemHeight = this.getOuterHeight(item);
    if (offset < 0) {
      container.scrollTop = scroll + offset;
    } else if (offset + itemHeight > elementHeight) {
      container.scrollTop = scroll + offset - elementHeight + itemHeight;
    }
  },
  clearSelection: function clearSelection() {
    if (window.getSelection) {
      if (window.getSelection().empty) {
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges && window.getSelection().rangeCount > 0 && window.getSelection().getRangeAt(0).getClientRects().length > 0) {
        window.getSelection().removeAllRanges();
      }
    } else if (document["selection"] && document["selection"].empty) {
      try {
        document["selection"].empty();
      } catch (error) {
      }
    }
  },
  getSelection: function getSelection() {
    if (window.getSelection)
      return window.getSelection().toString();
    else if (document.getSelection)
      return document.getSelection().toString();
    else if (document["selection"])
      return document["selection"].createRange().text;
    return null;
  },
  calculateScrollbarWidth: function calculateScrollbarWidth() {
    if (this.calculatedScrollbarWidth != null)
      return this.calculatedScrollbarWidth;
    var scrollDiv = document.createElement("div");
    this.addStyles(scrollDiv, {
      width: "100px",
      height: "100px",
      overflow: "scroll",
      position: "absolute",
      top: "-9999px"
    });
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    this.calculatedScrollbarWidth = scrollbarWidth;
    return scrollbarWidth;
  },
  getBrowser: function getBrowser() {
    if (!this.browser) {
      var matched = this.resolveUserAgent();
      this.browser = {};
      if (matched.browser) {
        this.browser[matched.browser] = true;
        this.browser["version"] = matched.version;
      }
      if (this.browser["chrome"]) {
        this.browser["webkit"] = true;
      } else if (this.browser["webkit"]) {
        this.browser["safari"] = true;
      }
    }
    return this.browser;
  },
  resolveUserAgent: function resolveUserAgent() {
    var ua = navigator.userAgent.toLowerCase();
    var match = /(chrome)[ ]([\w.]+)/.exec(ua) || /(webkit)[ ]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ ]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
    return {
      browser: match[1] || "",
      version: match[2] || "0"
    };
  },
  isVisible: function isVisible(element) {
    return element && element.offsetParent != null;
  },
  invokeElementMethod: function invokeElementMethod(element, methodName, args) {
    element[methodName].apply(element, args);
  },
  isExist: function isExist(element) {
    return !!(element !== null && typeof element !== "undefined" && element.nodeName && element.parentNode);
  },
  isClient: function isClient() {
    return false;
  },
  focus: function focus(el, options) {
    el && document.activeElement !== el && el.focus(options);
  },
  isFocusableElement: function isFocusableElement(element) {
    var selector = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.isElement(element) ? element.matches('button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])'.concat(selector, ',\n                [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector, ',\n                input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector, ',\n                select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector, ',\n                textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector, ',\n                [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector, ',\n                [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector)) : false;
  },
  getFocusableElements: function getFocusableElements(element) {
    var selector = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    var focusableElements = this.find(element, 'button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])'.concat(selector, ',\n                [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector, ',\n                input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector, ',\n                select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector, ',\n                textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector, ',\n                [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector, ',\n                [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])').concat(selector));
    var visibleFocusableElements = [];
    var _iterator3 = _createForOfIteratorHelper$1(focusableElements), _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
        var focusableElement = _step3.value;
        if (getComputedStyle(focusableElement).display != "none" && getComputedStyle(focusableElement).visibility != "hidden")
          visibleFocusableElements.push(focusableElement);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
    return visibleFocusableElements;
  },
  getFirstFocusableElement: function getFirstFocusableElement(element, selector) {
    var focusableElements = this.getFocusableElements(element, selector);
    return focusableElements.length > 0 ? focusableElements[0] : null;
  },
  getLastFocusableElement: function getLastFocusableElement(element, selector) {
    var focusableElements = this.getFocusableElements(element, selector);
    return focusableElements.length > 0 ? focusableElements[focusableElements.length - 1] : null;
  },
  getNextFocusableElement: function getNextFocusableElement(container, element, selector) {
    var focusableElements = this.getFocusableElements(container, selector);
    var index3 = focusableElements.length > 0 ? focusableElements.findIndex(function(el) {
      return el === element;
    }) : -1;
    var nextIndex = index3 > -1 && focusableElements.length >= index3 + 1 ? index3 + 1 : -1;
    return nextIndex > -1 ? focusableElements[nextIndex] : null;
  },
  isClickable: function isClickable(element) {
    if (element) {
      var targetNode = element.nodeName;
      var parentNode = element.parentElement && element.parentElement.nodeName;
      return targetNode === "INPUT" || targetNode === "TEXTAREA" || targetNode === "BUTTON" || targetNode === "A" || parentNode === "INPUT" || parentNode === "TEXTAREA" || parentNode === "BUTTON" || parentNode === "A" || !!element.closest(".p-button, .p-checkbox, .p-radiobutton");
    }
    return false;
  },
  applyStyle: function applyStyle(element, style2) {
    if (typeof style2 === "string") {
      element.style.cssText = style2;
    } else {
      for (var prop in style2) {
        element.style[prop] = style2[prop];
      }
    }
  },
  isIOS: function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window["MSStream"];
  },
  isAndroid: function isAndroid() {
    return /(android)/i.test(navigator.userAgent);
  },
  isTouchDevice: function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  },
  exportCSV: function exportCSV(csv, filename) {
    var blob = new Blob([csv], {
      type: "application/csv;charset=utf-8;"
    });
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename + ".csv");
    } else {
      var link = document.createElement("a");
      if (link.download !== void 0) {
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", filename + ".csv");
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        csv = "data:text/csv;charset=utf-8," + csv;
        window.open(encodeURI(csv));
      }
    }
  }
};
function _toConsumableArray$1(arr) {
  return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _unsupportedIterableToArray$1$1(arr) || _nonIterableSpread$1();
}
function _nonIterableSpread$1() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArray$1(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
    return Array.from(iter);
}
function _arrayWithoutHoles$1(arr) {
  if (Array.isArray(arr))
    return _arrayLikeToArray$1$1(arr);
}
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray$1$1(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it)
        o = it;
      var i = 0;
      var F = function F2() {
      };
      return { s: F, n: function n() {
        if (i >= o.length)
          return { done: true };
        return { done: false, value: o[i++] };
      }, e: function e(_e) {
        throw _e;
      }, f: F };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true, didErr = false, err;
  return { s: function s() {
    it = it.call(o);
  }, n: function n() {
    var step = it.next();
    normalCompletion = step.done;
    return step;
  }, e: function e(_e2) {
    didErr = true;
    err = _e2;
  }, f: function f() {
    try {
      if (!normalCompletion && it["return"] != null)
        it["return"]();
    } finally {
      if (didErr)
        throw err;
    }
  } };
}
function _unsupportedIterableToArray$1$1(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray$1$1(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray$1$1(o, minLen);
}
function _arrayLikeToArray$1$1(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _typeof$4(obj) {
  "@babel/helpers - typeof";
  return _typeof$4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof$4(obj);
}
var ObjectUtils = {
  equals: function equals(obj1, obj2, field) {
    if (field)
      return this.resolveFieldData(obj1, field) === this.resolveFieldData(obj2, field);
    else
      return this.deepEquals(obj1, obj2);
  },
  deepEquals: function deepEquals(a, b) {
    if (a === b)
      return true;
    if (a && b && _typeof$4(a) == "object" && _typeof$4(b) == "object") {
      var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
      if (arrA && arrB) {
        length = a.length;
        if (length != b.length)
          return false;
        for (i = length; i-- !== 0; )
          if (!this.deepEquals(a[i], b[i]))
            return false;
        return true;
      }
      if (arrA != arrB)
        return false;
      var dateA = a instanceof Date, dateB = b instanceof Date;
      if (dateA != dateB)
        return false;
      if (dateA && dateB)
        return a.getTime() == b.getTime();
      var regexpA = a instanceof RegExp, regexpB = b instanceof RegExp;
      if (regexpA != regexpB)
        return false;
      if (regexpA && regexpB)
        return a.toString() == b.toString();
      var keys = Object.keys(a);
      length = keys.length;
      if (length !== Object.keys(b).length)
        return false;
      for (i = length; i-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(b, keys[i]))
          return false;
      for (i = length; i-- !== 0; ) {
        key = keys[i];
        if (!this.deepEquals(a[key], b[key]))
          return false;
      }
      return true;
    }
    return a !== a && b !== b;
  },
  resolveFieldData: function resolveFieldData(data, field) {
    if (data && Object.keys(data).length && field) {
      if (this.isFunction(field)) {
        return field(data);
      } else if (field.indexOf(".") === -1) {
        return data[field];
      } else {
        var fields = field.split(".");
        var value = data;
        for (var i = 0, len = fields.length; i < len; ++i) {
          if (value == null) {
            return null;
          }
          value = value[fields[i]];
        }
        return value;
      }
    } else {
      return null;
    }
  },
  getItemValue: function getItemValue(obj) {
    for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }
    return this.isFunction(obj) ? obj.apply(void 0, params) : obj;
  },
  filter: function filter(value, fields, filterValue) {
    var filteredItems = [];
    if (value) {
      var _iterator = _createForOfIteratorHelper(value), _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
          var item = _step.value;
          var _iterator2 = _createForOfIteratorHelper(fields), _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
              var field = _step2.value;
              if (String(this.resolveFieldData(item, field)).toLowerCase().indexOf(filterValue.toLowerCase()) > -1) {
                filteredItems.push(item);
                break;
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    return filteredItems;
  },
  reorderArray: function reorderArray(value, from, to) {
    if (value && from !== to) {
      if (to >= value.length) {
        to %= value.length;
        from %= value.length;
      }
      value.splice(to, 0, value.splice(from, 1)[0]);
    }
  },
  findIndexInList: function findIndexInList(value, list) {
    var index3 = -1;
    if (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i] === value) {
          index3 = i;
          break;
        }
      }
    }
    return index3;
  },
  contains: function contains(value, list) {
    if (value != null && list && list.length) {
      var _iterator3 = _createForOfIteratorHelper(list), _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
          var val = _step3.value;
          if (this.equals(value, val))
            return true;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
    return false;
  },
  insertIntoOrderedArray: function insertIntoOrderedArray(item, index3, arr, sourceArr) {
    if (arr.length > 0) {
      var injected = false;
      for (var i = 0; i < arr.length; i++) {
        var currentItemIndex = this.findIndexInList(arr[i], sourceArr);
        if (currentItemIndex > index3) {
          arr.splice(i, 0, item);
          injected = true;
          break;
        }
      }
      if (!injected) {
        arr.push(item);
      }
    } else {
      arr.push(item);
    }
  },
  removeAccents: function removeAccents(str) {
    if (str && str.search(/[\xC0-\xFF]/g) > -1) {
      str = str.replace(/[\xC0-\xC5]/g, "A").replace(/[\xC6]/g, "AE").replace(/[\xC7]/g, "C").replace(/[\xC8-\xCB]/g, "E").replace(/[\xCC-\xCF]/g, "I").replace(/[\xD0]/g, "D").replace(/[\xD1]/g, "N").replace(/[\xD2-\xD6\xD8]/g, "O").replace(/[\xD9-\xDC]/g, "U").replace(/[\xDD]/g, "Y").replace(/[\xDE]/g, "P").replace(/[\xE0-\xE5]/g, "a").replace(/[\xE6]/g, "ae").replace(/[\xE7]/g, "c").replace(/[\xE8-\xEB]/g, "e").replace(/[\xEC-\xEF]/g, "i").replace(/[\xF1]/g, "n").replace(/[\xF2-\xF6\xF8]/g, "o").replace(/[\xF9-\xFC]/g, "u").replace(/[\xFE]/g, "p").replace(/[\xFD\xFF]/g, "y");
    }
    return str;
  },
  getVNodeProp: function getVNodeProp(vnode, prop) {
    var props = vnode.props;
    if (props) {
      var kebapProp = prop.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      var propName = Object.prototype.hasOwnProperty.call(props, kebapProp) ? kebapProp : prop;
      return vnode.type["extends"].props[prop].type === Boolean && props[propName] === "" ? true : props[propName];
    }
    return null;
  },
  toFlatCase: function toFlatCase(str) {
    return this.isString(str) ? str.replace(/(-|_)/g, "").toLowerCase() : str;
  },
  toKebabCase: function toKebabCase(str) {
    return this.isString(str) ? str.replace(/(_)/g, "-").replace(/[A-Z]/g, function(c, i) {
      return i === 0 ? c : "-" + c.toLowerCase();
    }).toLowerCase() : str;
  },
  toCapitalCase: function toCapitalCase(str) {
    return this.isString(str, {
      empty: false
    }) ? str[0].toUpperCase() + str.slice(1) : str;
  },
  isEmpty: function isEmpty2(value) {
    return value === null || value === void 0 || value === "" || Array.isArray(value) && value.length === 0 || !(value instanceof Date) && _typeof$4(value) === "object" && Object.keys(value).length === 0;
  },
  isNotEmpty: function isNotEmpty(value) {
    return !this.isEmpty(value);
  },
  isFunction: function isFunction2(value) {
    return !!(value && value.constructor && value.call && value.apply);
  },
  isObject: function isObject2(value) {
    var empty = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
    return value instanceof Object && value.constructor === Object && (empty || Object.keys(value).length !== 0);
  },
  isDate: function isDate2(value) {
    return value instanceof Date && value.constructor === Date;
  },
  isArray: function isArray2(value) {
    var empty = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
    return Array.isArray(value) && (empty || value.length !== 0);
  },
  isString: function isString2(value) {
    var empty = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
    return typeof value === "string" && (empty || value !== "");
  },
  isPrintableCharacter: function isPrintableCharacter() {
    var _char = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
    return this.isNotEmpty(_char) && _char.length === 1 && _char.match(/\S| /);
  },
  /**
   * Firefox-v103 does not currently support the "findLast" method. It is stated that this method will be supported with Firefox-v104.
   * https://caniuse.com/mdn-javascript_builtins_array_findlast
   */
  findLast: function findLast(arr, callback) {
    var item;
    if (this.isNotEmpty(arr)) {
      try {
        item = arr.findLast(callback);
      } catch (_unused) {
        item = _toConsumableArray$1(arr).reverse().find(callback);
      }
    }
    return item;
  },
  /**
   * Firefox-v103 does not currently support the "findLastIndex" method. It is stated that this method will be supported with Firefox-v104.
   * https://caniuse.com/mdn-javascript_builtins_array_findlastindex
   */
  findLastIndex: function findLastIndex(arr, callback) {
    var index3 = -1;
    if (this.isNotEmpty(arr)) {
      try {
        index3 = arr.findLastIndex(callback);
      } catch (_unused2) {
        index3 = arr.lastIndexOf(_toConsumableArray$1(arr).reverse().find(callback));
      }
    }
    return index3;
  }
};
var lastId = 0;
function UniqueComponentId() {
  var prefix = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pv_id_";
  lastId++;
  return "".concat(prefix).concat(lastId);
}
var FilterMatchMode = {
  STARTS_WITH: "startsWith",
  CONTAINS: "contains",
  NOT_CONTAINS: "notContains",
  ENDS_WITH: "endsWith",
  EQUALS: "equals",
  NOT_EQUALS: "notEquals",
  IN: "in",
  LESS_THAN: "lt",
  LESS_THAN_OR_EQUAL_TO: "lte",
  GREATER_THAN: "gt",
  GREATER_THAN_OR_EQUAL_TO: "gte",
  BETWEEN: "between",
  DATE_IS: "dateIs",
  DATE_IS_NOT: "dateIsNot",
  DATE_BEFORE: "dateBefore",
  DATE_AFTER: "dateAfter"
};
function _typeof$3(obj) {
  "@babel/helpers - typeof";
  return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof$3(obj);
}
function ownKeys$2(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$2(Object(source), true).forEach(function(key) {
      _defineProperty$3(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$2(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty$3(obj, key, value) {
  key = _toPropertyKey$3(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey$3(arg) {
  var key = _toPrimitive$3(arg, "string");
  return _typeof$3(key) === "symbol" ? key : String(key);
}
function _toPrimitive$3(input, hint) {
  if (_typeof$3(input) !== "object" || input === null)
    return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof$3(res) !== "object")
      return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
var defaultOptions = {
  ripple: false,
  inputStyle: "outlined",
  locale: {
    startsWith: "Starts with",
    contains: "Contains",
    notContains: "Not contains",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Not equals",
    noFilter: "No Filter",
    lt: "Less than",
    lte: "Less than or equal to",
    gt: "Greater than",
    gte: "Greater than or equal to",
    dateIs: "Date is",
    dateIsNot: "Date is not",
    dateBefore: "Date is before",
    dateAfter: "Date is after",
    clear: "Clear",
    apply: "Apply",
    matchAll: "Match All",
    matchAny: "Match Any",
    addRule: "Add Rule",
    removeRule: "Remove Rule",
    accept: "Yes",
    reject: "No",
    choose: "Choose",
    upload: "Upload",
    cancel: "Cancel",
    completed: "Completed",
    pending: "Pending",
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    chooseYear: "Choose Year",
    chooseMonth: "Choose Month",
    chooseDate: "Choose Date",
    prevDecade: "Previous Decade",
    nextDecade: "Next Decade",
    prevYear: "Previous Year",
    nextYear: "Next Year",
    prevMonth: "Previous Month",
    nextMonth: "Next Month",
    prevHour: "Previous Hour",
    nextHour: "Next Hour",
    prevMinute: "Previous Minute",
    nextMinute: "Next Minute",
    prevSecond: "Previous Second",
    nextSecond: "Next Second",
    am: "am",
    pm: "pm",
    today: "Today",
    weekHeader: "Wk",
    firstDayOfWeek: 0,
    dateFormat: "mm/dd/yy",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    passwordPrompt: "Enter a password",
    emptyFilterMessage: "No results found",
    // @deprecated Use 'emptySearchMessage' option instead.
    searchMessage: "{0} results are available",
    selectionMessage: "{0} items selected",
    emptySelectionMessage: "No selected item",
    emptySearchMessage: "No results found",
    emptyMessage: "No available options",
    aria: {
      trueLabel: "True",
      falseLabel: "False",
      nullLabel: "Not Selected",
      star: "1 star",
      stars: "{star} stars",
      selectAll: "All items selected",
      unselectAll: "All items unselected",
      close: "Close",
      previous: "Previous",
      next: "Next",
      navigation: "Navigation",
      scrollTop: "Scroll Top",
      moveTop: "Move Top",
      moveUp: "Move Up",
      moveDown: "Move Down",
      moveBottom: "Move Bottom",
      moveToTarget: "Move to Target",
      moveToSource: "Move to Source",
      moveAllToTarget: "Move All to Target",
      moveAllToSource: "Move All to Source",
      pageLabel: "{page}",
      firstPageLabel: "First Page",
      lastPageLabel: "Last Page",
      nextPageLabel: "Next Page",
      prevPageLabel: "Previous Page",
      rowsPerPageLabel: "Rows per page",
      jumpToPageDropdownLabel: "Jump to Page Dropdown",
      jumpToPageInputLabel: "Jump to Page Input",
      selectRow: "Row Selected",
      unselectRow: "Row Unselected",
      expandRow: "Row Expanded",
      collapseRow: "Row Collapsed",
      showFilterMenu: "Show Filter Menu",
      hideFilterMenu: "Hide Filter Menu",
      filterOperator: "Filter Operator",
      filterConstraint: "Filter Constraint",
      editRow: "Row Edit",
      saveEdit: "Save Edit",
      cancelEdit: "Cancel Edit",
      listView: "List View",
      gridView: "Grid View",
      slide: "Slide",
      slideNumber: "{slideNumber}",
      zoomImage: "Zoom Image",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      rotateRight: "Rotate Right",
      rotateLeft: "Rotate Left"
    }
  },
  filterMatchModeOptions: {
    text: [FilterMatchMode.STARTS_WITH, FilterMatchMode.CONTAINS, FilterMatchMode.NOT_CONTAINS, FilterMatchMode.ENDS_WITH, FilterMatchMode.EQUALS, FilterMatchMode.NOT_EQUALS],
    numeric: [FilterMatchMode.EQUALS, FilterMatchMode.NOT_EQUALS, FilterMatchMode.LESS_THAN, FilterMatchMode.LESS_THAN_OR_EQUAL_TO, FilterMatchMode.GREATER_THAN, FilterMatchMode.GREATER_THAN_OR_EQUAL_TO],
    date: [FilterMatchMode.DATE_IS, FilterMatchMode.DATE_IS_NOT, FilterMatchMode.DATE_BEFORE, FilterMatchMode.DATE_AFTER]
  },
  zIndex: {
    modal: 1100,
    overlay: 1e3,
    menu: 1e3,
    tooltip: 1100
  },
  pt: void 0,
  unstyled: false
};
var PrimeVueSymbol = Symbol();
function switchTheme(currentTheme, newTheme, linkElementId, callback) {
  var linkElement = document.getElementById(linkElementId);
  var cloneLinkElement = linkElement.cloneNode(true);
  var newThemeUrl = linkElement.getAttribute("href").replace(currentTheme, newTheme);
  cloneLinkElement.setAttribute("id", linkElementId + "-clone");
  cloneLinkElement.setAttribute("href", newThemeUrl);
  cloneLinkElement.addEventListener("load", function() {
    linkElement.remove();
    cloneLinkElement.setAttribute("id", linkElementId);
    if (callback) {
      callback();
    }
  });
  linkElement.parentNode && linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);
}
var PrimeVue = {
  install: function install(app, options) {
    var configOptions = options ? _objectSpread$2(_objectSpread$2({}, defaultOptions), options) : _objectSpread$2({}, defaultOptions);
    var PrimeVue2 = {
      config: reactive(configOptions),
      changeTheme: switchTheme
    };
    app.config.globalProperties.$primevue = PrimeVue2;
    app.provide(PrimeVueSymbol, PrimeVue2);
  }
};
function tryOnMounted(fn) {
  var sync = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
  if (getCurrentInstance())
    onMounted(fn);
  else if (sync)
    fn();
  else
    nextTick(fn);
}
var _id = 0;
function useStyle(css) {
  var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  var isLoaded = ref(false);
  var cssRef = ref(css);
  var styleRef = ref(null);
  var defaultDocument = DomHandler.isClient() ? window.document : void 0;
  var _options$document = options.document, document2 = _options$document === void 0 ? defaultDocument : _options$document, _options$immediate = options.immediate, immediate = _options$immediate === void 0 ? true : _options$immediate, _options$manual = options.manual, manual = _options$manual === void 0 ? false : _options$manual, _options$name = options.name, name = _options$name === void 0 ? "style_".concat(++_id) : _options$name, _options$id = options.id, id = _options$id === void 0 ? void 0 : _options$id, _options$media = options.media, media = _options$media === void 0 ? void 0 : _options$media;
  var stop = function stop2() {
  };
  var load = function load2() {
    if (!document2)
      return;
    styleRef.value = document2.querySelector('style[data-primevue-style-id="'.concat(name, '"]')) || document2.getElementById(id) || document2.createElement("style");
    if (!styleRef.value.isConnected) {
      styleRef.value.type = "text/css";
      id && (styleRef.value.id = id);
      media && (styleRef.value.media = media);
      document2.head.appendChild(styleRef.value);
      name && styleRef.value.setAttribute("data-primevue-style-id", name);
    }
    if (isLoaded.value)
      return;
    stop = watch(cssRef, function(value) {
      styleRef.value.textContent = value;
    }, {
      immediate: true
    });
    isLoaded.value = true;
  };
  var unload = function unload2() {
    if (!document2 || !isLoaded.value)
      return;
    stop();
    DomHandler.isExist(styleRef.value) && document2.head.removeChild(styleRef.value);
    isLoaded.value = false;
  };
  if (immediate && !manual)
    tryOnMounted(load);
  return {
    id,
    name,
    css: cssRef,
    unload,
    load,
    isLoaded: readonly(isLoaded)
  };
}
var styles$3 = "\n.p-hidden-accessible {\n    border: 0;\n    clip: rect(0 0 0 0);\n    height: 1px;\n    margin: -1px;\n    overflow: hidden;\n    padding: 0;\n    position: absolute;\n    width: 1px;\n}\n\n.p-hidden-accessible input,\n.p-hidden-accessible select {\n    transform: scale(0);\n}\n\n.p-overflow-hidden {\n    overflow: hidden;\n}\n";
var _useStyle$3 = useStyle(styles$3, {
  name: "base",
  manual: true
}), loadBaseStyle = _useStyle$3.load;
function _typeof$2(obj) {
  "@babel/helpers - typeof";
  return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof$2(obj);
}
function ownKeys$1(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$1(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$1(Object(source), true).forEach(function(key) {
      _defineProperty$2(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty$2(obj, key, value) {
  key = _toPropertyKey$2(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey$2(arg) {
  var key = _toPrimitive$2(arg, "string");
  return _typeof$2(key) === "symbol" ? key : String(key);
}
function _toPrimitive$2(input, hint) {
  if (_typeof$2(input) !== "object" || input === null)
    return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof$2(res) !== "object")
      return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
var inlineStyles = {};
var buttonStyles = "\n.p-button {\n    display: inline-flex;\n    cursor: pointer;\n    user-select: none;\n    align-items: center;\n    vertical-align: bottom;\n    text-align: center;\n    overflow: hidden;\n    position: relative;\n}\n\n.p-button-label {\n    flex: 1 1 auto;\n}\n\n.p-button-icon-right {\n    order: 1;\n}\n\n.p-button:disabled {\n    cursor: default;\n}\n\n.p-button-icon-only {\n    justify-content: center;\n}\n\n.p-button-icon-only .p-button-label {\n    visibility: hidden;\n    width: 0;\n    flex: 0 0 auto;\n}\n\n.p-button-vertical {\n    flex-direction: column;\n}\n\n.p-button-icon-bottom {\n    order: 2;\n}\n\n.p-buttonset .p-button {\n    margin: 0;\n}\n\n.p-buttonset .p-button:not(:last-child) {\n    border-right: 0 none;\n}\n\n.p-buttonset .p-button:not(:first-of-type):not(:last-of-type) {\n    border-radius: 0;\n}\n\n.p-buttonset .p-button:first-of-type {\n    border-top-right-radius: 0;\n    border-bottom-right-radius: 0;\n}\n\n.p-buttonset .p-button:last-of-type {\n    border-top-left-radius: 0;\n    border-bottom-left-radius: 0;\n}\n\n.p-buttonset .p-button:focus {\n    position: relative;\n    z-index: 1;\n}\n";
var checkboxStyles = "\n.p-checkbox {\n    display: inline-flex;\n    cursor: pointer;\n    user-select: none;\n    vertical-align: bottom;\n    position: relative;\n}\n\n.p-checkbox.p-checkbox-disabled {\n    cursor: default;\n}\n\n.p-checkbox-box {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n";
var inputTextStyles = "\n.p-fluid .p-inputtext {\n    width: 100%;\n}\n\n/* InputGroup */\n.p-inputgroup {\n    display: flex;\n    align-items: stretch;\n    width: 100%;\n}\n\n.p-inputgroup-addon {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.p-inputgroup .p-float-label {\n    display: flex;\n    align-items: stretch;\n    width: 100%;\n}\n\n.p-inputgroup .p-inputtext,\n.p-fluid .p-inputgroup .p-inputtext,\n.p-inputgroup .p-inputwrapper,\n.p-fluid .p-inputgroup .p-input {\n    flex: 1 1 auto;\n    width: 1%;\n}\n\n/* Floating Label */\n.p-float-label {\n    display: block;\n    position: relative;\n}\n\n.p-float-label label {\n    position: absolute;\n    pointer-events: none;\n    top: 50%;\n    margin-top: -.5rem;\n    transition-property: all;\n    transition-timing-function: ease;\n    line-height: 1;\n}\n\n.p-float-label textarea ~ label {\n    top: 1rem;\n}\n\n.p-float-label input:focus ~ label,\n.p-float-label input.p-filled ~ label,\n.p-float-label textarea:focus ~ label,\n.p-float-label textarea.p-filled ~ label,\n.p-float-label .p-inputwrapper-focus ~ label,\n.p-float-label .p-inputwrapper-filled ~ label {\n    top: -.75rem;\n    font-size: 12px;\n}\n\n.p-float-label .input:-webkit-autofill ~ label {\n    top: -20px;\n    font-size: 12px;\n}\n\n.p-float-label .p-placeholder,\n.p-float-label input::placeholder,\n.p-float-label .p-inputtext::placeholder {\n    opacity: 0;\n    transition-property: all;\n    transition-timing-function: ease;\n}\n\n.p-float-label .p-focus .p-placeholder,\n.p-float-label input:focus::placeholder,\n.p-float-label .p-inputtext:focus::placeholder {\n    opacity: 1;\n    transition-property: all;\n    transition-timing-function: ease;\n}\n\n.p-input-icon-left,\n.p-input-icon-right {\n    position: relative;\n    display: inline-block;\n}\n\n.p-input-icon-left > i,\n.p-input-icon-left > svg,\n.p-input-icon-right > i,\n.p-input-icon-right > svg {\n    position: absolute;\n    top: 50%;\n    margin-top: -.5rem;\n}\n\n.p-fluid .p-input-icon-left,\n.p-fluid .p-input-icon-right {\n    display: block;\n    width: 100%;\n}\n";
var radioButtonStyles = "\n.p-radiobutton {\n    position: relative;\n    display: inline-flex;\n    cursor: pointer;\n    user-select: none;\n    vertical-align: bottom;\n}\n\n.p-radiobutton.p-radiobutton-disabled {\n    cursor: default;\n}\n\n.p-radiobutton-box {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n.p-radiobutton-icon {\n    -webkit-backface-visibility: hidden;\n    backface-visibility: hidden;\n    transform: translateZ(0) scale(.1);\n    border-radius: 50%;\n    visibility: hidden;\n}\n\n.p-radiobutton-box.p-highlight .p-radiobutton-icon {\n    transform: translateZ(0) scale(1.0, 1.0);\n    visibility: visible;\n}\n";
var styles$2 = "\n.p-component, .p-component * {\n    box-sizing: border-box;\n}\n\n.p-hidden-space {\n    visibility: hidden;\n}\n\n.p-reset {\n    margin: 0;\n    padding: 0;\n    border: 0;\n    outline: 0;\n    text-decoration: none;\n    font-size: 100%;\n    list-style: none;\n}\n\n.p-disabled, .p-disabled * {\n    cursor: default !important;\n    pointer-events: none;\n    user-select: none;\n}\n\n.p-component-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n}\n\n.p-unselectable-text {\n    user-select: none;\n}\n\n.p-sr-only {\n    border: 0;\n    clip: rect(1px, 1px, 1px, 1px);\n    clip-path: inset(50%);\n    height: 1px;\n    margin: -1px;\n    overflow: hidden;\n    padding: 0;\n    position: absolute;\n    width: 1px;\n    word-wrap: normal !important;\n}\n\n.p-link {\n	text-align: left;\n	background-color: transparent;\n	margin: 0;\n	padding: 0;\n	border: none;\n    cursor: pointer;\n    user-select: none;\n}\n\n.p-link:disabled {\n	cursor: default;\n}\n\n/* Non vue overlay animations */\n.p-connected-overlay {\n    opacity: 0;\n    transform: scaleY(0.8);\n    transition: transform .12s cubic-bezier(0, 0, 0.2, 1), opacity .12s cubic-bezier(0, 0, 0.2, 1);\n}\n\n.p-connected-overlay-visible {\n    opacity: 1;\n    transform: scaleY(1);\n}\n\n.p-connected-overlay-hidden {\n    opacity: 0;\n    transform: scaleY(1);\n    transition: opacity .1s linear;\n}\n\n/* Vue based overlay animations */\n.p-connected-overlay-enter-from {\n    opacity: 0;\n    transform: scaleY(0.8);\n}\n\n.p-connected-overlay-leave-to {\n    opacity: 0;\n}\n\n.p-connected-overlay-enter-active {\n    transition: transform .12s cubic-bezier(0, 0, 0.2, 1), opacity .12s cubic-bezier(0, 0, 0.2, 1);\n}\n\n.p-connected-overlay-leave-active {\n    transition: opacity .1s linear;\n}\n\n/* Toggleable Content */\n.p-toggleable-content-enter-from,\n.p-toggleable-content-leave-to {\n    max-height: 0;\n}\n\n.p-toggleable-content-enter-to,\n.p-toggleable-content-leave-from {\n    max-height: 1000px;\n}\n\n.p-toggleable-content-leave-active {\n    overflow: hidden;\n    transition: max-height 0.45s cubic-bezier(0, 1, 0, 1);\n}\n\n.p-toggleable-content-enter-active {\n    overflow: hidden;\n    transition: max-height 1s ease-in-out;\n}\n".concat(buttonStyles, "\n").concat(checkboxStyles, "\n").concat(inputTextStyles, "\n").concat(radioButtonStyles, "\n");
var _useStyle$2 = useStyle(styles$2, {
  name: "common",
  manual: true
}), loadStyle$2 = _useStyle$2.load;
var script$5 = {
  name: "BaseComponent",
  props: {
    pt: {
      type: Object,
      "default": void 0
    },
    unstyled: {
      type: Boolean,
      "default": void 0
    }
  },
  inject: {
    $parentInstance: {
      "default": void 0
    }
  },
  watch: {
    isUnstyled: {
      immediate: true,
      handler: function handler(newValue) {
        if (!newValue) {
          loadStyle$2();
          this.$options.css && this.$css.loadStyle();
        }
      }
    }
  },
  beforeCreate: function beforeCreate() {
    var _this$pt, _this$pt$onBeforeCrea, _this$$primevue, _this$$primevue$onBef;
    (_this$pt = this.pt) === null || _this$pt === void 0 || (_this$pt = _this$pt.hooks) === null || _this$pt === void 0 || (_this$pt$onBeforeCrea = _this$pt["onBeforeCreate"]) === null || _this$pt$onBeforeCrea === void 0 ? void 0 : _this$pt$onBeforeCrea.call(_this$pt);
    (_this$$primevue = this.$primevue) === null || _this$$primevue === void 0 || (_this$$primevue = _this$$primevue.config) === null || _this$$primevue === void 0 || (_this$$primevue = _this$$primevue.pt) === null || _this$$primevue === void 0 || (_this$$primevue = _this$$primevue[this.$.type.name]) === null || _this$$primevue === void 0 || (_this$$primevue = _this$$primevue.hooks) === null || _this$$primevue === void 0 || (_this$$primevue$onBef = _this$$primevue["onBeforeCreate"]) === null || _this$$primevue$onBef === void 0 ? void 0 : _this$$primevue$onBef.call(_this$$primevue);
  },
  created: function created() {
    this._hook("onCreated");
  },
  beforeMount: function beforeMount() {
    loadBaseStyle();
    this._hook("onBeforeMount");
  },
  mounted: function mounted() {
    this._hook("onMounted");
  },
  beforeUpdate: function beforeUpdate() {
    this._hook("onBeforeUpdate");
  },
  updated: function updated() {
    this._hook("onUpdated");
  },
  beforeUnmount: function beforeUnmount() {
    this._hook("onBeforeUnmount");
  },
  unmounted: function unmounted() {
    this._hook("onUnmounted");
  },
  methods: {
    _hook: function _hook(hookName) {
      var selfHook = this._getOptionValue(this.pt, "hooks.".concat(hookName));
      var globalHook = this._getOptionValue(this.globalPT, "hooks.".concat(hookName));
      selfHook === null || selfHook === void 0 ? void 0 : selfHook();
      globalHook === null || globalHook === void 0 ? void 0 : globalHook();
    },
    _getHostInstance: function _getHostInstance(instance) {
      return instance ? this.$options.hostName ? instance.$.type.name === this.$options.hostName ? instance : this._getHostInstance(instance.$parentInstance) : instance.$parentInstance : void 0;
    },
    _getOptionValue: function _getOptionValue(options) {
      var key = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
      var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      var fKeys = ObjectUtils.toFlatCase(key).split(".");
      var fKey = fKeys.shift();
      return fKey ? ObjectUtils.isObject(options) ? this._getOptionValue(ObjectUtils.getItemValue(options[Object.keys(options).find(function(k) {
        return ObjectUtils.toFlatCase(k) === fKey;
      }) || ""], params), fKeys.join("."), params) : void 0 : ObjectUtils.getItemValue(options, params);
    },
    _getPTValue: function _getPTValue() {
      var _this = this;
      var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      var key = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
      var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      var searchInDefaultPT = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
      var getValue = function getValue2() {
        var value = _this._getOptionValue.apply(_this, arguments);
        return ObjectUtils.isString(value) || ObjectUtils.isArray(value) ? {
          "class": value
        } : value;
      };
      var datasetPrefix = "data-pc-";
      var self2 = getValue(obj, key, params);
      var globalPT2 = searchInDefaultPT ? /./g.test(key) && !!params[key.split(".")[0]] ? getValue(this.globalPT, key, params) : getValue(this.defaultPT, key, params) : void 0;
      var merged = mergeProps(self2, globalPT2, _objectSpread$1(_objectSpread$1({}, key === "root" && _defineProperty$2({}, "".concat(datasetPrefix, "name"), ObjectUtils.toFlatCase(this.$.type.name))), {}, _defineProperty$2({}, "".concat(datasetPrefix, "section"), ObjectUtils.toFlatCase(key))));
      return merged;
    },
    ptm: function ptm() {
      var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, key, _objectSpread$1({
        instance: this,
        props: this.$props,
        state: this.$data
      }, params));
    },
    ptmo: function ptmo() {
      var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      var key = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
      var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(obj, key, _objectSpread$1({
        instance: this
      }, params), false);
    },
    cx: function cx() {
      var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return !this.isUnstyled ? this._getOptionValue(this.$css.classes, key, _objectSpread$1({
        instance: this,
        props: this.$props,
        state: this.$data,
        parentInstance: this.$parentInstance
      }, params)) : void 0;
    },
    sx: function sx() {
      var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      var when = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
      var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (when) {
        var self2 = this._getOptionValue(this.$css.inlineStyles, key, _objectSpread$1({
          instance: this,
          props: this.$props,
          state: this.$data,
          parentInstance: this.$parentInstance
        }, params));
        var base = this._getOptionValue(inlineStyles, key, _objectSpread$1({
          instance: this,
          props: this.$props,
          state: this.$data,
          parentInstance: this.$parentInstance
        }, params));
        return [base, self2];
      }
      return void 0;
    }
  },
  computed: {
    globalPT: function globalPT() {
      return ObjectUtils.getItemValue(this.$primevue.config.pt, {
        instance: this
      });
    },
    defaultPT: function defaultPT() {
      return this._getOptionValue(this.$primevue.config.pt, this.$options.hostName || this.$.type.name, {
        instance: this
      }) || this.globalPT;
    },
    isUnstyled: function isUnstyled() {
      return this.unstyled !== void 0 ? this.unstyled : this.$primevue.config.unstyled;
    },
    $css: function $css() {
      return _objectSpread$1(_objectSpread$1({
        classes: void 0,
        inlineStyles: void 0,
        loadStyle: function loadStyle2() {
        }
      }, (this._getHostInstance(this) || {}).$css), this.$options.css);
    }
  }
};
var styles$1 = "\n.p-badge {\n    display: inline-block;\n    border-radius: 10px;\n    text-align: center;\n    padding: 0 .5rem;\n}\n\n.p-overlay-badge {\n    position: relative;\n}\n\n.p-overlay-badge .p-badge {\n    position: absolute;\n    top: 0;\n    right: 0;\n    transform: translate(50%,-50%);\n    transform-origin: 100% 0;\n    margin: 0;\n}\n\n.p-badge-dot {\n    width: .5rem;\n    min-width: .5rem;\n    height: .5rem;\n    border-radius: 50%;\n    padding: 0;\n}\n\n.p-badge-no-gutter {\n    padding: 0;\n    border-radius: 50%;\n}\n";
var classes$2 = {
  root: function root(_ref) {
    var props = _ref.props, instance = _ref.instance;
    return ["p-badge p-component", {
      "p-badge-no-gutter": ObjectUtils.isNotEmpty(props.value) && String(props.value).length === 1,
      "p-badge-dot": ObjectUtils.isEmpty(props.value) && !instance.$slots["default"],
      "p-badge-lg": props.size === "large",
      "p-badge-xl": props.size === "xlarge",
      "p-badge-info": props.severity === "info",
      "p-badge-success": props.severity === "success",
      "p-badge-warning": props.severity === "warning",
      "p-badge-danger": props.severity === "danger"
    }];
  }
};
var _useStyle$1 = useStyle(styles$1, {
  name: "badge",
  manual: true
}), loadStyle$1 = _useStyle$1.load;
var script$1$1 = {
  name: "BaseBadge",
  "extends": script$5,
  props: {
    value: {
      type: [String, Number],
      "default": null
    },
    severity: {
      type: String,
      "default": null
    },
    size: {
      type: String,
      "default": null
    }
  },
  css: {
    classes: classes$2,
    loadStyle: loadStyle$1
  },
  provide: function provide2() {
    return {
      $parentInstance: this
    };
  }
};
var script$4 = {
  name: "Badge",
  "extends": script$1$1
};
function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps({
    "class": _ctx.cx("root")
  }, _ctx.ptm("root"), {
    "data-pc-name": "badge"
  }), [renderSlot(_ctx.$slots, "default", {}, function() {
    return [createTextVNode(toDisplayString$1(_ctx.value), 1)];
  })], 16);
}
script$4.render = render$2;
var script$3 = {
  name: "BaseIcon",
  props: {
    label: {
      type: String,
      "default": void 0
    },
    spin: {
      type: Boolean,
      "default": false
    }
  },
  methods: {
    pti: function pti() {
      var isLabelEmpty = ObjectUtils.isEmpty(this.label);
      return {
        "class": ["p-icon", {
          "p-icon-spin": this.spin
        }],
        role: !isLabelEmpty ? "img" : void 0,
        "aria-label": !isLabelEmpty ? this.label : void 0,
        "aria-hidden": isLabelEmpty
      };
    }
  }
};
function styleInject(css, ref2) {
  if (ref2 === void 0)
    ref2 = {};
  var insertAt = ref2.insertAt;
  if (!css || true) {
    return;
  }
  var head = document.head || document.getElementsByTagName("head")[0];
  var style2 = document.createElement("style");
  style2.type = "text/css";
  if (insertAt === "top") {
    if (head.firstChild) {
      head.insertBefore(style2, head.firstChild);
    } else {
      head.appendChild(style2);
    }
  } else {
    head.appendChild(style2);
  }
  if (style2.styleSheet) {
    style2.styleSheet.cssText = css;
  } else {
    style2.appendChild(document.createTextNode(css));
  }
}
var css_248z = "\n.p-icon {\n    display: inline-block;\n}\n.p-icon-spin {\n    -webkit-animation: p-icon-spin 2s infinite linear;\n    animation: p-icon-spin 2s infinite linear;\n}\n@-webkit-keyframes p-icon-spin {\n0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n}\n100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n}\n}\n@keyframes p-icon-spin {\n0% {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n}\n100% {\n        -webkit-transform: rotate(359deg);\n        transform: rotate(359deg);\n}\n}\n";
styleInject(css_248z);
var script$2 = {
  name: "SpinnerIcon",
  "extends": script$3,
  computed: {
    pathId: function pathId() {
      return "pv_icon_clip_".concat(UniqueComponentId());
    }
  }
};
var _hoisted_1$1 = ["clipPath"];
var _hoisted_2 = /* @__PURE__ */ createElementVNode("path", {
  d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
  fill: "currentColor"
}, null, -1);
var _hoisted_3 = [_hoisted_2];
var _hoisted_4 = ["id"];
var _hoisted_5 = /* @__PURE__ */ createElementVNode("rect", {
  width: "14",
  height: "14",
  fill: "white"
}, null, -1);
var _hoisted_6 = [_hoisted_5];
function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("svg", mergeProps({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, _ctx.pti()), [createElementVNode("g", {
    clipPath: "url(#".concat($options.pathId, ")")
  }, _hoisted_3, 8, _hoisted_1$1), createElementVNode("defs", null, [createElementVNode("clipPath", {
    id: "".concat($options.pathId)
  }, _hoisted_6, 8, _hoisted_4)])], 16);
}
script$2.render = render$1;
function _typeof$1(obj) {
  "@babel/helpers - typeof";
  return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof$1(obj);
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray$1(arr, i) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$1(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray$1(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray$1(o, minLen);
}
function _arrayLikeToArray$1(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _iterableToArrayLimit(arr, i) {
  var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
  if (null != _i) {
    var _s, _e, _x, _r, _arr = [], _n = true, _d = false;
    try {
      if (_x = (_i = _i.call(arr)).next, 0 === i) {
        if (Object(_i) !== _i)
          return;
        _n = false;
      } else
        for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = true)
          ;
    } catch (err) {
      _d = true, _e = err;
    } finally {
      try {
        if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r))
          return;
      } finally {
        if (_d)
          throw _e;
      }
    }
    return _arr;
  }
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr))
    return arr;
}
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
      _defineProperty$1(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty$1(obj, key, value) {
  key = _toPropertyKey$1(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey$1(arg) {
  var key = _toPrimitive$1(arg, "string");
  return _typeof$1(key) === "symbol" ? key : String(key);
}
function _toPrimitive$1(input, hint) {
  if (_typeof$1(input) !== "object" || input === null)
    return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof$1(res) !== "object")
      return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
var BaseDirective = {
  _getMeta: function _getMeta() {
    return [ObjectUtils.isObject(arguments.length <= 0 ? void 0 : arguments[0]) ? void 0 : arguments.length <= 0 ? void 0 : arguments[0], ObjectUtils.getItemValue(ObjectUtils.isObject(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getOptionValue: function _getOptionValue2(options) {
    var key = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var fKeys = ObjectUtils.toFlatCase(key).split(".");
    var fKey = fKeys.shift();
    return fKey ? ObjectUtils.isObject(options) ? BaseDirective._getOptionValue(ObjectUtils.getItemValue(options[Object.keys(options).find(function(k) {
      return ObjectUtils.toFlatCase(k) === fKey;
    }) || ""], params), fKeys.join("."), params) : void 0 : ObjectUtils.getItemValue(options, params);
  },
  _getPTValue: function _getPTValue2() {
    var instance = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var obj = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var key = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "";
    var params = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    var searchInDefaultPT = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : true;
    var getValue = function getValue2() {
      var value = BaseDirective._getOptionValue.apply(BaseDirective, arguments);
      return ObjectUtils.isString(value) || ObjectUtils.isArray(value) ? {
        "class": value
      } : value;
    };
    var datasetPrefix = "data-pc-";
    var self2 = getValue(obj, key, params);
    var globalPT2 = searchInDefaultPT ? getValue(instance.defaultPT, key, params) : void 0;
    var merged = mergeProps(self2, globalPT2, _objectSpread(_objectSpread({}, key === "root" && _defineProperty$1({}, "".concat(datasetPrefix, "name"), ObjectUtils.toFlatCase(instance.$name))), {}, _defineProperty$1({}, "".concat(datasetPrefix, "section"), ObjectUtils.toFlatCase(key))));
    return merged;
  },
  _hook: function _hook2(directiveName, hookName, el, binding, vnode, prevVnode) {
    var _binding$instance, _binding$value, _config$pt;
    var name = "on".concat(ObjectUtils.toCapitalCase(hookName));
    var config = binding === null || binding === void 0 || (_binding$instance = binding.instance) === null || _binding$instance === void 0 || (_binding$instance = _binding$instance.$primevue) === null || _binding$instance === void 0 ? void 0 : _binding$instance.config;
    var selfHook = binding === null || binding === void 0 || (_binding$value = binding.value) === null || _binding$value === void 0 || (_binding$value = _binding$value.pt) === null || _binding$value === void 0 || (_binding$value = _binding$value.hooks) === null || _binding$value === void 0 ? void 0 : _binding$value[name];
    var globalHook = config === null || config === void 0 || (_config$pt = config.pt) === null || _config$pt === void 0 || (_config$pt = _config$pt.directives) === null || _config$pt === void 0 || (_config$pt = _config$pt[directiveName]) === null || _config$pt === void 0 || (_config$pt = _config$pt.hooks) === null || _config$pt === void 0 ? void 0 : _config$pt[name];
    var options = {
      el,
      binding,
      vnode,
      prevVnode
    };
    selfHook === null || selfHook === void 0 ? void 0 : selfHook(el === null || el === void 0 ? void 0 : el.$instance, options);
    globalHook === null || globalHook === void 0 ? void 0 : globalHook(el === null || el === void 0 ? void 0 : el.$instance, options);
  },
  _extend: function _extend(name) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var handleHook = function handleHook2(hook, el, binding, vnode, prevVnode) {
      var _binding$instance2, _config$pt2, _el$$instance$hook, _el$$instance5;
      el._$instances = el._$instances || {};
      var config = binding === null || binding === void 0 || (_binding$instance2 = binding.instance) === null || _binding$instance2 === void 0 || (_binding$instance2 = _binding$instance2.$primevue) === null || _binding$instance2 === void 0 ? void 0 : _binding$instance2.config;
      var $prevInstance = el._$instances[name] || {};
      var $options = ObjectUtils.isEmpty($prevInstance) ? _objectSpread(_objectSpread({}, options), options === null || options === void 0 ? void 0 : options.methods) : {};
      el._$instances[name] = _objectSpread(_objectSpread({}, $prevInstance), {}, {
        /* new instance variables to pass in directive methods */
        $name: name,
        $host: el,
        $binding: binding,
        $el: $prevInstance["$el"] || void 0,
        $css: _objectSpread({
          classes: void 0,
          inlineStyles: void 0,
          loadStyle: function loadStyle2() {
          }
        }, options === null || options === void 0 ? void 0 : options.css),
        /* computed instance variables */
        defaultPT: config === null || config === void 0 || (_config$pt2 = config.pt) === null || _config$pt2 === void 0 || (_config$pt2 = _config$pt2.directives) === null || _config$pt2 === void 0 ? void 0 : _config$pt2[name],
        isUnstyled: el.unstyled !== void 0 ? el.unstyled : config === null || config === void 0 ? void 0 : config.unstyled,
        /* instance's methods */
        ptm: function ptm2() {
          var _el$$instance;
          var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
          var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return BaseDirective._getPTValue(el.$instance, (_el$$instance = el.$instance) === null || _el$$instance === void 0 || (_el$$instance = _el$$instance.$binding) === null || _el$$instance === void 0 || (_el$$instance = _el$$instance.value) === null || _el$$instance === void 0 ? void 0 : _el$$instance.pt, key, _objectSpread({}, params));
        },
        ptmo: function ptmo2() {
          var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
          var key = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
          var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return BaseDirective._getPTValue(el.$instance, obj, key, params, false);
        },
        cx: function cx2() {
          var _el$$instance2, _el$$instance3;
          var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
          var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return !((_el$$instance2 = el.$instance) !== null && _el$$instance2 !== void 0 && _el$$instance2.isUnstyled) ? BaseDirective._getOptionValue((_el$$instance3 = el.$instance) === null || _el$$instance3 === void 0 || (_el$$instance3 = _el$$instance3.$css) === null || _el$$instance3 === void 0 ? void 0 : _el$$instance3.classes, key, _objectSpread({}, params)) : void 0;
        },
        sx: function sx2() {
          var _el$$instance4;
          var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
          var when = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
          var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return when ? BaseDirective._getOptionValue((_el$$instance4 = el.$instance) === null || _el$$instance4 === void 0 || (_el$$instance4 = _el$$instance4.$css) === null || _el$$instance4 === void 0 ? void 0 : _el$$instance4.inlineStyles, key, _objectSpread({}, params)) : void 0;
        }
      }, $options);
      el.$instance = el._$instances[name];
      (_el$$instance$hook = (_el$$instance5 = el.$instance)[hook]) === null || _el$$instance$hook === void 0 ? void 0 : _el$$instance$hook.call(_el$$instance5, el, binding, vnode, prevVnode);
      BaseDirective._hook(name, hook, el, binding, vnode, prevVnode);
    };
    return {
      created: function created2(el, binding, vnode, prevVnode) {
        handleHook("created", el, binding, vnode, prevVnode);
      },
      beforeMount: function beforeMount2(el, binding, vnode, prevVnode) {
        var _el$$instance6, _el$$instance7;
        loadBaseStyle();
        !((_el$$instance6 = el.$instance) !== null && _el$$instance6 !== void 0 && _el$$instance6.isUnstyled) && ((_el$$instance7 = el.$instance) === null || _el$$instance7 === void 0 || (_el$$instance7 = _el$$instance7.$css) === null || _el$$instance7 === void 0 ? void 0 : _el$$instance7.loadStyle());
        handleHook("beforeMount", el, binding, vnode, prevVnode);
      },
      mounted: function mounted3(el, binding, vnode, prevVnode) {
        handleHook("mounted", el, binding, vnode, prevVnode);
      },
      beforeUpdate: function beforeUpdate2(el, binding, vnode, prevVnode) {
        handleHook("beforeUpdate", el, binding, vnode, prevVnode);
      },
      updated: function updated2(el, binding, vnode, prevVnode) {
        handleHook("updated", el, binding, vnode, prevVnode);
      },
      beforeUnmount: function beforeUnmount2(el, binding, vnode, prevVnode) {
        handleHook("beforeUnmount", el, binding, vnode, prevVnode);
      },
      unmounted: function unmounted3(el, binding, vnode, prevVnode) {
        handleHook("unmounted", el, binding, vnode, prevVnode);
      }
    };
  },
  extend: function extend() {
    var _BaseDirective$_getMe = BaseDirective._getMeta.apply(BaseDirective, arguments), _BaseDirective$_getMe2 = _slicedToArray(_BaseDirective$_getMe, 2), name = _BaseDirective$_getMe2[0], options = _BaseDirective$_getMe2[1];
    return _objectSpread({
      extend: function extend2() {
        var _BaseDirective$_getMe3 = BaseDirective._getMeta.apply(BaseDirective, arguments), _BaseDirective$_getMe4 = _slicedToArray(_BaseDirective$_getMe3, 2), _name = _BaseDirective$_getMe4[0], _options = _BaseDirective$_getMe4[1];
        return BaseDirective.extend(_name, _objectSpread(_objectSpread(_objectSpread({}, options), options === null || options === void 0 ? void 0 : options.methods), _options));
      }
    }, BaseDirective._extend(name, options));
  }
};
var styles = "\n.p-ripple {\n    overflow: hidden;\n    position: relative;\n}\n\n.p-ink {\n    display: block;\n    position: absolute;\n    background: rgba(255, 255, 255, 0.5);\n    border-radius: 100%;\n    transform: scale(0);\n    pointer-events: none;\n}\n\n.p-ink-active {\n    animation: ripple 0.4s linear;\n}\n\n.p-ripple-disabled .p-ink {\n    display: none !important;\n}\n\n@keyframes ripple {\n    100% {\n        opacity: 0;\n        transform: scale(2.5);\n    }\n}\n";
var classes$1 = {
  root: "p-ink"
};
var _useStyle = useStyle(styles, {
  name: "ripple",
  manual: true
}), loadStyle = _useStyle.load;
var BaseRipple = BaseDirective.extend({
  css: {
    classes: classes$1,
    loadStyle
  }
});
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
    return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr))
    return _arrayLikeToArray(arr);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
var Ripple = BaseRipple.extend("ripple", {
  mounted: function mounted2(el, binding) {
    var primevue = binding.instance.$primevue;
    if (primevue && primevue.config && primevue.config.ripple) {
      var _binding$value;
      el.unstyled = primevue.config.unstyled || ((_binding$value = binding.value) === null || _binding$value === void 0 ? void 0 : _binding$value.unstyled) || false;
      this.create(el);
      this.bindEvents(el);
    }
    el.setAttribute("data-pd-ripple", true);
  },
  unmounted: function unmounted2(el) {
    this.remove(el);
  },
  timeout: void 0,
  methods: {
    bindEvents: function bindEvents(el) {
      el.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function unbindEvents(el) {
      el.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    create: function create(el) {
      var ink = DomHandler.createElement("span", {
        role: "presentation",
        "aria-hidden": true,
        "data-p-ink": true,
        "data-p-ink-active": false,
        "class": !el.unstyled && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd,
        "p-bind": this.ptm("root")
      });
      el.appendChild(ink);
      this.$el = ink;
    },
    remove: function remove(el) {
      var ink = this.getInk(el);
      if (ink) {
        this.unbindEvents(el);
        ink.removeEventListener("animationend", this.onAnimationEnd);
        ink.remove();
      }
    },
    onMouseDown: function onMouseDown(event) {
      var target = event.currentTarget;
      var ink = this.getInk(target);
      if (!ink || getComputedStyle(ink, null).display === "none") {
        return;
      }
      !target.unstyled && DomHandler.removeClass(ink, "p-ink-active");
      ink.setAttribute("data-p-ink-active", "false");
      if (!DomHandler.getHeight(ink) && !DomHandler.getWidth(ink)) {
        var d = Math.max(DomHandler.getOuterWidth(target), DomHandler.getOuterHeight(target));
        ink.style.height = d + "px";
        ink.style.width = d + "px";
      }
      var offset = DomHandler.getOffset(target);
      var x = event.pageX - offset.left + document.body.scrollTop - DomHandler.getWidth(ink) / 2;
      var y = event.pageY - offset.top + document.body.scrollLeft - DomHandler.getHeight(ink) / 2;
      ink.style.top = y + "px";
      ink.style.left = x + "px";
      !target.unstyled && DomHandler.addClass(ink, "p-ink-active");
      ink.setAttribute("data-p-ink-active", "true");
      this.timeout = setTimeout(function() {
        if (ink) {
          !target.unstyled && DomHandler.removeClass(ink, "p-ink-active");
          ink.setAttribute("data-p-ink-active", "false");
        }
      }, 401);
    },
    onAnimationEnd: function onAnimationEnd(event) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      !event.currentTarget.unstyled && DomHandler.removeClass(event.currentTarget, "p-ink-active");
      event.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function getInk(el) {
      return el && el.children ? _toConsumableArray(el.children).find(function(child) {
        return DomHandler.getAttribute(child, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function _typeof(obj) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof(obj);
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}
function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null)
    return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object")
      return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
var classes = {
  root: function root2(_ref) {
    var _ref2;
    var instance = _ref.instance, props = _ref.props;
    return ["p-button p-component", (_ref2 = {
      "p-button-icon-only": instance.hasIcon && !props.label && !props.badge,
      "p-button-vertical": (props.iconPos === "top" || props.iconPos === "bottom") && props.label,
      "p-disabled": instance.$attrs.disabled || instance.$attrs.disabled === "" || props.loading,
      "p-button-loading": props.loading,
      "p-button-loading-label-only": props.loading && !instance.hasIcon && props.label,
      "p-button-link": props.link
    }, _defineProperty(_ref2, "p-button-".concat(props.severity), props.severity), _defineProperty(_ref2, "p-button-raised", props.raised), _defineProperty(_ref2, "p-button-rounded", props.rounded), _defineProperty(_ref2, "p-button-text", props.text), _defineProperty(_ref2, "p-button-outlined", props.outlined), _defineProperty(_ref2, "p-button-sm", props.size === "small"), _defineProperty(_ref2, "p-button-lg", props.size === "large"), _defineProperty(_ref2, "p-button-plain", props.plain), _ref2)];
  },
  loadingIcon: "p-button-loading-icon pi-spin",
  icon: function icon(_ref3) {
    var props = _ref3.props;
    return ["p-button-icon", {
      "p-button-icon-left": props.iconPos === "left" && props.label,
      "p-button-icon-right": props.iconPos === "right" && props.label,
      "p-button-icon-top": props.iconPos === "top" && props.label,
      "p-button-icon-bottom": props.iconPos === "bottom" && props.label
    }];
  },
  label: "p-button-label"
};
var script$1 = {
  name: "BaseButton",
  "extends": script$5,
  props: {
    label: {
      type: String,
      "default": null
    },
    icon: {
      type: String,
      "default": null
    },
    iconPos: {
      type: String,
      "default": "left"
    },
    iconClass: {
      type: String,
      "default": null
    },
    badge: {
      type: String,
      "default": null
    },
    badgeClass: {
      type: String,
      "default": null
    },
    loading: {
      type: Boolean,
      "default": false
    },
    loadingIcon: {
      type: String,
      "default": void 0
    },
    link: {
      type: Boolean,
      "default": false
    },
    severity: {
      type: String,
      "default": null
    },
    raised: {
      type: Boolean,
      "default": false
    },
    rounded: {
      type: Boolean,
      "default": false
    },
    text: {
      type: Boolean,
      "default": false
    },
    outlined: {
      type: Boolean,
      "default": false
    },
    size: {
      type: String,
      "default": null
    },
    plain: {
      type: Boolean,
      "default": false
    }
  },
  css: {
    classes
  },
  provide: function provide3() {
    return {
      $parentInstance: this
    };
  }
};
var script = {
  name: "Button",
  "extends": script$1,
  methods: {
    getPTOptions: function getPTOptions(key) {
      return this.ptm(key, {
        context: {
          disabled: this.disabled
        }
      });
    }
  },
  computed: {
    disabled: function disabled() {
      return this.$attrs.disabled || this.$attrs.disabled === "" || this.loading;
    },
    defaultAriaLabel: function defaultAriaLabel() {
      return this.label ? this.label + (this.badge ? " " + this.badge : "") : this.$attrs["aria-label"];
    },
    hasIcon: function hasIcon() {
      return this.icon || this.$slots.icon;
    }
  },
  components: {
    SpinnerIcon: script$2,
    Badge: script$4
  },
  directives: {
    ripple: Ripple
  }
};
var _hoisted_1 = ["aria-label", "disabled", "data-pc-severity"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  var _component_SpinnerIcon = resolveComponent("SpinnerIcon");
  var _component_Badge = resolveComponent("Badge");
  var _directive_ripple = resolveDirective("ripple");
  return withDirectives((openBlock(), createElementBlock("button", mergeProps({
    "class": _ctx.cx("root"),
    type: "button",
    "aria-label": $options.defaultAriaLabel,
    disabled: $options.disabled
  }, $options.getPTOptions("root"), {
    "data-pc-name": "button",
    "data-pc-severity": _ctx.severity
  }), [renderSlot(_ctx.$slots, "default", {}, function() {
    return [_ctx.loading ? renderSlot(_ctx.$slots, "loadingicon", {
      key: 0,
      "class": normalizeClass([_ctx.cx("loadingIcon"), _ctx.cx("icon")])
    }, function() {
      return [_ctx.loadingIcon ? (openBlock(), createElementBlock("span", mergeProps({
        key: 0,
        "class": [_ctx.cx("loadingIcon"), _ctx.cx("icon"), _ctx.loadingIcon]
      }, _ctx.ptm("loadingIcon")), null, 16)) : (openBlock(), createBlock(_component_SpinnerIcon, mergeProps({
        key: 1,
        "class": [_ctx.cx("loadingIcon"), _ctx.cx("icon")],
        spin: ""
      }, _ctx.ptm("loadingIcon")), null, 16, ["class"]))];
    }) : renderSlot(_ctx.$slots, "icon", {
      key: 1,
      "class": normalizeClass(_ctx.cx("icon"))
    }, function() {
      return [_ctx.icon ? (openBlock(), createElementBlock("span", mergeProps({
        key: 0,
        "class": [_ctx.cx("icon"), _ctx.icon]
      }, _ctx.ptm("icon")), null, 16)) : createCommentVNode("", true)];
    }), createElementVNode("span", mergeProps({
      "class": _ctx.cx("label")
    }, _ctx.ptm("label")), toDisplayString$1(_ctx.label || " "), 17), _ctx.badge ? (openBlock(), createBlock(_component_Badge, mergeProps({
      key: 2,
      value: _ctx.badge,
      "class": _ctx.badgeClass,
      unstyled: _ctx.unstyled
    }, _ctx.ptm("badge")), null, 16, ["value", "class", "unstyled"])) : createCommentVNode("", true)];
  })], 16, _hoisted_1)), [[_directive_ripple]]);
}
script.render = render;
const primevue_TdXjRgL1MA = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue);
  nuxtApp.vueApp.component("Button", script);
});
const plugins = [
  plugin$1,
  plugin,
  revive_payload_server_eJ33V7gbc6,
  components_plugin_KR1HBZs4kY,
  unhead_KgADcZ0jPj,
  plugin_FRmGFsEaPh,
  plugin_server_XNCxeHyTuP,
  cookies_fWsGjKD4Pq,
  i18n_VfGcjrvSkj,
  primevue_TdXjRgL1MA
];
const _imports_0$2 = "" + __publicAssetsURL("images/loading.png");
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$k = {};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-screen w-full flex items-center justify-center" }, _attrs))} data-v-4911785a><h2 class="animate" data-v-4911785a><img${ssrRenderAttr("src", _imports_0$2)} class="w-40" data-v-4911785a></h2></div>`);
}
const _sfc_setup$k = _sfc_main$k.setup;
_sfc_main$k.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LoadingPage.vue");
  return _sfc_setup$k ? _sfc_setup$k(props, ctx) : void 0;
};
const __nuxt_component_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["ssrRender", _sfc_ssrRender$3], ["__scopeId", "data-v-4911785a"]]);
const _wrapIf = (component, props, slots) => {
  props = props === true ? {} : props;
  return { default: () => {
    var _a;
    return props ? h(component, props, slots) : (_a = slots.default) == null ? void 0 : _a.call(slots);
  } };
};
const layouts = {
  default: () => Promise.resolve().then(function() {
    return _default;
  }).then((m) => m.default || m),
  home: () => Promise.resolve().then(function() {
    return home$1;
  }).then((m) => m.default || m)
};
const LayoutLoader = /* @__PURE__ */ defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  async setup(props, context) {
    const LayoutComponent = await layouts[props.name]().then((r) => r.default || r);
    return () => h(LayoutComponent, props.layoutProps, context.slots);
  }
});
const __nuxt_component_1$3 = /* @__PURE__ */ defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean, Object],
      default: null
    }
  },
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const route = injectedRoute === useRoute() ? useRoute$1() : injectedRoute;
    const layout = computed(() => unref(props.name) ?? route.meta.layout ?? "default");
    const layoutRef = ref();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    return () => {
      const hasLayout = layout.value && layout.value in layouts;
      const transitionProps = route.meta.layoutTransition ?? appLayoutTransition;
      return _wrapIf(Transition, hasLayout && transitionProps, {
        default: () => h(Suspense, { suspensible: true, onResolve: () => {
          nextTick(done);
        } }, {
          default: () => h(
            // @ts-expect-error seems to be an issue in vue types
            LayoutProvider,
            {
              layoutProps: mergeProps(context.attrs, { ref: layoutRef }),
              key: layout.value,
              name: layout.value,
              shouldProvide: !props.name,
              hasTransition: !!transitionProps
            },
            context.slots
          )
        })
      }).default();
    };
  }
});
const LayoutProvider = /* @__PURE__ */ defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        isCurrent: (route) => name === (route.meta.layout ?? "default")
      });
    }
    return () => {
      var _a, _b;
      if (!name || typeof name === "string" && !(name in layouts)) {
        return (_b = (_a = context.slots).default) == null ? void 0 : _b.call(_a);
      }
      return h(
        // @ts-expect-error seems to be an issue in vue types
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const interpolatePath = (route, match) => {
  return match.path.replace(/(:\w+)\([^)]+\)/g, "$1").replace(/(:\w+)[?+*]/g, "$1").replace(/:\w+/g, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
};
const generateRouteKey = (routeProps, override) => {
  const matchedRoute = routeProps.route.matched.find((m) => {
    var _a;
    return ((_a = m.components) == null ? void 0 : _a.default) === routeProps.Component.type;
  });
  const source = override ?? (matchedRoute == null ? void 0 : matchedRoute.meta.key) ?? (matchedRoute && interpolatePath(routeProps.route, matchedRoute));
  return typeof source === "function" ? source(routeProps.route) : source;
};
const wrapInKeepAlive = (props, children) => {
  return { default: () => children };
};
const RouteProvider = /* @__PURE__ */ defineComponent({
  name: "RouteProvider",
  props: {
    vnode: {
      type: Object,
      required: true
    },
    route: {
      type: Object,
      required: true
    },
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key]
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const __nuxt_component_2$1 = /* @__PURE__ */ defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    inject(PageRouteSymbol, null);
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    let vnode;
    const done = nuxtApp.deferHydration();
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          if (!routeProps.Component) {
            return;
          }
          const key = generateRouteKey(routeProps, props.pageKey);
          const hasTransition = !!(props.transition ?? routeProps.route.meta.pageTransition ?? appPageTransition);
          const transitionProps = hasTransition && _mergeTransitionProps([
            props.transition,
            routeProps.route.meta.pageTransition,
            appPageTransition,
            { onAfterLeave: () => {
              nuxtApp.callHook("page:transition:finish", routeProps.Component);
            } }
          ].filter(Boolean));
          vnode = _wrapIf(
            Transition,
            hasTransition && transitionProps,
            wrapInKeepAlive(
              props.keepalive ?? routeProps.route.meta.keepalive ?? appKeepalive,
              h(Suspense, {
                suspensible: true,
                onPending: () => nuxtApp.callHook("page:start", routeProps.Component),
                onResolve: () => {
                  nextTick(() => nuxtApp.callHook("page:finish", routeProps.Component).finally(done));
                }
              }, {
                // @ts-expect-error seems to be an issue in vue types
                default: () => h(RouteProvider, {
                  key,
                  vnode: routeProps.Component,
                  route: routeProps.route,
                  renderKey: key,
                  trackRootNodes: hasTransition,
                  vnodeRef: pageRef
                })
              })
            )
          ).default();
          return vnode;
        }
      });
    };
  }
});
function _toArray(val) {
  return Array.isArray(val) ? val : val ? [val] : [];
}
function _mergeTransitionProps(routeProps) {
  const _props = routeProps.map((prop) => ({
    ...prop,
    onAfterLeave: _toArray(prop.onAfterLeave)
  }));
  return defu(..._props);
}
const _sfc_main$j = {
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const { locale } = useI18n({ useScope: "global" });
    const cookieLocale = useLocaleStore();
    locale.value = cookieLocale.getLocale || "en";
    const loadingPage = ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoadingPage = __nuxt_component_0$2;
      const _component_NuxtLayout = __nuxt_component_1$3;
      const _component_NuxtPage = __nuxt_component_2$1;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_LoadingPage, {
        style: !unref(loadingPage) ? null : { display: "none" }
      }, null, _parent));
      _push(ssrRenderComponent(_component_NuxtLayout, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtPage, { transition: "" }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtPage, { transition: "" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const AppComponent = _sfc_main$j;
const _sfc_main$i = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    (_error.stack || "").split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n");
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = /* @__PURE__ */ defineAsyncComponent(() => Promise.resolve().then(function() {
      return error404$1;
    }).then((r) => r.default || r));
    const _Error = /* @__PURE__ */ defineAsyncComponent(() => Promise.resolve().then(function() {
      return error500$1;
    }).then((r) => r.default || r));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const ErrorComponent = _sfc_main$i;
const _sfc_main$h = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = /* @__PURE__ */ defineAsyncComponent(() => Promise.resolve().then(function() {
      return islandRenderer$1;
    }).then((r) => r.default || r));
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const { islandContext } = nuxtApp.ssrContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(error)) {
            _push(ssrRenderComponent(unref(ErrorComponent), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(AppComponent), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const RootComponent = _sfc_main$h;
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(RootComponent);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (err) {
      await nuxt.hooks.callHook("app:error", err);
      nuxt.payload.error = nuxt.payload.error || err;
    }
    if (ssrContext == null ? void 0 : ssrContext._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry$1 = (ctx) => entry(ctx);
const tailwind = `/*! tailwindcss v3.3.2 | MIT License | https://tailwindcss.com*/*,:after,:before{border:0 solid #e5e7eb;box-sizing:border-box}:after,:before{--tw-content:""}html{-webkit-text-size-adjust:100%;font-feature-settings:normal;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-variation-settings:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{line-height:inherit;margin:0}hr{border-top-width:1px;color:inherit;height:0}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{border-collapse:collapse;border-color:inherit;text-indent:0}button,input,optgroup,select,textarea{color:inherit;font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{color:#9ca3af;opacity:1}input::placeholder,textarea::placeholder{color:#9ca3af;opacity:1}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{height:auto;max-width:100%}[hidden]{display:none}*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }.container{width:100%}@media (min-width:640px){.container{max-width:640px}}@media (min-width:768px){.container{max-width:768px}}@media (min-width:1024px){.container{max-width:1024px}}@media (min-width:1280px){.container{max-width:1280px}}@media (min-width:1536px){.container{max-width:1536px}}.fixed{position:fixed}.relative{position:relative}.bottom-20{bottom:5rem}.left-0{left:0}.right-0{right:0}.z-\\[100\\]{z-index:100}.mx-auto{margin-left:auto;margin-right:auto}.my-auto{margin-bottom:auto;margin-top:auto}.mb-20{margin-bottom:5rem}.mb-4{margin-bottom:1rem}.mb-5{margin-bottom:1.25rem}.mr-2{margin-right:.5rem}.mr-4{margin-right:1rem}.mt-2{margin-top:.5rem}.mt-4{margin-top:1rem}.mt-5{margin-top:1.25rem}.mt-auto{margin-top:auto}.block{display:block}.flex{display:flex}.grid{display:grid}.hidden{display:none}.h-3{height:.75rem}.h-4{height:1rem}.h-6{height:1.5rem}.h-full{height:100%}.h-screen{height:100vh}.w-3{width:.75rem}.w-4{width:1rem}.w-40{width:10rem}.w-full{width:100%}.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}@keyframes bounce{0%,to{animation-timing-function:cubic-bezier(.8,0,1,1);transform:translateY(-25%)}50%{animation-timing-function:cubic-bezier(0,0,.2,1);transform:none}}.animate-bounce{animation:bounce 1s infinite}.cursor-pointer{cursor:pointer}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-center{align-items:center}.justify-start{justify-content:flex-start}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-2{gap:.5rem}.gap-5{gap:1.25rem}.space-y-3>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-bottom:0;margin-bottom:calc(.75rem*var(--tw-space-y-reverse));margin-top:.75rem;margin-top:calc(.75rem*(1 - var(--tw-space-y-reverse)))}.rounded{border-radius:.25rem}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:.5rem}.border{border-width:1px}.border-0{border-width:0}.bg-\\[\\#383838\\]{--tw-bg-opacity:1;background-color:#383838;background-color:rgb(56 56 56/var(--tw-bg-opacity))}.bg-\\[\\#3f3f40\\]{--tw-bg-opacity:1;background-color:#3f3f40;background-color:rgb(63 63 64/var(--tw-bg-opacity))}.bg-gray-400{--tw-bg-opacity:1;background-color:#9ca3af;background-color:rgb(156 163 175/var(--tw-bg-opacity))}.bg-ranko-500{--tw-bg-opacity:1;background-color:#f39c12;background-color:rgb(243 156 18/var(--tw-bg-opacity))}.fill-current{fill:currentColor}.p-2{padding:.5rem}.p-4{padding:1rem}.px-10{padding-left:2.5rem;padding-right:2.5rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.py-2{padding-bottom:.5rem;padding-top:.5rem}.py-20{padding-bottom:5rem;padding-top:5rem}.py-3{padding-bottom:.75rem;padding-top:.75rem}.pl-2{padding-left:.5rem}.text-center{text-align:center}.text-justify{text-align:justify}.text-\\[3rem\\]{font-size:3rem}.text-\\[5rem\\]{font-size:5rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:.75rem;line-height:1rem}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-semibold{font-weight:600}.italic{font-style:italic}.text-\\[\\#1e1e1f\\]{--tw-text-opacity:1;color:#1e1e1f;color:rgb(30 30 31/var(--tw-text-opacity))}.text-\\[\\#f39c12\\]{--tw-text-opacity:1;color:#f39c12;color:rgb(243 156 18/var(--tw-text-opacity))}.text-\\[\\#fafafa\\]{--tw-text-opacity:1;color:#fafafa;color:rgb(250 250 250/var(--tw-text-opacity))}.text-gray-400{--tw-text-opacity:1;color:#9ca3af;color:rgb(156 163 175/var(--tw-text-opacity))}.text-gray-500{--tw-text-opacity:1;color:#6b7280;color:rgb(107 114 128/var(--tw-text-opacity))}.text-gray-600{--tw-text-opacity:1;color:#4b5563;color:rgb(75 85 99/var(--tw-text-opacity))}.text-gray-800{--tw-text-opacity:1;color:#1f2937;color:rgb(31 41 55/var(--tw-text-opacity))}.text-purple-800{--tw-text-opacity:1;color:#6b21a8;color:rgb(107 33 168/var(--tw-text-opacity))}.text-ranko-500{--tw-text-opacity:1;color:#f39c12;color:rgb(243 156 18/var(--tw-text-opacity))}.opacity-25{opacity:.25}.shadow-md{--tw-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1);--tw-shadow-colored:0 4px 6px -1px var(--tw-shadow-color),0 2px 4px -2px var(--tw-shadow-color);box-shadow:0 0 #0000,0 0 #0000,0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-xl{--tw-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);--tw-shadow-colored:0 20px 25px -5px var(--tw-shadow-color),0 8px 10px -6px var(--tw-shadow-color);box-shadow:0 0 #0000,0 0 #0000,0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.blur{--tw-blur:blur(8px);filter:blur(8px) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.blur,.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-duration:.15s;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,-webkit-backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter,-webkit-backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1)}.transition-all{transition-duration:.15s;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1)}.after\\:content-\\[\\'\\2c \\'\\]:after{--tw-content:",";content:",";content:var(--tw-content)}.hover\\:bg-\\[\\#1e1e1f\\]:hover{--tw-bg-opacity:1;background-color:#1e1e1f;background-color:rgb(30 30 31/var(--tw-bg-opacity))}:is(.dark .dark\\:bg-gray-800){--tw-bg-opacity:1;background-color:#1f2937;background-color:rgb(31 41 55/var(--tw-bg-opacity))}:is(.dark .dark\\:text-gray-400){--tw-text-opacity:1;color:#9ca3af;color:rgb(156 163 175/var(--tw-text-opacity))}:is(.dark .dark\\:text-purple-200){--tw-text-opacity:1;color:#e9d5ff;color:rgb(233 213 255/var(--tw-text-opacity))}@media (min-width:768px){.md\\:mb-0{margin-bottom:0}.md\\:block{display:block}.md\\:w-\\[25\\%\\]{width:25%}}@media (min-width:1280px){.xl\\:block{display:block}.xl\\:after\\:content-\\[\\'\\'\\]:after{--tw-content:"";content:"";content:var(--tw-content)}}`;
const style = ':root{--bg-gradient-onyx:linear-gradient(to bottom right,#3f3f40 3%,#303030 97%);--bg-gradient-jet:linear-gradient(to bottom right,rgba(45,45,46,.251),rgba(27,27,29,0)),#202022;--bg-gradient-yellow-1:linear-gradient(to bottom right,#ffda6b,rgba(255,192,97,0) 50%);--bg-gradient-yellow-2:linear-gradient(135deg,rgba(255,218,107,.251),rgba(255,187,92,0) 59.86%),#202022;--border-gradient-onyx:linear-gradient(to bottom right,#404040,rgba(64,64,64,0) 50%);--text-gradient-yellow:linear-gradient(90deg,#ffdb70,#ffbb5c);--jet:#383838;--onyx:#22262a;--eerie-black-1:#202022;--eerie-black-2:#1e1e1f;--smoky-black:#121212;--white-1:#fff;--white-2:#fafafa;--orange-yellow-crayola:#ffdb70;--vegas-gold:#f39c12;--light-gray:#d6d6d6;--light-gray-70:hsla(0,0%,84%,.7);--bittersweet-shimmer:#b84c4c;--text-gradient-yellow:#f39c12;--ff-poppins:"Poppins",sans-serif;--fs-1:24px;--fs-2:18px;--fs-3:17px;--fs-4:16px;--fs-5:15px;--fs-6:14px;--fs-7:13px;--fs-8:11px;--fw-300:300;--fw-400:400;--fw-500:500;--fw-600:600;--shadow-1:-4px 8px 24px rgba(0,0,0,.25);--shadow-2:0 16px 30px rgba(0,0,0,.25);--shadow-3:0 16px 40px rgba(0,0,0,.25);--shadow-4:0 25px 50px rgba(0,0,0,.15);--shadow-5:0 24px 80px rgba(0,0,0,.25);--transition-1:0.25s ease;--transition-2:0.5s ease-in-out}*,:after,:before{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none}li{list-style:none}Icon,a,button,icon,img,ion-icon,span,time{display:block}button{border:none;cursor:pointer;text-align:left}button,input,textarea{background:none;font:inherit}input,textarea{display:block;width:100%}::-moz-selection{background:#f39c12;background:var(--vegas-gold);color:#121212;color:var(--smoky-black)}::selection{background:#f39c12;background:var(--vegas-gold);color:#121212;color:var(--smoky-black)}:focus{outline-color:#f39c12;outline-color:var(--vegas-gold)}html{font-family:Poppins,sans-serif;font-family:var(--ff-poppins)}body{background:#121212;background:var(--smoky-black)}.sidebar,article{background:#1e1e1f;background:var(--eerie-black-2);border:1px solid #383838;border:1px solid var(--jet);border-radius:20px;box-shadow:-4px 8px 24px rgba(0,0,0,.25);box-shadow:var(--shadow-1);padding:15px;z-index:1}.separator{background:#383838;background:var(--jet);height:1px;margin:16px 0;width:100%}.icon-box{align-items:center;background:linear-gradient(to bottom right,#404040,rgba(64,64,64,0) 50%);background:var(--border-gradient-onyx);border-radius:8px;box-shadow:-4px 8px 24px rgba(0,0,0,.25);box-shadow:var(--shadow-1);color:#f39c12;color:var(--vegas-gold);display:flex;font-size:16px;height:30px;justify-content:center;position:relative;width:30px;z-index:1}.icon-box:before{background:#202022;background:var(--eerie-black-1);border-radius:inherit;content:"";inset:1px;position:absolute;z-index:-1}.icon-box ion-icon{--ionicon-stroke-width:35px}article{display:none}article.active{animation:fade .5s ease backwards;display:block}@keyframes fade{0%{opacity:0}to{opacity:1}}.h2,.h3,.h4,.h5{color:#fafafa;color:var(--white-2);text-transform:capitalize}.h2{font-size:24px;font-size:var(--fs-1)}.h3{font-size:18px;font-size:var(--fs-2)}.h4{font-size:16px;font-size:var(--fs-4)}.h5{font-size:13px;font-size:var(--fs-7);font-weight:500;font-weight:var(--fw-500)}.article-title{padding-bottom:7px;position:relative}.article-title:after{background:#f39c12;background:var(--text-gradient-yellow);border-radius:3px;bottom:0;content:"";height:3px;left:0;position:absolute;width:30px}.has-scrollbar::-webkit-scrollbar{height:5px;width:5px}.has-scrollbar::-webkit-scrollbar-track{background:#22262a;background:var(--onyx);border-radius:5px}.has-scrollbar::-webkit-scrollbar-thumb{background:#f39c12;background:var(--vegas-gold);border-radius:5px}.has-scrollbar::-webkit-scrollbar-button{width:20px}.content-card{background:linear-gradient(to bottom right,#404040,rgba(64,64,64,0) 50%);background:var(--border-gradient-onyx);border-radius:14px;box-shadow:0 16px 30px rgba(0,0,0,.25);box-shadow:var(--shadow-2);cursor:pointer;padding:45px 15px 15px;position:relative;z-index:1}.content-card:before{background:linear-gradient(to bottom right,rgba(45,45,46,.251),rgba(27,27,29,0)),#202022;background:var(--bg-gradient-jet);border-radius:inherit;content:"";inset:1px;position:absolute;z-index:-1}main{margin:15px 12px 75px;min-width:259px}.sidebar{margin-bottom:15px;max-height:112px;overflow:hidden;transition:.5s ease-in-out;transition:var(--transition-2)}.sidebar.active{max-height:405px}.sidebar-info{align-items:center;display:flex;gap:15px;justify-content:flex-start;position:relative}.avatar-box{background:linear-gradient(to bottom right,#3f3f40 3%,#303030 97%);background:var(--bg-gradient-onyx);border-radius:20px}.info-content .name{color:#fafafa;color:var(--white-2);font-size:17px;font-size:var(--fs-3);font-weight:500;font-weight:var(--fw-500);letter-spacing:-.25px;margin-bottom:10px}.info-content .title{background:#22262a;background:var(--onyx);border-radius:8px;color:#fff;color:var(--white-1);font-size:11px;font-size:var(--fs-8);font-weight:300;font-weight:var(--fw-300);padding:3px 12px;width:-moz-max-content;width:max-content}.info_more-btn{background:linear-gradient(to bottom right,#404040,rgba(64,64,64,0) 50%);background:var(--border-gradient-onyx);border-radius:0 15px;box-shadow:0 16px 30px rgba(0,0,0,.25);box-shadow:var(--shadow-2);color:#f39c12;color:var(--vegas-gold);font-size:13px;padding:10px;right:-15px;top:-15px;z-index:1}.info_more-btn,.info_more-btn:before{position:absolute;transition:.25s ease;transition:var(--transition-1)}.info_more-btn:before{background:linear-gradient(to bottom right,rgba(45,45,46,.251),rgba(27,27,29,0)),#202022;background:var(--bg-gradient-jet);border-radius:inherit;content:"";inset:1px;z-index:-1}.info_more-btn:focus,.info_more-btn:hover{background:linear-gradient(to bottom right,#ffda6b,rgba(255,192,97,0) 50%);background:var(--bg-gradient-yellow-1)}.info_more-btn:focus:before,.info_more-btn:hover:before{background:linear-gradient(135deg,rgba(255,218,107,.251),rgba(255,187,92,0) 59.86%),#202022;background:var(--bg-gradient-yellow-2)}.info_more-btn span{display:none}.sidebar-info_more{opacity:0;transition:.5s ease-in-out;transition:var(--transition-2);visibility:hidden}.sidebar.active .sidebar-info_more{opacity:1;visibility:visible}.contacts-list{display:grid;gap:16px;grid-template-columns:1fr}.contact-item{align-items:center;display:flex;gap:16px;min-width:100%}.contact-info{max-width:calc(100% - 46px);width:calc(100% - 46px)}.contact-title{color:hsla(0,0%,84%,.7);color:var(--light-gray-70);font-size:11px;font-size:var(--fs-8);margin-bottom:2px;text-transform:uppercase}.contact-info :is(.contact-link,time,address){color:#fafafa;color:var(--white-2);font-size:13px;font-size:var(--fs-7)}.contact-info address{font-style:normal}.social-list{align-items:center;display:flex;gap:15px;justify-content:flex-start;padding-bottom:4px;padding-left:7px}.social-item .social-link{color:hsla(0,0%,84%,.7);color:var(--light-gray-70);font-size:18px}.social-item .social-link:hover{color:#d6d6d6;color:var(--light-gray)}.navbar{-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);background:rgba(43,43,44,.75);border:1px solid #383838;border:1px solid var(--jet);border-radius:12px 12px 0 0;bottom:0;box-shadow:0 16px 30px rgba(0,0,0,.25);box-shadow:var(--shadow-2);left:0;position:fixed;width:100%;z-index:5}.navbar-list{align-items:center;display:flex;flex-wrap:wrap;justify-content:center;padding:0 10px}.navbar-link{color:#d6d6d6;color:var(--light-gray);font-size:11px;font-size:var(--fs-8);padding:20px 7px;transition:color .25s ease;transition:color var(--transition-1)}.navbar-link:focus,.navbar-link:hover{color:hsla(0,0%,84%,.7);color:var(--light-gray-70)}.navbar-link.active{color:#f39c12;color:var(--vegas-gold)}.about .article-title{margin-bottom:15px}.about-text{color:#d6d6d6;color:var(--light-gray);font-size:14px;font-size:var(--fs-6);font-weight:300;font-weight:var(--fw-300);line-height:1.6}.about-text p{margin-bottom:15px}.service{margin-bottom:35px}.service-title{margin-bottom:20px}.service-list{display:grid;gap:20px;grid-template-columns:1fr}.service-item{background:linear-gradient(to bottom right,#404040,rgba(64,64,64,0) 50%);background:var(--border-gradient-onyx);border-radius:14px;box-shadow:0 16px 30px rgba(0,0,0,.25);box-shadow:var(--shadow-2);padding:20px;position:relative;z-index:1}.service-item:before{background:linear-gradient(to bottom right,rgba(45,45,46,.251),rgba(27,27,29,0)),#202022;background:var(--bg-gradient-jet);border-radius:inherit;content:"";inset:1px;position:absolute;z-index:-1}.service-icon-box{margin-bottom:10px}.service-icon-box img{margin:auto}.service-content-box{text-align:center}.service-item-title{margin-bottom:7px}.service-item-text{color:#d6d6d6;color:var(--light-gray);font-size:14px;font-size:var(--fs-6);font-weight:var(--fw-3);line-height:1.6}.testimonials{margin-bottom:30px}.testimonials-title{margin-bottom:20px}.testimonials-list{align-items:flex-start;display:flex;gap:15px;justify-content:flex-start;margin:0 -15px;overflow-x:auto;overscroll-behavior-inline:contain;padding:25px 15px 35px;scroll-behavior:smooth;scroll-snap-type:inline mandatory}.testimonials-item{min-width:100%;scroll-snap-align:center}.testimonials-avatar-box{background:linear-gradient(to bottom right,#3f3f40 3%,#303030 97%);background:var(--bg-gradient-onyx);border-radius:14px;box-shadow:-4px 8px 24px rgba(0,0,0,.25);box-shadow:var(--shadow-1);left:0;position:absolute;top:0;transform:translate(15px,-25px)}.testimonials-item-title{margin-bottom:7px}.testimonials-text{line-clamp:4;-webkit-line-clamp:4;-webkit-box-orient:vertical;color:#d6d6d6;color:var(--light-gray);display:-webkit-box;font-size:14px;font-size:var(--fs-6);font-weight:300;font-weight:var(--fw-300);line-height:1.6;overflow:hidden}.modal-container{align-items:center;display:flex;height:100%;justify-content:center;left:0;overflow-y:auto;overscroll-behavior:contain;pointer-events:none;position:fixed;top:0;visibility:hidden;width:100%;z-index:20}.modal-container::-webkit-scrollbar{display:none}.modal-container.active{pointer-events:all;visibility:visible}.overlay{background:#0d0d0d;height:100vh;left:0;opacity:0;pointer-events:none;position:fixed;top:0;transition:.25s ease;transition:var(--transition-1);visibility:hidden;width:100%;z-index:1}.overlay.active{opacity:.8;pointer-events:all;visibility:visible}.testimonials-modal{background:#1e1e1f;background:var(--eerie-black-2);border:1px solid #383838;border:1px solid var(--jet);border-radius:14px;box-shadow:0 24px 80px rgba(0,0,0,.25);box-shadow:var(--shadow-5);margin:15px 12px;opacity:0;padding:15px;position:relative;transform:scale(1.2);transition:.25s ease;transition:var(--transition-1);z-index:2}.modal-container.active .testimonials-modal{opacity:1;transform:scale(1)}.modal-close-btn{align-items:center;background:#22262a;background:var(--onyx);border-radius:8px;color:#fafafa;color:var(--white-2);display:flex;font-size:18px;height:32px;justify-content:center;opacity:.7;position:absolute;right:15px;top:15px;width:32px}.modal-close-btn:focus,.modal-close-btn:hover{opacity:1}.modal-close-btn ion-icon{--ionicon-stroke-width:50px}.modal-avatar-box{background:linear-gradient(to bottom right,#3f3f40 3%,#303030 97%);background:var(--bg-gradient-onyx);border-radius:14px;box-shadow:0 16px 30px rgba(0,0,0,.25);box-shadow:var(--shadow-2);margin-bottom:15px;width:-moz-max-content;width:max-content}.modal-img-wrapper>img{display:none}.modal-title{margin-bottom:4px}.modal-content time{color:hsla(0,0%,84%,.7);color:var(--light-gray-70);margin-bottom:10px}.modal-content p,.modal-content time{font-size:14px;font-size:var(--fs-6);font-weight:300;font-weight:var(--fw-300)}.modal-content p{color:#d6d6d6;color:var(--light-gray);line-height:1.6}.clients{margin-bottom:15px}.clients-list{align-items:flex-start;display:flex;gap:15px;justify-content:flex-start;margin:0 -15px;overflow-x:auto;overscroll-behavior-inline:contain;padding:25px;scroll-behavior:smooth;scroll-padding-inline:25px;scroll-snap-type:inline mandatory}.clients-item{min-width:50%;scroll-snap-align:start}.clients-item img{filter:grayscale(1);transition:.25s ease;transition:var(--transition-1);width:100%}.clients-item img:hover{filter:grayscale(0)}.article-title,.timeline{margin-bottom:30px}.timeline .title-wrapper{align-items:center;display:flex;gap:15px;margin-bottom:25px}.timeline-list{font-size:14px;font-size:var(--fs-6);margin-left:45px}.timeline-item{position:relative}.timeline-item:not(:last-child){margin-bottom:20px}.timeline-item-title{font-size:14px;font-size:var(--fs-6);line-height:1.3;margin-bottom:7px}.timeline-item-desc{color:#868686;font-size:var(--fs-10);line-height:1.3;margin-bottom:7px}.timeline-list span{color:#f39c12;color:var(--vegas-gold);font-weight:400;font-weight:var(--fw-400);line-height:1.6}.timeline-item:not(:last-child):before{background:#383838;background:var(--jet);content:"";height:calc(100% + 50px);left:-30px;position:absolute;top:-25px;width:1px}.timeline-item:after{background:#f39c12;background:var(--text-gradient-yellow);border-radius:50%;box-shadow:0 0 0 4px #383838;box-shadow:0 0 0 4px var(--jet);content:"";height:6px;left:-33px;position:absolute;top:5px;width:6px}.timeline-text{color:#d6d6d6;color:var(--light-gray);font-weight:300;font-weight:var(--fw-300);line-height:1.6}.skills-title{margin-bottom:20px}.skills-list{padding:20px}.skills-item:not(:last-child){margin-bottom:15px}.skill .title-wrapper{align-items:center;display:flex;gap:5px;margin-bottom:8px}.skill .title-wrapper data{color:#d6d6d6;color:var(--light-gray);font-size:13px;font-size:var(--fs-7);font-weight:300;font-weight:var(--fw-300)}.skill-progress-bg{background:#383838;background:var(--jet);border-radius:10px;height:8px;width:100%}.skill-progress-fill{background:#f39c12;background:var(--text-gradient-yellow);border-radius:inherit;height:100%}.filter-list{display:none}.filter-select-box{margin-bottom:25px;position:relative}.filter-select{align-items:center;background:#1e1e1f;background:var(--eerie-black-2);border:1px solid #383838;border:1px solid var(--jet);border-radius:14px;color:#d6d6d6;color:var(--light-gray);display:flex;font-size:14px;font-size:var(--fs-6);font-weight:300;font-weight:var(--fw-300);justify-content:space-between;padding:12px 16px;width:100%}.filter-select.active .select-icon{transform:rotate(.5turn)}.select-list{background:#1e1e1f;background:var(--eerie-black-2);border:1px solid #383838;border:1px solid var(--jet);border-radius:14px;opacity:0;padding:6px;pointer-events:none;position:absolute;top:calc(100% + 6px);transition:.15s ease-in-out;visibility:hidden;width:100%;z-index:2}.filter-select.active+.select-list{opacity:1;pointer-events:all;visibility:visible}.select-item button{background:#1e1e1f;background:var(--eerie-black-2);border-radius:8px;color:#d6d6d6;color:var(--light-gray);font-size:14px;font-size:var(--fs-6);font-weight:300;font-weight:var(--fw-300);padding:8px 10px;text-transform:capitalize;width:100%}.select-item button:hover{--eerie-black-2:#323234}.project-list{display:grid;gap:30px;grid-template-columns:1fr;margin-bottom:10px}.project-item{display:none}.project-item.active{animation:scaleUp .25s ease forwards;display:block}@keyframes scaleUp{0%{transform:scale(.5)}to{transform:scale(1)}}.project-item>a{width:100%}.project-img{border-radius:16px;height:200px;margin-bottom:15px;overflow:hidden;position:relative;width:100%}.project-img:before{background:transparent;content:"";height:100%;left:0;position:absolute;top:0;transition:.25s ease;transition:var(--transition-1);width:100%;z-index:1}.project-item>a:hover .project-img:before{background:rgba(0,0,0,.5)}.project-item-icon-box{--scale:0.8;background:#383838;background:var(--jet);border-radius:12px;color:#f39c12;color:var(--vegas-gold);font-size:20px;left:50%;opacity:0;padding:18px;position:absolute;top:50%;transform:translate(-50%,-50%) scale(.8);transform:translate(-50%,-50%) scale(var(--scale));transition:.25s ease;transition:var(--transition-1);z-index:1}.project-item>a:hover .project-item-icon-box{--scale:1;opacity:1}.project-item-icon-box ion-icon{--ionicon-stroke-width:50px}.project-img img{height:100%;-o-object-fit:cover;object-fit:cover;transition:.25s ease;transition:var(--transition-1);width:100%}.project-item>a:hover img{transform:scale(1.1)}.project-category,.project-title{margin-left:10px}.project-title{color:#fafafa;color:var(--white-2);font-size:15px;font-size:var(--fs-5);font-weight:400;font-weight:var(--fw-400);line-height:1.3;text-transform:capitalize}.project-category{color:hsla(0,0%,84%,.7);color:var(--light-gray-70);font-size:14px;font-size:var(--fs-6);font-weight:300;font-weight:var(--fw-300)}.blog-posts{margin-bottom:10px}.blog-posts-list{display:grid;gap:20px;grid-template-columns:1fr}.blog-post-item>a{background:linear-gradient(to bottom right,#404040,rgba(64,64,64,0) 50%);background:var(--border-gradient-onyx);border-radius:16px;box-shadow:0 25px 50px rgba(0,0,0,.15);box-shadow:var(--shadow-4);height:100%;position:relative;z-index:1}.blog-post-item>a:before{background:#202022;background:var(--eerie-black-1);border-radius:inherit;content:"";inset:1px;position:absolute;z-index:-1}.blog-banner-box{border-radius:12px;height:200px;overflow:hidden;width:100%}.blog-banner-box img{height:100%;-o-object-fit:cover;object-fit:cover;transition:.25s ease;transition:var(--transition-1);width:100%}.blog-post-item>a:hover .blog-banner-box img{transform:scale(1.1)}.blog-content{padding:15px}.blog-meta{align-items:center;display:flex;gap:7px;justify-content:flex-start;margin-bottom:10px}.blog-meta :is(.blog-category,time){color:hsla(0,0%,84%,.7);color:var(--light-gray-70);font-size:14px;font-size:var(--fs-6);font-weight:300;font-weight:var(--fw-300)}.blog-meta .dot{background:hsla(0,0%,84%,.7);background:var(--light-gray-70);border-radius:4px;height:4px;width:4px}.blog-item-title{line-height:1.3;margin-bottom:10px;transition:.25s ease;transition:var(--transition-1)}.blog-post-item>a:hover .blog-item-title{color:#f39c12;color:var(--vegas-gold)}.blog-text{color:#d6d6d6;color:var(--light-gray);font-size:14px;font-size:var(--fs-6);font-weight:300;font-weight:var(--fw-300);line-height:1.6}.mapbox{border:1px solid #383838;border:1px solid var(--jet);border-radius:16px;height:250px;margin-bottom:30px;overflow:hidden;position:relative;width:100%}.mapbox figure{height:100%}.mapbox iframe{border:none;filter:grayscale(1) invert(1);height:100%;width:100%}.github-form{margin-bottom:10px}.form-title{margin-bottom:20px}.input-wrapper{display:grid;gap:25px;grid-template-columns:1fr;margin-bottom:25px}.github{border:1px solid #383838;border:1px solid var(--jet);border-radius:14px;color:#fafafa;color:var(--white-2);font-size:14px;font-size:var(--fs-6);font-weight:400;font-weight:var(--fw-400);outline:none;padding:13px 20px}.contact::-moz-placeholder{font-weight:500;font-weight:var(--fw-500)}.contact::placeholder{font-weight:500;font-weight:var(--fw-500)}.contact:focus{border-color:#f39c12;border-color:var(--vegas-gold)}textarea.contact{height:120px;margin-bottom:25px;max-height:200px;min-height:100px;resize:vertical}textarea.contact::-webkit-resizer{display:none}.contact:focus:invalid{border-color:#b84c4c;border-color:var(--bittersweet-shimmer)}.form-btn{align-items:center;background:linear-gradient(to bottom right,#404040,rgba(64,64,64,0) 50%);background:var(--border-gradient-onyx);border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,.25);box-shadow:var(--shadow-3);color:#f39c12;color:var(--vegas-gold);display:flex;font-size:14px;font-size:var(--fs-6);gap:10px;justify-content:center;padding:13px 20px;position:relative;text-transform:capitalize;width:100%;z-index:1}.form-btn,.form-btn:before{transition:.25s ease;transition:var(--transition-1)}.form-btn:before{background:linear-gradient(to bottom right,rgba(45,45,46,.251),rgba(27,27,29,0)),#202022;background:var(--bg-gradient-jet);border-radius:inherit;content:"";inset:1px;position:absolute;z-index:-1}.form-btn ion-icon{font-size:16px}.form-btn:hover{background:linear-gradient(to bottom right,#ffda6b,rgba(255,192,97,0) 50%);background:var(--bg-gradient-yellow-1)}.form-btn:hover:before{background:linear-gradient(135deg,rgba(255,218,107,.251),rgba(255,187,92,0) 59.86%),#202022;background:var(--bg-gradient-yellow-2)}.form-btn:disabled{cursor:not-allowed;opacity:.7}.form-btn:disabled:hover{background:linear-gradient(to bottom right,#404040,rgba(64,64,64,0) 50%);background:var(--border-gradient-onyx)}.form-btn:disabled:hover:before{background:linear-gradient(to bottom right,rgba(45,45,46,.251),rgba(27,27,29,0)),#202022;background:var(--bg-gradient-jet)}@media (min-width:450px){.clients-item{min-width:calc(33.33% - 10px)}.blog-banner-box,.project-img{height:auto}}@media (min-width:580px){:root{--fs-1:32px;--fs-2:24px;--fs-3:26px;--fs-4:18px;--fs-6:15px;--fs-7:15px;--fs-8:12px}.sidebar,article{margin-inline:auto;padding:30px;width:520px}.article-title{font-weight:600;font-weight:var(--fw-600);padding-bottom:15px}.article-title:after{height:5px;width:40px}.icon-box{border-radius:12px;font-size:18px;height:48px;width:48px}main{margin-bottom:100px;margin-top:60px}.sidebar{margin-bottom:30px;max-height:180px}.sidebar.active{max-height:584px}.sidebar-info{gap:25px}.avatar-box{border-radius:30px}.avatar-box img{width:120px}.info-content .name{margin-bottom:15px}.info-content .title{padding:5px 18px}.info_more-btn{padding:10px 15px;right:-30px;top:-30px}.info_more-btn span{display:block;font-size:11px;font-size:var(--fs-8)}.info_more-btn ion-icon{display:none}.separator{margin:32px 0}.contacts-list{gap:20px}.contact-info{max-width:calc(100% - 64px);width:calc(100% - 64px)}.navbar{border-radius:20px 20px 0 0}.navbar-list{gap:20px}.navbar-link{--fs-8:14px}.about .article-title{margin-bottom:20px}.about-text{margin-bottom:40px}.about-item{align-items:flex-start;display:flex;gap:18px;justify-content:flex-start;padding:30px}.about-item-text{color:#d6d6d6;color:var(--light-gray);font-size:14px;font-size:var(--fs-6);font-weight:var(--fw-3);line-height:1.6}.service-item{align-items:flex-start;display:flex;gap:18px;justify-content:flex-start;padding:30px}.service-icon-box{margin-bottom:0;margin-top:5px}.service-content-box{text-align:left}.testimonials-title{margin-bottom:25px}.testimonials-list{gap:30px;margin:0 -30px;padding:30px 30px 35px}.content-card{padding:25px 30px 30px}.testimonials-avatar-box{border-radius:20px;transform:translate(30px,-30px)}.testimonials-avatar-box img{width:80px}.testimonials-item-title{margin-bottom:10px;margin-left:95px}.testimonials-text{line-clamp:2;-webkit-line-clamp:2}.modal-container{padding:20px}.testimonials-modal{align-items:stretch;border-radius:20px;gap:25px;justify-content:flex-start;padding:30px}.modal-img-wrapper{align-items:center;display:flex;flex-direction:column}.modal-avatar-box{border-radius:18px;margin-bottom:0}.modal-avatar-box img{width:65px}.modal-img-wrapper>img{display:block;flex-grow:1;width:35px}.clients-list{gap:50px;margin:0 -30px;padding:45px;scroll-padding-inline:45px}.clients-item{min-width:calc(33.33% - 35px)}.timeline-list{margin-left:65px}.timeline-item:not(:last-child):before{left:-40px}.timeline-item:after{height:8px;left:-43px;width:8px}.skills-item:not(:last-child){margin-bottom:25px}.blog-banner-box,.project-img{border-radius:16px}.blog-posts-list{gap:30px}.blog-content{padding:25px}.mapbox{border-radius:18px;height:380px}.input-wrapper{gap:30px;margin-bottom:30px}.contact{padding:15px 20px}textarea.contact{margin-bottom:30px}.form-btn{--fs-6:16px;padding:16px 20px}.form-btn ion-icon{font-size:18px}}@media (min-width:768px){.sidebar,article{width:700px}.has-scrollbar::-webkit-scrollbar-button{width:100px}.contacts-list{gap:30px 15px;grid-template-columns:1fr 1fr}.navbar-link{--fs-8:15px}.testimonials-modal{gap:35px;max-width:680px}.modal-avatar-box img{width:80px}.article-title{padding-bottom:20px}.filter-select-box{display:none}.filter-list{align-items:center;display:flex;gap:25px;justify-content:flex-start;margin-bottom:30px;padding-left:5px}.filter-item button{color:#d6d6d6;color:var(--light-gray);font-size:15px;font-size:var(--fs-5);transition:.25s ease;transition:var(--transition-1)}.filter-item button:hover{color:hsla(0,0%,84%,.7);color:var(--light-gray-70)}.filter-item button.active{color:#f39c12;color:var(--vegas-gold)}.blog-posts-list,.input-wrapper,.project-list{grid-template-columns:1fr 1fr}.form-btn{margin-left:auto;width:-moz-max-content;width:max-content}}@media (min-width:1024px){:root{--shadow-1:-4px 8px 24px rgba(0,0,0,.125);--shadow-2:0 16px 30px rgba(0,0,0,.125);--shadow-3:0 16px 40px rgba(0,0,0,.125)}.sidebar,article{box-shadow:0 24px 80px rgba(0,0,0,.25);box-shadow:var(--shadow-5);width:950px}main{margin-bottom:60px}.main-content{margin:auto;position:relative}.main-content,.navbar{width:-moz-max-content;width:max-content}.navbar{border-radius:0 20px;bottom:auto;box-shadow:none;left:auto;padding:0 20px;position:absolute;right:0;top:0}.navbar-list{gap:30px;padding:0 20px}.navbar-link{font-weight:500;font-weight:var(--fw-500)}.service-list{gap:20px 25px;grid-template-columns:1fr 1fr}.testimonials-item{min-width:calc(50% - 15px)}.clients-item{min-width:calc(25% - 38px)}.project-list{grid-template-columns:repeat(3,1fr)}.blog-banner-box{height:230px}}@media (min-width:1250px){body::-webkit-scrollbar{width:20px}body::-webkit-scrollbar-track{background:#121212;background:var(--smoky-black)}body::-webkit-scrollbar-thumb{background:hsla(0,0%,100%,.1);border:5px solid #121212;border:5px solid var(--smoky-black);border-radius:20px;box-shadow:inset 1px 1px 0 hsla(0,0%,100%,.11),inset -1px -1px 0 hsla(0,0%,100%,.11)}body::-webkit-scrollbar-thumb:hover{background:hsla(0,0%,100%,.15)}body::-webkit-scrollbar-button{height:60px}.sidebar,article{width:auto}article{min-height:100%}main{align-items:stretch;display:flex;gap:25px;justify-content:center;margin-inline:auto;max-width:1200px}.main-content{margin:0;min-width:75%;width:75%}.sidebar{height:100%;margin-bottom:0;max-height:50rem;padding-top:60px;position:sticky;top:60px;z-index:1}.sidebar-info{flex-direction:column}.avatar-box img{width:150px}.info-content .name{text-align:center;white-space:nowrap}.info-content .title{margin:auto}.info_more-btn{display:none}.sidebar-info_more{opacity:1;visibility:visible}.contacts-list{grid-template-columns:1fr}.contact-info :is(.contact-link){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.contact-info :is(.contact-link,time,address){--fs-7:14px;font-weight:300;font-weight:var(--fw-300)}.separator:last-of-type{margin:15px 0;opacity:0}.social-list{justify-content:center}.timeline-text{max-width:700px}}';
const LoadingPage_vue_vue_type_style_index_0_scoped_4911785a_lang = "@keyframes load-4911785a{0%{filter:blur(5px);letter-spacing:3px;opacity:.08}}.animate[data-v-4911785a]{align-items:center;animation:load-4911785a 1.2s ease-in-out 0s infinite;animation-direction:alternate;display:flex;font-family:Helvetica,sans-serif,Arial;height:100%;justify-content:center;margin:auto;text-shadow:0 0 1px #fff}";
const app_vue_vue_type_style_index_0_lang = ".v-enter-active,.v-leave-active{transition:opacity .5s ease}.v-enter-from,.v-leave-to{opacity:0}";
const flicking$1 = ".flicking-viewport{overflow:hidden;position:relative}.flicking-viewport.vertical,.flicking-viewport.vertical>.flicking-camera{display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex}.flicking-viewport.vertical>.flicking-camera{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column}.flicking-viewport.flicking-hidden>.flicking-camera>*{visibility:hidden}.flicking-camera{-webkit-box-orient:horizontal;-webkit-box-direction:normal;display:-webkit-box;display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row;height:100%;position:relative;width:100%;will-change:transform;z-index:1}.flicking-camera>*{-ms-flex-negative:0;flex-shrink:0}";
const error404_vue_vue_type_style_index_0_scoped_30d2164e_lang$1 = '.spotlight[data-v-30d2164e]{background:linear-gradient(45deg,#00dc82,#36e4da 50%,#0047e1);bottom:-30vh;filter:blur(20vh);height:40vh}.gradient-border[data-v-30d2164e]{-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-radius:.5rem;position:relative}@media (prefers-color-scheme:light){.gradient-border[data-v-30d2164e]{background-color:hsla(0,0%,100%,.3)}.gradient-border[data-v-30d2164e]:before{background:linear-gradient(90deg,#e2e2e2,#e2e2e2 25%,#00dc82 50%,#36e4da 75%,#0047e1)}}@media (prefers-color-scheme:dark){.gradient-border[data-v-30d2164e]{background-color:hsla(0,0%,8%,.3)}.gradient-border[data-v-30d2164e]:before{background:linear-gradient(90deg,#303030,#303030 25%,#00dc82 50%,#36e4da 75%,#0047e1)}}.gradient-border[data-v-30d2164e]:before{background-size:400% auto;border-radius:.5rem;bottom:0;content:"";left:0;-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.5;padding:2px;position:absolute;right:0;top:0;transition:background-position .3s ease-in-out,opacity .2s ease-in-out;width:100%}.gradient-border[data-v-30d2164e]:hover:before{background-position:-50% 0;opacity:1}.bg-white[data-v-30d2164e]{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}.cursor-pointer[data-v-30d2164e]{cursor:pointer}.flex[data-v-30d2164e]{display:flex}.grid[data-v-30d2164e]{display:grid}.place-content-center[data-v-30d2164e]{place-content:center}.items-center[data-v-30d2164e]{align-items:center}.justify-center[data-v-30d2164e]{justify-content:center}.font-sans[data-v-30d2164e]{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.font-medium[data-v-30d2164e]{font-weight:500}.font-light[data-v-30d2164e]{font-weight:300}.text-8xl[data-v-30d2164e]{font-size:6rem;line-height:1}.text-xl[data-v-30d2164e]{font-size:1.25rem;line-height:1.75rem}.leading-tight[data-v-30d2164e]{line-height:1.25}.mb-8[data-v-30d2164e]{margin-bottom:2rem}.mb-16[data-v-30d2164e]{margin-bottom:4rem}.max-w-520px[data-v-30d2164e]{max-width:520px}.min-h-screen[data-v-30d2164e]{min-height:100vh}.overflow-hidden[data-v-30d2164e]{overflow:hidden}.px-8[data-v-30d2164e]{padding-left:2rem;padding-right:2rem}.py-2[data-v-30d2164e]{padding-bottom:.5rem;padding-top:.5rem}.px-4[data-v-30d2164e]{padding-left:1rem;padding-right:1rem}.fixed[data-v-30d2164e]{position:fixed}.left-0[data-v-30d2164e]{left:0}.right-0[data-v-30d2164e]{right:0}.text-center[data-v-30d2164e]{text-align:center}.text-black[data-v-30d2164e]{--tw-text-opacity:1;color:#000;color:rgba(0,0,0,var(--tw-text-opacity))}.antialiased[data-v-30d2164e]{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.w-full[data-v-30d2164e]{width:100%}.z-10[data-v-30d2164e]{z-index:10}.z-20[data-v-30d2164e]{z-index:20}@media (min-width:640px){.sm\\:text-4xl[data-v-30d2164e]{font-size:2.25rem;line-height:2.5rem}.sm\\:text-xl[data-v-30d2164e]{font-size:1.25rem;line-height:1.75rem}.sm\\:text-10xl[data-v-30d2164e]{font-size:10rem;line-height:1}.sm\\:px-0[data-v-30d2164e]{padding-left:0;padding-right:0}.sm\\:py-3[data-v-30d2164e]{padding-bottom:.75rem;padding-top:.75rem}.sm\\:px-6[data-v-30d2164e]{padding-left:1.5rem;padding-right:1.5rem}}@media (prefers-color-scheme:dark){.dark\\:bg-black[data-v-30d2164e]{--tw-bg-opacity:1;background-color:#000;background-color:rgba(0,0,0,var(--tw-bg-opacity))}.dark\\:text-white[data-v-30d2164e]{--tw-text-opacity:1;color:#fff;color:rgba(255,255,255,var(--tw-text-opacity))}}';
const error500_vue_vue_type_style_index_0_scoped_32388612_lang$1 = ".spotlight[data-v-32388612]{background:linear-gradient(45deg,#00dc82,#36e4da 50%,#0047e1);filter:blur(20vh)}.bg-white[data-v-32388612]{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}.grid[data-v-32388612]{display:grid}.place-content-center[data-v-32388612]{place-content:center}.font-sans[data-v-32388612]{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.font-medium[data-v-32388612]{font-weight:500}.font-light[data-v-32388612]{font-weight:300}.h-1\\/2[data-v-32388612]{height:50%}.text-8xl[data-v-32388612]{font-size:6rem;line-height:1}.text-xl[data-v-32388612]{font-size:1.25rem;line-height:1.75rem}.leading-tight[data-v-32388612]{line-height:1.25}.mb-8[data-v-32388612]{margin-bottom:2rem}.mb-16[data-v-32388612]{margin-bottom:4rem}.max-w-520px[data-v-32388612]{max-width:520px}.min-h-screen[data-v-32388612]{min-height:100vh}.overflow-hidden[data-v-32388612]{overflow:hidden}.px-8[data-v-32388612]{padding-left:2rem;padding-right:2rem}.fixed[data-v-32388612]{position:fixed}.left-0[data-v-32388612]{left:0}.right-0[data-v-32388612]{right:0}.-bottom-1\\/2[data-v-32388612]{bottom:-50%}.text-center[data-v-32388612]{text-align:center}.text-black[data-v-32388612]{--tw-text-opacity:1;color:#000;color:rgba(0,0,0,var(--tw-text-opacity))}.antialiased[data-v-32388612]{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media (min-width:640px){.sm\\:text-4xl[data-v-32388612]{font-size:2.25rem;line-height:2.5rem}.sm\\:text-10xl[data-v-32388612]{font-size:10rem;line-height:1}.sm\\:px-0[data-v-32388612]{padding-left:0;padding-right:0}}@media (prefers-color-scheme:dark){.dark\\:bg-black[data-v-32388612]{--tw-bg-opacity:1;background-color:#000;background-color:rgba(0,0,0,var(--tw-bg-opacity))}.dark\\:text-white[data-v-32388612]{--tw-text-opacity:1;color:#fff;color:rgba(255,255,255,var(--tw-text-opacity))}}";
const LangSwitcher2_vue_vue_type_style_index_0_scoped_c3fa5f4c_lang$1 = ".p-dropdown[data-v-c3fa5f4c]{border:none!important}";
const Navbar_vue_vue_type_style_index_0_scoped_98e631f5_lang$1 = "a.router-link-active[data-v-98e631f5]{font-weight:700}a.router-link-exact-active[data-v-98e631f5]{color:var(--vegas-gold)}";
const CookieBar_vue_vue_type_style_index_0_scoped_f0d3c715_lang$1 = ".bounce-enter-active[data-v-f0d3c715]{animation:bounce-in-f0d3c715 .5s}.bounce-leave-active[data-v-f0d3c715]{animation:bounce-in-f0d3c715 .5s reverse}@keyframes bounce-in-f0d3c715{0%{transform:scale(0)}50%{transform:scale(1.25)}to{transform:scale(1)}}";
const _sfc_main$g = {
  __name: "404",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    useHead({
      title: "Ooups!"
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: "active",
        "data-page": "resume"
      }, _attrs))}><header><h2 class="h2 article-title"> Page Not Found </h2></header><div class="grid grid-cols-1 text-center mb-20 md:mb-0"><div class="text-[5rem] text-[#f39c12] font-bold"> 404 </div><div class="text-xl text-[#fafafa]"><span>The Page you are looking for doesn&#39;t exist or an other error occured. 😞</span><span class="mx-auto w-40 py-2 mt-5 cursor-pointer font-semibold bg-ranko-500 text-[#1e1e1f] rounded text-sm"> Go back </span></div></div></article>`);
    };
  }
};
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/404.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const _404 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _sfc_main$g
});
const _sfc_main$f = {
  name: "GithubReposItem",
  props: {
    repository: {
      type: Object,
      default: () => {
        return {};
      }
    },
    bgColor: {
      type: String,
      default: void 0
    }
  },
  data: () => ({
    icon: {
      book: "M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z",
      star: "M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z",
      fork: "M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"
    }
  })
};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "border h-full rounded p-4 flex flex-col" }, _attrs))}><div class="flex items-center"><svg viewBox="0 0 16 16" class="w-4 h-4 fill-current mr-2" aria-hidden="true"><path fill-rule="evenodd"${ssrRenderAttr("d", _ctx.icon.book)}></path></svg><a${ssrRenderAttr("href", $props.repository.html_url)} target="_blank" class="font-medium text-purple-800 dark:text-purple-200">${ssrInterpolate($props.repository.name)}</a></div><div class="text-xs mt-2 mb-4">${ssrInterpolate($props.repository.description)}</div><div class="mt-auto text-xs flex">`);
  if ($props.repository.language) {
    _push(`<div class="flex items-center mr-4"><span style="${ssrRenderStyle({ backgroundColor: $props.repository.language ? $props.bgColor : "" })}" class="w-3 h-3 rounded-full relative"></span><span class="pl-2">${ssrInterpolate($props.repository.language)}</span></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($props.repository.stargazers_count) {
    _push(`<div class="flex items-center mr-4"><svg class="w-4 h-4 fill-current mr-2" aria-label="stars" viewBox="0 0 16 16" role="img"><path fill-rule="evenodd"${ssrRenderAttr("d", _ctx.icon.star)}></path></svg><span>${ssrInterpolate($props.repository.stargazers_count)}</span></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($props.repository.size) {
    _push(`<div class="flex items-center"><svg class="w-4 h-4 fill-current mr-2" aria-label="fork" viewBox="0 0 16 16" role="img"><path fill-rule="evenodd"${ssrRenderAttr("d", _ctx.icon.fork)}></path></svg><span>${ssrInterpolate($props.repository.forks)}</span></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div>`);
}
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/GithubRepo.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const GithubReposItem = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["ssrRender", _sfc_ssrRender$2]]);
const GithubRepo = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: GithubReposItem
});
const _sfc_main$e = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Blog"
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: "blog active",
        "data-page": "blog"
      }, _attrs))}><header><h2 class="h2 article-title">${ssrInterpolate(_ctx.$t("pageTitles.blog"))}</h2></header><section class="blog-posts"><ul class="blog-posts-list"><li class="blog-post-item"><a href="https://bit.ly/ADLink-Docs"><figure class="blog-banner-box"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1685698726479/4120633e-1475-4696-af64-31a9296696dd.png?w=1600&amp;h=840&amp;fit=crop&amp;crop=entropy&amp;auto=compress,format&amp;format=webp" alt="ADLink Documentation" loading="lazy"></figure><div class="blog-content"><div class="blog-meta"><p class="blog-category">Docs</p><span class="dot"></span><time datetime="2023-06-2">June 2, 2023</time></div><h3 class="h3 blog-item-title">ADLink Documentation</h3><p class="blog-text"> A perfect custom alternative for linktree, bio and other shortner platform. </p></div></a></li><li class="blog-post-item"><a href="https://blog.agcrisbp.my.id/posts/cara-install-phpmyadmin-di-android-menggunakan-termux"><figure class="blog-banner-box"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1685699212595/40c994c9-0d1a-4eba-a82b-76c5da81683f.png?w=1600&amp;h=840&amp;fit=crop&amp;crop=entropy&amp;auto=compress,format&amp;format=webp" alt="Cara Install PHPMyAdmin Di Android Menggunakan Termux" loading="lazy"></figure><div class="blog-content"><div class="blog-meta"><p class="blog-category">Guide</p><span class="dot"></span><time datetime="2023-05-21">May 21, 2023</time></div><h3 class="h3 blog-item-title">Cara Install PHPMyAdmin Di Android Menggunakan Termux</h3><p class="blog-text"> PHPMyAdmin adalah alat yang digunakan untuk mengelola database yang dapat diakses melalui web. </p></div></a></li><li class="blog-post-item"><a href="https://blog.agcrisbp.my.id/posts/cara-mengirim-foto-ukuran-asli-di-whatsapp"><figure class="blog-banner-box"><img src="https://raw.githubusercontent.com/agcrisbp/blog/main/public/wa.png" alt="Cara Mengirim Foto Ukuran Asli Di WhatsApp" loading="lazy"></figure><div class="blog-content"><div class="blog-meta"><p class="blog-category">Guide</p><span class="dot"></span><time datetime="2023-05-10">May 10, 2023</time></div><h3 class="h3 blog-item-title">Cara Mengirim Foto Ukuran Asli Di WhatsApp</h3><p class="blog-text"> WhatsApp secara otomatis mengompres file gambar yang dikirim, sehingga ukurannya lebih kecil, memp... </p></div></a></li><li class="blog-post-item"><a href="https://blog.agcrisbp.my.id/posts/how-to-calculated-age-using-javascript"><figure class="blog-banner-box"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1685699222636/2e36749d-ac8c-42a1-9d01-151492cb1ab2.jpeg?w=1600&amp;h=840&amp;fit=crop&amp;crop=entropy&amp;auto=compress,format&amp;format=webp" alt="How To Calculated Age For Date of Birth Using JavaScript" loading="lazy"></figure><div class="blog-content"><div class="blog-meta"><p class="blog-category">Guide</p><span class="dot"></span><time datetime="2023-04-14">Apr 14, 2023</time></div><h3 class="h3 blog-item-title">How To Calculated Age For Date of Birth Using JavaScript</h3><p class="blog-text"> You can use this script to calculate your ages or hours of support. </p></div></a></li><li class="blog-post-item"><a href="https://blog.agcrisbp.my.id/posts/php-redirect-using-get-parameter"><figure class="blog-banner-box"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1685699244737/468273f9-5c58-4b48-b962-913773a9c5b3.jpeg?w=1600&amp;h=840&amp;fit=crop&amp;crop=entropy&amp;auto=compress,format&amp;format=webp" alt="PHP Redirect Using $GET Parameter In HTML" loading="lazy"></figure><div class="blog-content"><div class="blog-meta"><p class="blog-category">Guide</p><span class="dot"></span><time datetime="2023-04-3">Apr 3, 2023</time></div><h3 class="h3 blog-item-title">PHP Redirect Using $GET Parameter In HTML</h3><p class="blog-text"> A complicated tutorial. </p></div></a></li><li class="blog-post-item"><a href="https://blog.agcrisbp.my.id/posts/cara-mengeluarkan-akun-google"><figure class="blog-banner-box"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1685699236149/9bceb6ff-ee46-4f77-b2b6-7e54c36e41e1.jpeg?auto=compress,format&amp;format=webp" alt="Cara Mengeluarkan Akun Google Di Perangkat Lain" loading="lazy"></figure><div class="blog-content"><div class="blog-meta"><p class="blog-category">Guide</p><span class="dot"></span><time datetime="2013-06-13">June 13, 2013</time></div><h3 class="h3 blog-item-title">Cara Mengeluarkan Akun Google Di Perangkat Lain</h3><p class="blog-text"> Cara ini dapat digunakan untuk mengatasi masalah aktivitas Akun Google yang mencurigakan. </p></div></a></li></ul></section></article>`);
    };
  }
};
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/blog/index.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _sfc_main$e
});
const __default__ = {
  name: "GithubRepos",
  data() {
    return {
      repos: [],
      colors: {}
    };
  },
  methods: {
    getColors() {
      axios.get(
        "https://raw.githubusercontent.com/ozh/github-colors/master/colors.json"
      ).then((res) => this.colors = res.data);
    },
    getRepos() {
      axios.get("https://api.github.com/users/agcrisbp/repos").then((res) => {
        this.repos = res.data.filter((repo) => !repo.all).sort(
          (repo1, repo2) => repo2.stargazers_count - repo1.stargazers_count
        ).slice(0, 8);
      });
    }
  },
  async mounted() {
    await this.getColors();
    this.getRepos();
  },
  components: {
    GithubReposItem
  }
};
const _sfc_main$d = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Github"
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: "github active",
        "data-page": "github"
      }, _attrs))}><header><h2 class="h2 article-title">${ssrInterpolate(_ctx.$t("pageTitles.github"))}</h2></header><section class="github-form"><div class="input-wrapper"><!--[-->`);
      ssrRenderList(_ctx.repos, (repo) => {
        _push(`<div class="github">`);
        _push(ssrRenderComponent(GithubReposItem, {
          repository: repo,
          "bg-color": repo.language ? _ctx.colors[repo.language].color : "#ffffff"
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]--></div></section></article>`);
    };
  }
});
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/github.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const github = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _sfc_main$d
});
const _sfc_main$c = {
  __name: "AboutItem",
  __ssrInlineRender: true,
  props: {
    about: Object
  },
  setup(__props) {
    const { locale } = useI18n({ useScope: "global" });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<li${ssrRenderAttrs(mergeProps({ class: "about-item" }, _attrs))}><div class="about-content-box"><p class="about-item-text">${ssrInterpolate(unref(locale) === "en" ? (_a = __props.about.description) == null ? void 0 : _a.en : (_b = __props.about.description) == null ? void 0 : _b.id_ID)}</p></div></li>`);
    };
  }
};
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AboutItem.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const __nuxt_component_0$1 = _sfc_main$c;
const _sfc_main$b = {
  __name: "ServiceItem",
  __ssrInlineRender: true,
  props: {
    service: Object
  },
  setup(__props) {
    const { locale } = useI18n({ useScope: "global" });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<li${ssrRenderAttrs(mergeProps({ class: "service-item" }, _attrs))}><div class="service-icon-box">`);
      if (__props.service.image !== null && __props.service.icon !== "") {
        _push(`<img${ssrRenderAttr("src", __props.service.image)} alt="mobile app icon" class="w-40">`);
      } else {
        _push(ssrRenderComponent(unref(Icon), {
          icon: __props.service.icon,
          class: "text-ranko-500 text-[3rem] mx-auto",
          style: { "width": "40px" }
        }, null, _parent));
      }
      _push(`</div><div class="service-content-box"><h4 class="h4 service-item-title">${ssrInterpolate(__props.service.title)}</h4><p class="service-item-text">${ssrInterpolate(unref(locale) === "en" ? (_a = __props.service.description) == null ? void 0 : _a.en : (_b = __props.service.description) == null ? void 0 : _b.id_ID)}</p></div></li>`);
    };
  }
};
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ServiceItem.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const __nuxt_component_1$2 = _sfc_main$b;
const _imports_0$1 = "" + __publicAssetsURL("images/icon-quote.svg");
const _sfc_main$a = {
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useHead({});
    const { locale } = useI18n({ useScope: "global" });
    [__temp, __restore] = withAsyncContext(() => useFetch("/api/testimonials", "$PslAyef5YX")), __temp = await __temp, __restore();
    const testimonialItem = ref({});
    const activeModal = ref(false);
    const activeOverlay = ref(false);
    const { data: services } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/services", "$6PO73qLRkI")), __temp = await __temp, __restore(), __temp);
    const { data: about } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/about", "$nn2AXZkwPl")), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_AboutItem = __nuxt_component_0$1;
      const _component_ServiceItem = __nuxt_component_1$2;
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: "about active",
        "data-page": "about"
      }, _attrs))}><header><h2 class="h2 article-title">${ssrInterpolate(_ctx.$t("pageTitles.about"))}</h2></header><section class="about-text"><ul class="about-list"><!--[-->`);
      ssrRenderList(unref(about), (about2) => {
        _push(ssrRenderComponent(_component_AboutItem, {
          key: about2.id,
          about: about2
        }, null, _parent));
      });
      _push(`<!--]--></ul></section><section class="service"><br><ul class="service-list"><!--[-->`);
      ssrRenderList(unref(services), (service) => {
        _push(ssrRenderComponent(_component_ServiceItem, {
          key: service.id,
          service
        }, null, _parent));
      });
      _push(`<!--]--></ul></section><div class="${ssrRenderClass([{ active: unref(activeModal) }, "modal-container"])}"><div style="${ssrRenderStyle(unref(activeModal) ? null : { display: "none" })}" class="${ssrRenderClass([{ active: unref(activeOverlay) }, "overlay"])}"></div><section class="testimonials-modal"><button class="modal-close-btn"><ion-icon name="close-outline"></ion-icon></button><div class="flex gap-5 mb-5 justify-start items-center"><div class="modal-avatar-box"><img${ssrRenderAttr("src", unref(testimonialItem).image)} alt="Daniel lewis" width="80"></div><div class="modal-content"><h4 class="h3 modal-title">${ssrInterpolate(unref(testimonialItem).title)}</h4><time datetime="2021-06-14">14 June, 2021</time></div></div><div class="flex gap-5 items-start"><img class="my-auto hidden md:block"${ssrRenderAttr("src", _imports_0$1)} alt="quote icon"><p class="text-justify text-gray-400 text-sm md:text-md">${unref(locale) === "en" ? (_a = unref(testimonialItem).content) == null ? void 0 : _a.en : (_b = unref(testimonialItem).content) == null ? void 0 : _b.id_ID}</p></div><div class="mt-2 flex justify-end text-sm text-gray-600 italic"> Company Co. </div></section></div><section class="clients"><h3 class="h3 clients-title"> Clients </h3><ul class="clients-list has-scrollbar"><li class="clients-item"><a href="https://example.com" target="_blank"></a></li></ul></section></article>`);
    };
  }
};
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const index2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _sfc_main$a
});
const _sfc_main$9 = {
  __name: "portfolio",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useHead({
      title: "Portfolio"
    });
    const { locale } = useI18n({ useScope: "global" });
    const { data: projects } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/projects", "$czx70LxKTy")), __temp = await __temp, __restore(), __temp);
    const { data: categories } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/categories", "$UQupibDk7i")), __temp = await __temp, __restore(), __temp);
    const projectList = [...projects.value];
    const activeCategory = ref(0);
    const filterMenu = ref(false);
    const activeCategoryName = ref("");
    const activeItem = ref({});
    const activeModal = ref(false);
    const activeOverlay = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: "portfolio active",
        "data-page": "portfolio"
      }, _attrs))}><header><h2 class="h2 article-title">${ssrInterpolate(_ctx.$t("pageTitles.portfolio"))}</h2></header><section class="projects"><ul class="filter-list"><li class="filter-item"><button class="${ssrRenderClass({ active: unref(activeCategory) === 0 })}"> All </button></li><!--[-->`);
      ssrRenderList(unref(categories), (category) => {
        var _a2, _b2;
        _push(`<li class="filter-item"><button class="${ssrRenderClass({ active: unref(activeCategory) === category.id })}">${ssrInterpolate(unref(locale) === "en" ? (_a2 = category.title) == null ? void 0 : _a2.en : (_b2 = category.title) == null ? void 0 : _b2.id_ID)}</button></li>`);
      });
      _push(`<!--]--></ul><div class="filter-select-box"><button class="${ssrRenderClass([{ active: unref(filterMenu) }, "filter-select"])}"><div class="select-value">${ssrInterpolate(unref(activeCategory) !== 0 ? unref(locale) === "en" ? (_a = unref(activeCategoryName)) == null ? void 0 : _a.en : (_b = unref(activeCategoryName)) == null ? void 0 : _b.id_ID : "Select Category")}</div><div class="select-icon"><ion-icon name="chevron-down"></ion-icon></div></button><ul class="select-list"><li class="select-item"><button> All </button></li><!--[-->`);
      ssrRenderList(unref(categories), (category) => {
        var _a2, _b2;
        _push(`<li class="select-item"><button>${ssrInterpolate(unref(locale) === "en" ? (_a2 = category.title) == null ? void 0 : _a2.en : (_b2 = category.title) == null ? void 0 : _b2.id_ID)}</button></li>`);
      });
      _push(`<!--]--></ul></div><ul class="project-list"><!--[-->`);
      ssrRenderList(projectList, (project) => {
        var _a2, _b2;
        _push(`<li class="${ssrRenderClass([{ active: unref(activeCategory) === project.category.id || unref(activeCategory) === 0 }, "project-item"])}"><a class="cursor-pointer"><figure class="project-img"><div class="project-item-icon-box"><ion-icon name="eye-outline"></ion-icon></div><img${ssrRenderAttr("src", project.image)}${ssrRenderAttr("alt", project.title)} loading="lazy"></figure><h3 class="project-title">${ssrInterpolate(project.title)}</h3><p class="project-category">${ssrInterpolate(unref(locale) === "en" ? (_a2 = project.category.title) == null ? void 0 : _a2.en : (_b2 = project.category.title) == null ? void 0 : _b2.id_ID)}</p></a></li>`);
      });
      _push(`<!--]--></ul><div class="${ssrRenderClass([{ active: unref(activeModal) }, "modal-container"])}"><div style="${ssrRenderStyle(unref(activeModal) ? null : { display: "none" })}" class="${ssrRenderClass([{ active: unref(activeOverlay) }, "overlay"])}"></div><section class="testimonials-modal block"><button class="modal-close-btn"><ion-icon name="close-outline"></ion-icon></button><div><figure><img${ssrRenderAttr("src", unref(activeItem).image)} class="rounded-lg"${ssrRenderAttr("alt", unref(activeItem).title)}></figure></div><div class="modal-content space-y-3 mt-4"><h4 class="h3 modal-title">${ssrInterpolate(unref(activeItem).title)}</h4><small class="flex items-center justify-start gap-2 text-gray-500">`);
      _push(ssrRenderComponent(unref(Icon), { icon: "foundation:calendar" }, null, _parent));
      _push(`<span>${ssrInterpolate(unref(locale) === "en" ? (_d = (_c = unref(activeItem).category) == null ? void 0 : _c.date) == null ? void 0 : _d.en : (_f = (_e = unref(activeItem).category) == null ? void 0 : _e.date) == null ? void 0 : _f.id_ID)}</span> | `);
      _push(ssrRenderComponent(unref(Icon), { icon: "dashicons:category" }, null, _parent));
      _push(`<span>${ssrInterpolate(unref(locale) === "en" ? (_h = (_g = unref(activeItem).category) == null ? void 0 : _g.title) == null ? void 0 : _h.en : (_j = (_i = unref(activeItem).category) == null ? void 0 : _i.title) == null ? void 0 : _j.id_ID)}</span> | `);
      _push(ssrRenderComponent(unref(Icon), { icon: "ri:search-eye-line" }, null, _parent));
      _push(`<a${ssrRenderAttr("href", unref(activeItem).url)} target="_blank">${ssrInterpolate(unref(locale) === "en" ? (_k = unref(activeItem).desc) == null ? void 0 : _k.en : (_l = unref(activeItem).desc) == null ? void 0 : _l.id_ID)}</a></small><p class="text-justify">${unref(locale) === "en" ? (_m = unref(activeItem).content) == null ? void 0 : _m.en : (_n = unref(activeItem).content) == null ? void 0 : _n.id_ID}</p></div></section></div></section></article>`);
    };
  }
};
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/portfolio.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const portfolio = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _sfc_main$9
});
const _sfc_main$8 = {
  __name: "resume",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Resume"
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: "resume active",
        "data-page": "resume"
      }, _attrs))}><header><h2 class="h2 article-title">${ssrInterpolate(_ctx.$t("pageTitles.resume"))}</h2></header><section class="timeline"><ol class="timeline-list"><li class="timeline-item"><h4 class="h4 timeline-item-title"> Company </h4><span>From — Until</span><p class="timeline-item-desc"> Location </p><p class="timeline-text"> Position </p></li><li class="timeline-item"><h4 class="h4 timeline-item-title"> Company </h4><span>From — Until</span><p class="timeline-item-desc"> Location </p><p class="timeline-text"> Position </p></li></ol></section><section class="skill"><ul class="skills-list content-card"><li class="skills-item"><div class="title-wrapper"><h5 class="h5"> Your Skill </h5><data value="90">90%</data></div><div class="skill-progress-bg"><div class="skill-progress-fill" style="${ssrRenderStyle({ "width": "90%" })}"></div></div></li></ul></section></article>`);
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/resume.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const resume = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _sfc_main$8
});
const _sfc_main$7 = {
  __name: "LangSwitcher2",
  __ssrInlineRender: true,
  setup(__props) {
    const { locale } = useI18n({ useScope: "global" });
    useLocaleStore();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "cursor-pointer transition-all fade" }, _attrs))} data-v-c3fa5f4c><img${ssrRenderAttr("src", `/flags/${unref(locale)}.png`)} class="h-6" data-v-c3fa5f4c></div>`);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LangSwitcher2.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-c3fa5f4c"]]);
const _imports_0 = "" + __publicAssetsURL("images/avatar.png");
const _sfc_main$6 = {
  __name: "Sidebar",
  __ssrInlineRender: true,
  setup(__props) {
    let isOpen = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$3;
      const _component_LangSwitcher2 = __nuxt_component_1$1;
      _push(`<aside${ssrRenderAttrs(mergeProps({
        class: ["sidebar", { active: unref(isOpen) }]
      }, _attrs))}><div class="sidebar-info"><figure class="avatar-box"><img${ssrRenderAttr("src", _imports_0)} alt="Photo" width="80"></figure><div class="info-content"><h1 class="name" title="Agcrismanto Budhi Praswastyka"> Agcrismanto Budhi Praswastyka </h1><p class="title text-center xl:block flex items-center justify-center gap-1"><span class="xl:after:content-[&#39;&#39;] after:content-[&#39;,&#39;]">Cybersecurity</span><span>Web Developer</span></p></div><button class="info_more-btn"><span>Show Contacts</span><ion-icon name="chevron-down"></ion-icon></button></div><div class="sidebar-info_more"><div class="separator"></div><ul class="contacts-list"><li class="contact-item"><div class="icon-box"><ion-icon name="logo-twitter"></ion-icon></div><div class="contact-info"><p class="contact-title"> Twitter </p><a href="https://twitter.com/agcrisbp" class="contact-link" target="_blank">agcrisbp</a></div></li><li class="contact-item"><div class="icon-box"><ion-icon name="logo-github"></ion-icon></div><div class="contact-info"><p class="contact-title"> Github </p><a href="https://github.com/agcrisbp" class="contact-link" target="_blank">agcrisbp</a></div></li><li class="contact-item"><div class="icon-box"><ion-icon name="logo-linkedin"></ion-icon></div><div class="contact-info"><p class="contact-title"> Linkedin </p><a href="https://id.linkedin.com/in/agcrisbp" class="contact-link" target="_blank">Agcrismanto Budhi Praswastyla</a></div></li><li class="contact-item"><div class="icon-box"><ion-icon name="location-outline"></ion-icon></div><div class="contact-info"><p class="contact-title"> Location </p><address>Indonesia</address></div></li></ul><div class="separator"></div><ul class="social-list"><li class="social-item">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "mailto:agcrisbp@email.com",
        class: "social-link",
        target: "_blank"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<ion-icon name="mail-outline"${_scopeId}></ion-icon>`);
          } else {
            return [
              createVNode("ion-icon", { name: "mail-outline" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li>`);
      _push(ssrRenderComponent(_component_LangSwitcher2, null, null, _parent));
      _push(`</ul></div></aside>`);
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Sidebar.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_0 = _sfc_main$6;
const _sfc_main$5 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0$3;
  _push(`<nav${ssrRenderAttrs(mergeProps({ class: "navbar" }, _attrs))} data-v-98e631f5><ul class="navbar-list" data-v-98e631f5><li class="navbar-item" data-v-98e631f5>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/",
    class: "navbar-link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`${ssrInterpolate(_ctx.$t("pageTitles.about"))}`);
      } else {
        return [
          createTextVNode(toDisplayString$1(_ctx.$t("pageTitles.about")), 1)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li class="navbar-item" data-v-98e631f5>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/resume",
    class: "navbar-link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`${ssrInterpolate(_ctx.$t("pageTitles.resume"))}`);
      } else {
        return [
          createTextVNode(toDisplayString$1(_ctx.$t("pageTitles.resume")), 1)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li class="navbar-item" data-v-98e631f5>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/portfolio",
    class: "navbar-link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`${ssrInterpolate(_ctx.$t("pageTitles.portfolio"))}`);
      } else {
        return [
          createTextVNode(toDisplayString$1(_ctx.$t("pageTitles.portfolio")), 1)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li class="navbar-item" data-v-98e631f5>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/blog",
    class: "navbar-link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`${ssrInterpolate(_ctx.$t("pageTitles.blog"))}`);
      } else {
        return [
          createTextVNode(toDisplayString$1(_ctx.$t("pageTitles.blog")), 1)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li><li class="navbar-item" data-v-98e631f5>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/github",
    class: "navbar-link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`${ssrInterpolate(_ctx.$t("pageTitles.github"))}`);
      } else {
        return [
          createTextVNode(toDisplayString$1(_ctx.$t("pageTitles.github")), 1)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</li></ul></nav>`);
}
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Navbar.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-98e631f5"]]);
const useCookieStore = defineStore("cookieStore", () => {
  const cookie = ref(useCookie("accept-cookie"));
  const $cookies = inject("$cookies");
  function setCookie2() {
    $cookies.set("accept-cookie", true, "30d");
    return this.cookie = true;
  }
  const getCookie2 = computed(() => {
    return cookie.value;
  });
  return { cookie, setCookie: setCookie2, getCookie: getCookie2 };
});
const _sfc_main$4 = {
  __name: "CookieBar",
  __ssrInlineRender: true,
  setup(__props) {
    const cookie = useCookieStore();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        style: !unref(cookie).getCookie ? null : { display: "none" },
        class: "container left-0 right-0 mx-auto child md:w-[25%] bg-[#3f3f40] rounded-lg shadow-xl px-6 py-3 bottom-20 fixed z-[100] flex items-center justify-between animate-bounce"
      }, _attrs))} data-v-f0d3c715><span class="text-[#fafafa]" data-v-f0d3c715>This site use cookies! 🍪</span><span class="cursor-pointer p-2 shadow-md rounded bg-[#383838] text-[#fafafa] hover:bg-[#1e1e1f] transition" data-v-f0d3c715><ion-icon name="close-outline" data-v-f0d3c715></ion-icon></span></div>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CookieBar.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-f0d3c715"]]);
const _sfc_main$3 = {
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const { locale } = useI18n({ useScope: "global" });
    useHead({
      htmlAttrs: {
        lang: locale
      },
      titleTemplate: (pageTitle) => {
        return pageTitle ? `${pageTitle} - Agcrismanto Budhi Praswastyka ` : "Agcrismanto Budhi Praswastyka";
      },
      meta: [
        { charset: "utf-8" },
        { name: "description", content: "Personal site about Agcrismanto Budhi Praswastyka." },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "og:image", content: "https://v2.amp-cdn.net/images/480468a77ad0a1a6b1b2e773d9371249e13e3ca2aff757" }
      ],
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "../images/icon.png"
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com"
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com"
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap",
          crossorigin: ""
        }
      ],
      script: [
        {
          src: "https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js",
          body: false,
          type: "module"
        },
        {
          src: "https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js",
          body: false,
          nomodule: true
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Sidebar = __nuxt_component_0;
      const _component_Navbar = __nuxt_component_1;
      const _component_CookieBar = __nuxt_component_2;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "relative" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_Sidebar, null, null, _parent));
      _push(`<div class="main-content">`);
      _push(ssrRenderComponent(_component_Navbar, null, null, _parent));
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
      _push(ssrRenderComponent(_component_CookieBar, null, null, _parent));
      _push(`</main>`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _sfc_main$3
});
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<main${ssrRenderAttrs(mergeProps({ class: "py-20 px-10 text-center" }, _attrs))}>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`<div class="mt-5 mx-auto text-center opacity-25 text-sm"> [Home Layout] </div></main>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/home.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const home = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]);
const home$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: home
});
const _sfc_main$1 = {
  __name: "error-404",
  __ssrInlineRender: true,
  props: {
    appName: {
      type: String,
      default: "Nuxt"
    },
    version: {
      type: String,
      default: ""
    },
    statusCode: {
      type: Number,
      default: 404
    },
    statusMessage: {
      type: String,
      default: "Not Found"
    },
    description: {
      type: String,
      default: "Sorry, the page you are looking for could not be found."
    },
    backHome: {
      type: String,
      default: "Go back home"
    }
  },
  setup(__props) {
    const props = __props;
    useHead({
      title: `${props.statusCode} - ${props.statusMessage} | ${props.appName}`,
      script: [],
      style: [
        {
          children: `*,:before,:after{-webkit-box-sizing:border-box;box-sizing:border-box;border-width:0;border-style:solid;border-color:#e0e0e0}*{--tw-ring-inset:var(--tw-empty, );--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(14, 165, 233, .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000}:root{-moz-tab-size:4;-o-tab-size:4;tab-size:4}a{color:inherit;text-decoration:inherit}body{margin:0;font-family:inherit;line-height:inherit}html{-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";line-height:1.5}h1,p{margin:0}h1{font-size:inherit;font-weight:inherit}`
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "font-sans antialiased bg-white dark:bg-black text-black dark:text-white grid min-h-screen place-content-center overflow-hidden" }, _attrs))} data-v-30d2164e><div class="fixed left-0 right-0 spotlight z-10" data-v-30d2164e></div><div class="max-w-520px text-center z-20" data-v-30d2164e><h1 class="text-8xl sm:text-10xl font-medium mb-8" data-v-30d2164e>${ssrInterpolate(__props.statusCode)}</h1><p class="text-xl px-8 sm:px-0 sm:text-4xl font-light mb-16 leading-tight" data-v-30d2164e>${ssrInterpolate(__props.description)}</p><div class="w-full flex items-center justify-center" data-v-30d2164e>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "gradient-border text-md sm:text-xl py-2 px-4 sm:py-3 sm:px-6 cursor-pointer"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.backHome)}`);
          } else {
            return [
              createTextVNode(toDisplayString$1(__props.backHome), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui-templates/dist/templates/error-404.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const error404 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-30d2164e"]]);
const error404$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: error404
});
const _sfc_main = {
  __name: "error-500",
  __ssrInlineRender: true,
  props: {
    appName: {
      type: String,
      default: "Nuxt"
    },
    version: {
      type: String,
      default: ""
    },
    statusCode: {
      type: Number,
      default: 500
    },
    statusMessage: {
      type: String,
      default: "Server error"
    },
    description: {
      type: String,
      default: "This page is temporarily unavailable."
    }
  },
  setup(__props) {
    const props = __props;
    useHead({
      title: `${props.statusCode} - ${props.statusMessage} | ${props.appName}`,
      script: [],
      style: [
        {
          children: `*,:before,:after{-webkit-box-sizing:border-box;box-sizing:border-box;border-width:0;border-style:solid;border-color:#e0e0e0}*{--tw-ring-inset:var(--tw-empty, );--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(14, 165, 233, .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000}:root{-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{margin:0;font-family:inherit;line-height:inherit}html{-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";line-height:1.5}h1,p{margin:0}h1{font-size:inherit;font-weight:inherit}`
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "font-sans antialiased bg-white dark:bg-black text-black dark:text-white grid min-h-screen place-content-center overflow-hidden" }, _attrs))} data-v-32388612><div class="fixed -bottom-1/2 left-0 right-0 h-1/2 spotlight" data-v-32388612></div><div class="max-w-520px text-center" data-v-32388612><h1 class="text-8xl sm:text-10xl font-medium mb-8" data-v-32388612>${ssrInterpolate(__props.statusCode)}</h1><p class="text-xl px-8 sm:px-0 sm:text-4xl font-light mb-16 leading-tight" data-v-32388612>${ssrInterpolate(__props.description)}</p></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui-templates/dist/templates/error-500.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const error500 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-32388612"]]);
const error500$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: error500
});
const components_islands = {};
const islandComponents = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: components_islands
});
const islandRenderer = /* @__PURE__ */ defineComponent({
  props: {
    context: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const component = islandComponents[props.context.name];
    if (!component) {
      throw createError({
        statusCode: 404,
        statusMessage: `Island component not found: ${JSON.stringify(component)}`
      });
    }
    return () => createVNode(component || "span", { ...props.context.props, "nuxt-ssr-component-uid": "" });
  }
});
const islandRenderer$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: islandRenderer
});

export { CookieBar_vue_vue_type_style_index_0_scoped_f0d3c715_lang$1 as C, LoadingPage_vue_vue_type_style_index_0_scoped_4911785a_lang as L, Navbar_vue_vue_type_style_index_0_scoped_98e631f5_lang$1 as N, app_vue_vue_type_style_index_0_lang as a, error500_vue_vue_type_style_index_0_scoped_32388612_lang$1 as b, LangSwitcher2_vue_vue_type_style_index_0_scoped_c3fa5f4c_lang$1 as c, entry$1 as default, error404_vue_vue_type_style_index_0_scoped_30d2164e_lang$1 as e, flicking$1 as f, style as s, tailwind as t };
//# sourceMappingURL=server.mjs.map
