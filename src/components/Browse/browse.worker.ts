import * as lzString from 'lz-string';

self.addEventListener('message', (event: MessageEvent<string>) => {
  self.postMessage(lzString.compress(event.data));
});
