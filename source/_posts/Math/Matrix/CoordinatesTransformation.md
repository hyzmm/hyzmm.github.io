---
title:  "坐标空间转换"
date:   2021-12-27 19:26:14 +0800
tag: [Matrix]
toc: true
mathjax: true
---

渲染引擎在进行最终的画面绘制时，都需要确定一个子节点应该在屏幕上的什么位置。或者开发者有时还需要知道父节点的一个节点在子空间的什么位置。这些场景需要用到坐标空间的转换，在渲染引擎中，这些空间转换是通过矩阵完成的。例如常见的 `toLocal` 和 `toGlobal` 接口所做事情。

## 子空间转换到父空间

考虑一个子节点，在父节点上做了这些操作：旋转 -> 缩放 -> 平移，对应下面的公式：

$$
M_{c \rightarrow p} = 
\begin{bmatrix}
1 & 0 & 0 & t_x \newline
0 & 1 & 0 & t_y \newline
0 & 0 & 1 & 0 \newline
0 & 0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
S_x & 0 & 0 & 0 \newline
0 & S_y & 0 & 0 \newline
0 & 0 & 1 & 0 \newline
0 & 0 & 0 & 1 \newline
\end{bmatrix}
\begin{bmatrix}
cos \theta & -sin \theta & 0 & 0 \newline
sin \theta & cos \theta & 0 & 0 \newline
0 & 0 & 1 & 0 \newline
0 & 0 & 0 & 1 \newline
\end{bmatrix}
$$

例如，子坐标系经过旋转 30 度，缩放 2 倍，平移 (100, 100) 像素。那么，子坐标系的相对坐标 (10, 10) 在父坐标中的位置是：

$$
M_{c \rightarrow p} P_c = 
\begin{bmatrix}
1 & 0 & 0 & 100 \newline
0 & 1 & 0 & 100 \newline
0 & 0 & 1 & 0 \newline
0 & 0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
2 & 0 & 0 & 0 \newline
0 & 2 & 0 & 0 \newline
0 & 0 & 1 & 0 \newline
0 & 0 & 0 & 1 \newline
\end{bmatrix}
\begin{bmatrix}
cos 30° & -sin 30° & 0 & 0 \newline
sin 30° & cos 30° & 0 & 0 \newline
0 & 0 & 1 & 0 \newline
0 & 0 & 0 & 1 \newline
\end{bmatrix}
\begin{bmatrix}
10 \newline 10 \newline 0 \newline 1
\end{bmatrix} = 
\begin{bmatrix}
107.32 \newline 127.32 \newline 0 \newline 1
\end{bmatrix}
$$

## 父空间转换到子空间

### 逆矩阵

逆矩阵可以用来撤销对一个向量的矩阵运算，所以我们可以用这种方式计算父空间到子控件的变换：

$$
P_c = PM_{c \rightarrow p}^{-1} P_p
$$

不过这种方式需要计算矩阵的逆矩阵，例如 NumPy 的代码：

```python
point_child = numpy.linalg.inv(matrix_c2p) @ point_parent
```

### 反向变换
另外一种方式是运用反向思维。例如，上面的例子，父空间到子空间的变换是经过：旋转 -> 缩放 -> 平移，那么，我们可以对每一个步骤进行反向逐步撤销，也就是 撤销平移 -> 旋转缩放 -> 撤销旋转。我们对上一节计算出来的 $P_p$ 进行还原：

$$
\begin{aligned}
P_c &= M_r^{-1}M_s^{-1}M_t^{-1}P_p \newline
&= 
\begin{bmatrix}
cos (-30°) & -sin (-30°) & 0 & 0 \newline
sin (-30°) & cos (-30°) & 0 & 0 \newline
0 & 0 & 1 & 0 \newline
0 & 0 & 0 & 1 \newline
\end{bmatrix}
\begin{bmatrix}
\frac{1}{2} & 0 & 0 & 0 \newline
0 & \frac{1}{2} & 0 & 0 \newline
0 & 0 & \frac{1}{2} & 0 \newline
0 & 0 & 0 & 1 \newline
\end{bmatrix}
\begin{bmatrix}
1 & 0 & 0 & -100 \newline
0 & 1 & 0 & -100 \newline
0 & 0 & 1 & 0 \newline
0 & 0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
107.32 \newline 127.32 \newline 0 \newline 1
\end{bmatrix} 
\newline &= 
\begin{bmatrix}
10 \newline 10 \\ 0 \\ 1
\end{bmatrix}
\end{aligned}
$$

## 完整 Python 代码 

```python
import math
import numpy as np


def child_2_parent(p):
    t = np.array([
        [1, 0, 0, 100],
        [0, 1, 0, 100],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ])
    s = np.array([
        [2, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ])

    radian = 30 * math.pi / 180
    cos = math.cos(radian)
    sin = math.sin(radian)
    r = np.array([
        [cos, -sin, 0, 0],
        [sin, cos, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ])
    return t @ s @ r @ p


def parent_2_child(p):
    t = np.array([
        [1, 0, 0, -100],
        [0, 1, 0, -100],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ])
    s = np.array([
        [1 / 2, 0, 0, 0],
        [0, 1 / 2, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ])

    radian = -30 * math.pi / 180
    cos = math.cos(radian)
    sin = math.sin(radian)
    r = np.array([
        [cos, -sin, 0, 0],
        [sin, cos, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ])
    return s @ r @ t @ p


point_child = np.array((10, 10, 0, 1))
point_parent = child_2_parent(point_child)
print(f"C2P({point_child}) = {point_parent}")
point_child = parent_2_child(point_parent)
print(f"P2C({point_parent}) = {point_child}")
```
