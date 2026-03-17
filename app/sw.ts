import { defaultCache } from "@serwist/next/worker";
import { PrecacheEntry } from "@serwist/precaching";
import { ExpirationPlugin, NetworkFirst, Serwist, SerwistGlobalConfig } from "serwist";


declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/[a-z0-9-]+\.googleapis\.com\/.*/i,
      handler: new NetworkFirst({
        cacheName: "firebase-apis",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
        networkTimeoutSeconds: 5,
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
