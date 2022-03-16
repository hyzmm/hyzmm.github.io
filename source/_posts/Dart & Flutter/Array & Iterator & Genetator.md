---
title:  "数组、Iterator 和 Generator"
date:   2021-11-10 19:00:10 +0800
tag: [Dart, 编程]
---

假设有个函数需要返回多项数据，返回值可以选择为数组、[Iterator](https://dart.dev/codelabs/iterables) 或者 [Generator](https://dart.dev/guides/language/language-tour#generators) 中的任意一个，从结果上看，它们都是可行的。本文探讨它们之间的区别，以及如何选择。

考虑这样一个场景：你需要在一堆递增序号中，获取基数值，并将它们乘以二后返回，假设数据是 `[1, 2, 3, 4, 5]`，那么返回值就是 `[2, 6, 10]`。使用数组完成这个需求的代码是：

```dart
List<int> arrayAsReturnValue(List<int> input) {
  final List<int> retValue = [];
  for (final num in input) {
    if (num % 2 == 1) retValue.add(num * 2);
  }
  return retValue;
}
```

## Iterator

与上述代码执行步数一样，但是使用迭代器的方案，代码如下：

```dart
Iterable<int> iteratorAsReturnValue(List<int> input) {
  return input
    .where((e) => e % 2 == 1)
    .map((e) => e * 2);
}
```

看过去最明显的感受是简化了代码、可读性变高了。高阶函数与迭代器的配合使用，为多数编程语言提供了函数式的编程风格，这种方式对于数据处理非常优雅，使代码具有非常高的清晰度。

迭代器的处理链类似于流水线，并不是同时处理多个数据，而是一个数据走完流程后开始下一个数据处理。

当你进行链式调用处理数据时，用来处理数据的回调函数没有被调用。也就是说 `var result = iteratorAsReturnValue()` 这行代码并不会对数据进行处理，此时没有 CPU 消耗，当你真正使用它的时候，迭代器才会开始工作，例如当你调用 `result.toList()` 的时候。

## Generator

虽然相对于数组，Iterator 会在使用时执行处理代码，但是还是处理完数据还是会一次性得到结构，如果希望对每个数据项都是按需产生的，就需要使用 Generator。Dart 提供了两种 Generator：

1. 同步的 Generator 返回 Iterable 对象
2. 异步的 Generator 返回 Stream 对象

关于这两种 Generator 的使用方式，可以查看[官方文档](https://dart.dev/guides/language/language-tour#generators)，下文中只会以同步 Generator 举例。考虑以下场景：一个显示列表有 100 个可显示的视图，但是用的地方可能不需要这么多。如果用 List 或者 Iterator 的方案，必须生成这 100 个视图。而视图的布局则会浪费大量不必要的 CPU。

```dart
int buildView() {
  print("build view and layout");
  return 0;
}

Iterable generateViews(int n) sync* {
  int i = 0;
  while (i < n) {
    i++;
    yield buildView();
  }
}

void main() {
  Iterable iter = generateViews(100);
  iter.take(5).toList();
}
```

运行代码查看控制台的输入：
```shell
build view and layout
build view and layout
build view and layout
build view and layout
```

Generator 提供了 100 项数据，但是只有 5 次的视图布局，极大的降低了性能消耗。甚至，如果希望下次接着构建第 6 个视图，再次调用 Iterable 的 `iter.take(1)` 即可。对于异步的执行环境，使用 Generator 能够让 CPU 避开高峰期，使页面上的视觉体验更加流畅。