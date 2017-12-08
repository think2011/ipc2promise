const { ipcRenderer, ipcMain, remote } = require('electron');

const stampMap = new Map();
const isRennder = !!remote;

if (isRennder) {
  ipcRenderer.on('ipc2promise', (event, result, stamp) => {
    // 触发对应 stamp 里保存的promise
    const { resolve, reject } = stampMap.get(stamp);
    if (result.err) {
      reject(result.err);
    } else {
      resolve(result.data);
    }
    stampMap.delete(stamp);
  });
}

const ipc2promise = {
  sender(eventName, args) {
    if (!isRennder) {
      throw new Error('仅能在渲染进程中使用 sender 方法');
    }

    return new Promise((resolve, reject) => {
      // 生成 stamp
      const STAMP = `${eventName}-${window.performance.now()}`;
      stampMap.set(STAMP, { resolve, reject });
      ipcRenderer.send(eventName, args, STAMP);
    });
  },
  on(eventName, fn) {
    if (isRennder) {
      throw new Error('仅能在主进程中使用 on 方法');
    }

    ipcMain.on(eventName, (event, args, STAMP) => {
      const resolve = function resolve(data) {
        event.sender.send('ipc2promise', { data }, STAMP);
      };
      const reject = function reject(err) {
        event.sender.send('ipc2promise', { err }, STAMP);
      };

      fn(args, resolve, reject);
    });
  },
};

module.exports = ipc2promise;
