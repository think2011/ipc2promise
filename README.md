# ipc2promise
将 electron 的 ipcMain 与 ipcRenderer 间的通信转换为 promise 模式

![](https://raw.github.com/think2011/ipc2promise/master/demo.gif)

## 安装

### npm
```sh
$ npm i ipc2promise
```

## 使用

### 主线程（main process）

```js
const ipc2promise = require('ipc2promise')

ipc2promise.on('download', async (data, resolve ,reject) => {
    try {
        resolve(await download(data.url))
    } catch (err) {
        reject(new Error(err))
    }
})
```

### 渲染进程（renderer process）

```js
const ipc2promise = require('ipc2promise')

ipc2promise.sender('download', {url: 'https://xxxxxxxx.com/pkg.zip'})
    .then((filePath) => {
        console.log(filePath)
    })
    .catch((err) => {
        console.error('Oops..')
    })
```

## API

### on(event, fn)

- `event`
  - `String` - 事件名
- `fn`
  - `Function(data, resolve, reject)` args: 获得的数据， resolve: 通过， reject: 拒绝

### sender(event, data)

- `event`
  - `String` - 事件名
- `data`
  - `*` - 要发送的数据


## License

The MIT license.