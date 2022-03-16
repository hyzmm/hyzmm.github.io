---
title:  "点积"
date:   2021-12-27 19:26:14 +0800
tag: 
    - 矩阵
    - 向量
toc: true
mathjax: true
cover: https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Inner-product-angle.svg/2560px-Inner-product-angle.svg.png
categories:
  - 数学
---

## 点积公式一

$$
a \cdotp b = (a_x, a_y, a_z) \cdotp (b_x, b_y, b_z) = a_xb_x + a_yb_y + a_zb_z
$$

矢量的点积满足交换律，即 $a \cdotp b = b \cdotp a$。

### 投影

假设，有一个单位向量 $\hat{a}$ 和另一个长度不限的矢量 b。现在，我们希望得到 b 在平行于 $\hat{a}$ 一条直线上的投影。那么，我们就可以使用点积 $\hat{a} \cdotp b$ 来得到 b 在 方向 $\hat{a}$ 上的有符号的投影。

投影的值可能是负数。投影结果的正负与 $\hat{a}$ 和 b 的方向有关；当它们的方向相反（夹角大于 90°）,结果小于 0；当它们的方向互相垂直（夹角为 90°）时，结果等于 0；当它们的方向相反（夹角小于 90°）时，结果大于 0。

那么，如果 $\hat{a}$ 不是一个单位向量会如何呢？任意两个向量的点积 $a\cdot b $ 等同于 b 在 a 方向上的投影值，再乘以 a 的长度。

点积具有一些很重要的性质，在 Shader 的计算中，经常会用来帮助计算。

#### 性质一：点积可结合标量乘法

$$
(ka)\cdot b = a \cdot (kb) = k(a \cdot b)
$$

对点积中其中一个向量进行缩放的结果，相当于对最后的点积解决过进行缩放。

#### 性质二：点积可结合向量加法和减法

$$
a \cdot (b+c) = a \cdot b + a \cdot c
$$

把上面的 c 换成 -c 就可以得到减法的版本。

#### 性质三：一个矢量和本身进行点积的结果，是该矢量的平方

这一点可以从公式中验证得到：

$$
v \cdot v = v_x v_x + v_y v_y + v_z v_z = |v|^2
$$

这意味着，我们可以直接利用点积来求向量的模，而不需要用到模的计算公式。当然，我们需要对点积结果进行开平方才能得到真正的模。但是很多情况下，我们只是想要比较两个向量的长度大小，因此可以直接使用点积的结果，免去开平方的性能消耗。

## 点积公式二

$$
a \cdot b= |a||b| cos \theta
$$



下面来一步步求证这个公式。这是两个单位向量进行点积的图示：

![dot-product](/images/math-dot-product-figure_01.png?20x)

由于 a 和 b 都是单位向量，根据上面点积公式一种描述的投影计算方式，可以得到：

$$
临边 = \hat{a} \cdot \hat{b} = cos \theta
$$

结合此公式可得：

$$
\begin{aligned}
a \cdot b &= (|a|\hat{a}) \cdot (|b|\hat{b}) \newline
&= |a||b|(\hat{a} \cdot \hat{b}) \newline
&= |a||b| cos \theta
\end{aligned}
$$

文字描述为，两个向量的点积可以表示两个向量的模相乘，再乘以它们之间夹角的余弦值。从这个公式也可以看出，为什么投影值有符号：当夹角小于 90° 时，$cos\theta > 0$；当夹角等于 90° 时，$cos\theta  = 0$；当夹角大于 90° 时，$cos\theta < 0$；

利用这个公式，我们还能求得两个向量至今的夹角（在 0~180 度之间），注意 a 和 b 是单位向量：

$$
\theta = acos(\hat{a} \cdot \hat{b})
$$