---
title:  "理解对象分层"
date:  2022-07-11 00:01:32
mathjax: true
tag: 
    - 游戏
toc: true
categories:
  - 编程
  - 游戏
cover: /images/cover/ice_wall_nebula-wallpaper-960x600.jpg
---

在游戏中，游戏对象要不要与另一个对象产生交互，例如发生碰撞，取决于对象所在 Layer，开发者会决定 Layer 与 Layer 之间是否需要进行碰撞。一个更具体的案例是：敌人会与玩家发生碰撞检测，而敌人之前的相互碰撞会忽略掉。

这通常是基于位运算实现的，每个比特代表一个 Layer，如果使用 `u32` 类型（32 比特）表示，则有 32 层可用。值为：

```
0000 & 0000 & 0000 & 0000 & 0000 & 0000 & 0000 & 0001
0000 & 0000 & 0000 & 0000 & 0000 & 0000 & 0000 & 0010
0000 & 0000 & 0000 & 0000 & 0000 & 0000 & 0000 & 0100
00.. & .... & .... & .... & .... & .... & .... & .000
0100 & 0000 & 0000 & 0000 & 0000 & 0000 & 0000 & 0000 
1000 & 0000 & 0000 & 0000 & 0000 & 0000 & 0000 & 0000
```

例如 Unity 的分层碰撞矩阵，下面展示了 3 张不同的设置，图中 5 个层是默认创建的。在下列例子中，我们只关注 Default 层与其他层的关系。

![Unity 中的分层碰撞矩阵](./UnderstandingObjectLayering/Unity-LayerCollisionMatrix.jpg?w=900)

图 1 的 Default 行所有复选框都是选中状态，意味着 Default 层与其他 4 层，包括它自身都会发生碰撞，那么它的定义就是：

```
Default = 11111
```

图 2 的 Default 行所有复选框都是未选中状态，意味着 Default 层与其他 4 层，包括它自身都不会发生碰撞，那么它的定义就是：

```
Default = 00000
```

图 3 的 Default 行除了与 UI 列的复选框是选中的，其余都是未选中状态，意味着 Default 层只与 UI 发生碰撞那么它的定义就是：

```
Default = 10000
```

## 计算方式

为了了解计算过程，我们用两层举例说明： A 层和 B 层，它们分别被定义为第一层和第二层，默认和自身发生碰撞：

$$
\begin{align}
Index_A = 0 \newline
Index_B = 1 \newline
Layer_A \doteq 1 << Index_A = 0001 \newline
Layer_B \doteq 1 << Index_B = 0010 \newline
\end{align}
$$

前两个等式定义了 A 和 B 所在的层（即 0~31），后两个等式定义了 A 和 B 层，并给出了它们的值。为了验证它们只与自己发生碰撞，可以通过与运算求证：

$$
\begin{align}
Layer_A \ \\& \ Layer_A &= 0001 \ \\& \ 0001 = 0001 \newline
Layer_B \ \\& \ Layer_B &= 0010 \ \\& \ 0010 = 0010 
\end{align}
$$

从结果可见它们与自己进行与运算后求出的值都是不为 0 的，说明会发生碰撞。再来验证  A 与 B 是否会发生碰撞：
$$
\begin{aligned}
Layer_A \ \\& \ Layer_B = 0001 \ \\& \ 0010 = 0000
\end{aligned}
$$
它们的与运算求值得到的结果是 0，说明 A 和 B 不会发生碰撞。

那么如果希望 A 会与 B 发生碰撞呢？很简单，只需要把 A 中 B 对应的比特位设置上就行：

$$
\begin{equation}
\begin{split}
Layer_A &= Layer_A \ | \ Index_B \newline 
&= 0001 \ | \ 0010 \newline
&= 0011
\end{split}
\end{equation}
$$

现在再次验证下 A 是否能和 B 发生碰撞：
$$
\begin{aligned}
A \ \\& \ B = 0011 \ \\& \ 0010 = 0010
\end{aligned}
$$
这次得到的结果不再是 0 了，所以 A 会和 B 发生碰撞。

如果此后不希望 A 和 B 发生碰撞了呢？显而易见，只需要把 A 中 B 对应的比特清除掉就行：

$$
\begin{equation}
\begin{split}
Layer_A &= Layer_A \ \\& \ ~(1 << Index_B) \newline
&= 0011 \ \\& \ 1101 \newline
&= 0001
\end{split}
\end{equation}
$$

现在再次验证下 A 是否能和 B 发生碰撞：
$$
\begin{aligned}
A \ \\& \ B = 0001 \ \\& \ 0010 = 0000
\end{aligned}
$$
现在的计算结果又变成 0 了，即 A 会和 B 发生碰撞。

## 代码实现

了解了原理后，我们将使用具有语义化的代码实现上面的场景。

```rust
struct Layer(u32);

impl Layer {
    fn new(layer: u32) -> Layer {
        Layer(1 << layer)
    }
}
```

上述代码用于创建 Layer，表示对象分层中的层概念，现在我们可以创建 Layer A 和 Layer B 了：

```rust
const LAYER_INDEX_A: u32 = 0;
const LAYER_INDEX_B: u32 = 1;

let layer_a = Layer::new(LAYER_INDEX_A);
let layer_b = Layer::new(LAYER_INDEX_B);

assert_eq!(layer_a.0, 0b0001u32);
assert_eq!(layer_b.0, 0b0010u32);
```

我们创建了 Layer，并传入了默认值只与其自身发生碰撞，可以通过 `intersects` 检测并验证这一点：

```rust
impl Layer {
    fn intersects(&self, layer: &Layer) -> bool {
        return self.0 & layer.0 > 0;
    }
}

...
assert!(layer_a.intersects(&layer_a));
assert!(layer_b.intersects(&layer_b));
assert!(layer_a.intersects(&layer_b).not());
```

为了让 A 和 B 发生碰撞，我们提供 `with` 方法为 Layer 增加碰撞层：

```rust
impl Layer {
    fn with(&mut self, layer_index: u32) {
        self.0 |= 1 << layer_index;
    }
}

...
// 为 layer_a 的变量声明添加 mut
layer_a.with(LAYER_INDEX_B);
assert!(layer_a.intersects(&layer_b));
```

如果希望让 A 和 B 不再发生碰撞，通过 `without` 方法断开关联：

```rust
impl Layer {
    fn without(&mut self, layer_index: u32) {
        self.0 &= !(1 << layer_index);
    }
}

...
layer_a.without(LAYER_INDEX_B);
assert!(layer_a.intersects(&layer_b).not());
```

## 小结

虽然Unity 为我们隐藏了细节，让我们可以不需要了解原理情况下实现分层，但以代码形式访问物理引擎的碰撞分类接口时可能会碰到类似的 API，上面的代码在支持链接调用的情况下可以这样：

```rust
const A = 0u32;
const B = 1u32;
const C = 2u32;

let layer_a = Layer::new(A)
	.with(B)
	.without(C);
```

我们依然可以很容易看出 A 会与 AB 发生碰撞，而不会与 C 发生碰撞。

另外基于比特实现的对象分层，可以在计算速度、内存大小和传输数据量等都有很大的优势。
