---
title:  CustomSingleChildLayout
date:   2021-11-10 19:00:10
tag: 
  - Flutter
categories:
  - Dart/Flutter
cover: https://flutter.cn/assets/images/docs/catalog-widget-placeholder.png
---

> `CustomSingleChildLayout` 可以使其唯一的子节点的布局遵循一个委托。
>
> 委托可以确定子组件的布局约束，并决定将子组件放置在何处。委托还可以确定父级的大小，但父类的大小不会取决于子类的大小。

在位置超出布局约束后，子节点依然会被渲染，但是它的手势交互还会停留再原地。考虑这样的场景：

{% Dartpad 9239524e218ede1100f436e8de59e957 500 %}

整体上，视图是列，白色区域固定高度，黄色区域自适应高度，红色圆能够被拖动到布局约束外。红色圆的代码如下：


```dart
class Circle extends StatefulWidget {
  const Circle({Key? key}) : super(key: key);

  @override
  State<Circle> createState() => _CircleState();
}

class _CircleState extends State<Circle> {
  ValueNotifier<double> moveDistance = ValueNotifier(0.0);

  @override
  Widget build(BuildContext context) {
    const circleSize = 70.0;

    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onPanDown: (_) => moveDistance.value = 0,
      onPanUpdate: (details) {
        moveDistance.value += details.delta.dy;
      },
      onPanEnd: (_) {
        moveDistance.value = 0;
      },
      child: ValueListenableBuilder<double>(
          valueListenable: moveDistance,
          builder: (_, dis, child) {
            return CustomSingleChildLayout(
              delegate: CircleLayoutDelegate(
                  maxMoveDistance: 200,
                  moveDistance: dis),
              child: child,
            );
          },
          child: Center(
            child: Container(
              width: circleSize,
              height: circleSize,
              decoration: const BoxDecoration(
                  shape: BoxShape.circle, color: Colors.redAccent),
            ),
          )),
    );
  }
}
```

这些代码只是简单的 Widget 组合，关键是 `CustomSingleChildLayout` 及其 delegate。`CustomSingleChildLayout` 现在有两个参数，`moveDistance` 表示手势移动的距离，`maxMoveDistance` 表示最大可移动距离。手指移动时，`moveDistance` 会增加，手指放开后，`moveDistance` 会清零，圆会归位。控制圆的移动的逻辑在 CircleLayoutDelegate 内：

```dart
class CircleLayoutDelegate extends SingleChildLayoutDelegate {
  final double maxMoveDistance;
  final double moveDistance;

  CircleLayoutDelegate({
    required this.maxMoveDistance,
    required this.moveDistance,
  });

  @override
  bool shouldRelayout(covariant SingleChildLayoutDelegate oldDelegate) {
    return oldDelegate.moveDistance != moveDistance;
  }

  @override
  Offset getPositionForChild(Size size, Size childSize) {
    return Offset(0, moveDistance.clamp(-maxMoveDistance, 0));
  }
}
```

委托必须实现的方法是 `shouldRelayout`，它的返回值决定了布局会不会被重新计算，一般会比较每个属性有没有被修改。这里最主要的是通过重写 `getPositionForChild` 修改子节点的位置偏移。

现在运行代码已经能够达到上面的演示效果。[点击查看](https://dartpad.dev/?id=ddf18cb4c46beaa07e3a8abc0998dd0a&null_safety=true) 当前阶段完整代码。 

## 优化

现在圆的大小是通过设置 Container 的宽高控制的，不过也可以使用委托自身决定大小，去掉 Container 的尺寸设置，在 `CircleLayoutDelegate` 中使用 `getConstraintsForChild` 决定子节点的约束：

```dart
BoxConstraints getConstraintsForChild(BoxConstraints constraints) {
    return BoxConstraints.loose(constraints.constrain(Size.square(circleSize)));
  }
```

现在圆的大小依然是对的。CustomSingleChildLayout 默认的约束是尽量撑开，所以圆的位置跑到左上角去了。这里演示两种方式修正这个问题，第一种方式是在计算子节点位置时算上偏移量：

```dart
@override
Offset getPositionForChild(Size size, Size childSize) {
  return size.center(-childSize.center(Offset.zero)) +
      Offset(0, moveDistance.clamp(-maxMoveDistance, 0));
}
```

[点击查看](https://dartpad.dev/?id=9239524e218ede1100f436e8de59e957&null_safety=true) 当前阶段完整代码。 

为了演示目的，提一下 `getSize`，通过重写 `getSize` 可以决定 `CustomSingleChildLayout` 自身的大小：

```dart
@override
Size getSize(BoxConstraints constraints) {
  return constraints.constrainDimensions(circleSize, circleSize);
}
```

实际上这个时候 `CustomSingleChildLayout` 的约束是 h = 200，看过去刚好也是居中。在 `CustomSingleChildLayout` 父级加一层 `UnconstrainedBox` 使它的高度变成 circleSize。

[点击查看](https://dartpad.dev/?id=587e0dd291a89492c6c9b2745778fb67&null_safety=true) 当前阶段完整代码。 
