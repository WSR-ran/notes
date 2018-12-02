# 便利贴
## 功能
- 新增、删除、移动、保存
- gulp实现自动刷新
- node + mongoodb 配置服务器(dev分支)
## 使用
- npm install
- 打开页面http://localhost:5000/public/index.html
## 简单介绍
### 模块化思想
把工具和存储分别独立为一个模块，对便签的操作写在自执行函数中。

```js
let app = {
    util: {},
    store: {}
};
```

### 工具模块

- 获取元素
- 格式化时间（根据ms值转化）

### 存储模块

设置服务器之前需要把便签信息保存到浏览器，防止刷新之后之前创建的便签丢失。
注意：每次操作都需要重新保存，获取便签时可能获取不到需要加上空对象

```js
getNotes: function () {
   return JSON.parse( localStorage[this.store_key] || '{}');
}
```
### 操作便签

写在自执行函数中，不会有全局变量，变量全部私有
#### 1. 创建Note对象
便签上的事件、信息保存等都是在这个对象上完成
#### 2. 新建便签
新建便签写在DOMContentLoaded事件中（dom内容加载完毕），点击新建new Note（obj）就会创建便签，obj是便签的初始值，包括left、top、zIndex、bgColor。没创建一个便签层级都要增加
#### 3. 事件
便签删除的时候需要把相关的事件也移除（版本高的浏览器会自动移除的）
- mousedown事件事件
在按下的时候要记录鼠标的位置，并且将这个便签的层级改为最高层的
- input事件
	便签输入的时候需要把输入的内容保存一下，并把输入的时间设为更新的时间。注意保存的时候需要延时保存，延缓函数调用的频率，否则对页面的性能会有影响。
### 连接服务器
把页面作为静态资源，通过ajax请求数据。
数据操作：
- .find 获取全部
- .save 新增
- .findOneAndUpdate 修改
- .findOneAndRemove 删除
- .remove 删除全部


