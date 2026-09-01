# 内存泄漏

通常，造成内存泄漏的原因有如下几个。

- 缓存。
- 队列消费不及时。
- 作用域未释放。

## 慎将内存当做缓存

缓存在应用中的作用举足轻重，可以十分有效地节省资源。因为它的访问效率要比I/O的效率高，一旦命中缓存，就可以节省一次I/O的时间。

但是在Node中，缓存并非物美价廉。一旦一个对象被当做缓存来使用，那就意味着它将会常驻在老生代中。缓存中存储的键越多，长期存活的对象也就越多，这将导致垃圾回收在进行扫描和整理时，对这些对象做无用功。

另一个问题在于，JavaScript开发者通常喜欢用对象的键值对来缓存东西，但这与严格意义上的缓存又有着区别，严格意义的缓存有着完善的过期策略，而普通对象的键值对并没有。

## 缓存限制策略

为了解决缓存中的对象永远无法释放的问题，需要加入一种策略来限制缓存的无限增长。

```javascript
var LimitableMap = function (limit) {
    this.limit = limit || 10;
    this.map = {};
    this.keys = [];
};
var hasOwnProperty = Object.prototype.hasOwnProperty;
LimitableMap.prototype.set = function (key, value) {
    var map = this.map;
    var keys = this.keys;
    if (!hasOwnProperty.call(map, key)) {
        if (keys.length === this.limit) {
            var firstKey = keys.shift();
            delete map[firstKey];
        }
        keys.push(key);
    }
    map[key] = value;
};
LimitableMap.prototype.get = function (key) {
    return this.map[key];
};
module.exports = LimitableMap;
```

实现过程还是非常简单的。记录键在数组中，一旦超过数量，就以先进先出的方式进行淘汰。

## 缓存的解决方案

如何使用大量缓存，目前比较好的解决方案是采用进程外的缓存，进程自身不存储状态。外部的缓存软件有着良好的缓存过期淘汰策略以及自有的内存管理，不影响Node进程的性能。

在Node中主要可以解决以下两个问题

- 将缓存转移到外部，减少常驻内存的对象的数量，让垃圾回收更高效。
- 进程之间可以共享缓存。
- 使用Redis或Memcached

## 内存泄漏排查

可以借助第三方工具排除。
