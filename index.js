const { ipcRenderer, ipcMain, remote } = require("electron");

const IPC2PROMISE = "IPC2PROMISE";
const ipcRendererMap = new Map();
const ipcMainMap = new Map();
const isRennder = !!remote;

if (isRennder) {
  ipcRenderer.on(IPC2PROMISE, (event, { hasError, err, data, eventNameStamp }) => {
    const { resolve, reject } = ipcRendererMap.get(eventNameStamp);
    if (hasError) {
      reject(err);
    } else {
      resolve(data);
    }
    ipcRendererMap.delete(eventNameStamp);
  });
} else {
  ipcMain.on(IPC2PROMISE, (event, { eventName, args, eventNameStamp }) => {
    const ipcMainFn = ipcMainMap.get(eventName);
    const resolve = function resolve(data) {
      event.sender.send(IPC2PROMISE, { hasError: false, data, eventNameStamp });
    };
    const reject = function reject(err) {
      event.sender.send(IPC2PROMISE, { hasError: true, err, eventNameStamp });
    };

    ipcMainFn(event, args, resolve, reject);
  });
}

const ipc2promise = {
  send(eventName, args) {
    if (!isRennder) {
      throw new Error("仅能在渲染进程中使用 sender 方法");
    }

    return new Promise((resolve, reject) => {
      // 生成 eventNameStamp
      const eventNameStamp = `${eventName}-${window.performance.now()}`;
      ipcRendererMap.set(eventNameStamp, { resolve, reject });
      ipcRenderer.send(IPC2PROMISE, { eventName, args, eventNameStamp });
    });
  },
  on(eventName, fn) {
    if (isRennder) {
      throw new Error("仅能在主进程中使用 on 方法");
    }
    if (ipcMainMap.get(eventName)) {
      throw new Error(`请勿重复监听 ${eventName}`);
    }

    ipcMainMap.set(eventName, fn);
  }
};

module.exports = ipc2promise;
