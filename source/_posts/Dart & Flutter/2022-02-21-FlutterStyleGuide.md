---
title:  "Flutter 风格指南"
date:   2022-02-21 19:58:08 +0800
tag: 
  - Flutter
cover: https://files.flutter-io.cn/cms/static/70760bf1e88b184bb1bc.png
---

> 本文是译文，原文参见[原文链接](https://github.com/flutter/flutter/wiki/Style-guide-for-Flutter-repo#a-word-on-designing-apis)。

## 长话短说

对可读性优化。编写详细的文档。使错误信息更有用。不要使用 timeouts 或 timers。避免使用 `is`、`print`、`part of`、`extension` 和 `_`。

## 概述

这篇文档描述了我们设计和编写 Flutter 的方法，上到高级架构原则，下至缩进规则。

这些风格指南的主要目标是提高代码的可读性，以便每个人，无论是第一次阅读代码还是多年来维护代码，都能迅速确定代码的作用。次要的目标是设计出简单的系统，以尽可能快速定位 bug，并避免在主观事项上有分歧时的争论。

对于本文未涉及的内容，请查看 [Dart 风格指南](https://dart.cn/guides/language/effective-dart) 以获得更多建议。那份文件主要关注 Dart 特有的惯例，而这份文件更多的是关于 Flutter 惯例。

在某些情况下（例如，`if` 语句的换行），Dart 风格指南与 Flutter 指南不同。对于 Flutter 项目代码，以 Flutter 指南为准。这些差异是由稍微不同的优先级造成的。Flutter 指南旨在使代码具有高度的可读性，即使是那些从未见过代码的人和刚接触 Dart 的人，因为 Flutter 框架的代码将被阅读数百万次，而不是写。另一方面，Dart 指南的设计是为了提供一种更平衡的方法，它假定代码的编写在与代码的交互中占较大比例，并且读者对 Dart 更有经验。(`dart format` 工具使用 Dart 指南，所以我们不在 flutter/flutter 和 flutter/engine 仓库中使用它。然而，我们确实推荐在一般情况下使用它）。

### 谈谈 API 设计

设计一个 API 是一门艺术。像所有形式的艺术一样，实践是学习最佳方式。精通设计 API 的最好方法是花十年或更长时间来实践，同时与使用你的 API 的人紧密合作。理想的情况是，首先在可控的情况下，让少数的开发者使用自己的 API，然后再去写那些将被数十万甚至数百万开发者使用的 API。

在自己没有经验的情况下，可以尝试依靠别人的经验。这样做最大的问题是，有时解释为什么一个 API 不是最佳的，是一项非常困难和微妙的任务，有时，除非你已经有了很多设计经验，否则这些理由听起来难以令人信服。

正因如此，当你从一个有经验的 API 设计者那里收到关于 API 设计的反馈时，他们有时会感到不满，但又不能很好地表达出原因。这种情况发生时，请认真考虑是否废除你的 API，并找到一个新的解决方案。

在设计 API 时，需要一种不同的但同样重要的技能：不要执着于一种风格。你应该尝试许多截然不同的 API，然后尝试编写使用这些 API 的代码，看看它们是如何工作的。扔掉那些令人沮丧的 API，那些会导致错误的代码，或者那些其他人不喜欢的 API。如果它不优雅，最好推到重来而不是将错就错。

一个 API 是终生的，而不仅仅是你正在处理的一个 PR。

## 理念

### 惰性编程

按需编写代码，不应编写额外的冗余代码。

避免实现你不需要的特性。如果不知道需求边界，你就无法设计这个特性。为了「完整性」而实现的特性会导致没用的代码，这些代码在维护、学习、文档维护、测试等方面都很昂贵。

当你实现一个特性时，要以正确的方式实现它。避免临时措施。临时措施只是把问题往前推进，但成本更高：有人必须重看这个问题，找出你的临时解决方案，考虑如何去掉它（以及所有现在使用它的地方），再实现这个特性。花更长的时间来正确地解决一个问题，要比快速解决所有问题，但其解决方式需要在以后进行重构要好得多。

你可能会听到团队成员说：「embrace the [yak shave](http://www.catb.org/jargon/html/Y/yak-shaving.html)!」（译注：含义是任何看似无意义的活动，实际上是解决一个问题所必需的，而这个问题在经过几层递归之后，又解决了你正在研究的真正问题）。我们鼓励付出更大的努力，对一个问题进行适当的修复，而不是在出问题的地方贴上创可贴。

### 编写测试，查找 Bug

当你修复一个 bug 时，首先编写一个失败的测试，然后修复 bug 并验证测试通过。

当你实现一个新特性时，为它编写测试。另见：[运行和编写测试](https://github.com/flutter/flutter/wiki/Running-and-writing-tests)。

检查代码覆盖率，确保你的新代码的每一行都被测试。另见：[package:flutter 的测试覆盖率](https://github.com/flutter/flutter/wiki/Test-coverage-for-package%3Aflutter)。

如果有些东西没有经过测试，它很可能会被回退或被 「优化掉」。如果你想让你的代码留在代码库中，你应该确保对它进行测试。

不要在提交代码时承诺 "以后再写测试"。只要花时间在第一时间正确和完整地编写测试。

### 避免重复的状态

代表实时状态的对象不应该映射来自另一个来源的某些状态，因为它们的维护成本很高。（Web 的 `HTMLCollection` 对象就是此类对象的一个示例。）也就是说，**只保留一个真实来源，不要复制实时状态**。

### Getter 感觉上应比方法快

getters 应该是高效的（例如，只是返回一个缓存的值，或者一个 $O_1$ 表的查询）。如果一个操作是低效的，它应该是一个方法。（再看一下 Web：应会有 `document.getForms()`，而不是  `document.forms`，因为它要遍历整颗树）。

同样地，一个返回 Future 的 getter 不应该启动 Future 所代表的工作，因为getter 看起来是[幂等](https://baike.baidu.com/item/幂等/8600688)和无副作用的。相反，繁重的工作应该从一个方法或构造函数开始，而 getter 应该只是返回预先存在的 Future。

### 同步作业应是高效的

不应该有 API 需要同步完成昂贵的操作（例如，在布局阶段之外计算完整的应用程序布局）。昂贵的工作应该是异步的。

### 分层

我们使用分层的框架设计，每一层解决一个范围狭窄的问题，然后被下一层用来解决一个更大的问题。这在高层（Widgets 依赖于 rendering 依赖于 painting）和单个类以及方法（例如，`Text` 使用 `RichText` 和 `DefaultTextStyle`）都是如此。

便利的 API 属于它们所简化的那一层。

### 避免将多个概念交错在一起

每个 API 都应该是独立的，不应该知道其他的特性。交错的概念会导致*复杂性*。

比如：

- 许多 Widget 都有一个 `child`。Widgets 应该完全不知道那个 child 的类型。不要使用 `is` 或类似的检查来根据 child 的类型采取不同的行动。

- 每个 Render Object 只解决一个问题。与其让 Render Object 同时处理剪裁和不透明度，不如让一个 Render Object 处理剪裁，另一个处理不透明度。

- 一般来说，比起可变数据，我们更喜欢不可变对象。 不可变对象可以安全地传递，而不会有下游消费者更改数据的风险。（有时，在 Flutter 中，我们假装某些对象是不可变的，即使它们在技术上不是：例如，Widget 子节点列表通常在技术上由可变的 `List` 实例实现，但框架永远不会修改它们，事实上也无法处理用户对它们的修改。）不可变数据也证明通过 *lerping* 使动画更简单。

### 避免全局状态

一个函数应该只对其参数进行操作，如果它是一个实例方法，则是存储在其对象上的数据。这使得代码明显更容易理解。

例如，在阅读这段代码时。

```dart
// ... imports something that defines foo and bar ...

void main() {
  foo(1);
  bar(2);
}
```

... 阅读者应该肯定，对 `foo` 的调用不会影响对 `bar` 的调用。

这通常意味着精心设计 API，使它们要么把所有相关的输入作为参数，要么把相关输入作为一个对象传入，然后被调用时对这些输入进行操作。

这大大有助于使代码可测试，使代码可理解和可调试。当代码对全局状态进行操作时，它就更难推断了。

### 优先通用 API，但在有理由的情况下使用专用 API

例如，出于性能的考虑，可以使用专用的 API。如果一个特定的操作，例如剪切一个圆角矩形，使用通用 API 是昂贵的，但使用专用的 API 可以更高效地实现，那么就要创建一个专用的 API。

### 避免只抽象通用能力

针对多个平台（或自身在多个平台上运行的元平台，如 Web）的 SDK 提供适用于所有目标平台的 API 是很常见的。 不幸的是，这通常意味着一个平台或另一个平台独有的特性不可用。

对于 Flutter，我们明确志在为每个平台单独开发的最佳方式，以此来避免这种情况。 我们跨平台使用的能力次于我们在每个平台上能使用的能力。 例如，[TextInputAction](https://master-api.flutter.dev/flutter/services/TextInputAction-class.html) 的值仅在某些平台上才有意义。 同样，我们的 Platform Channel 机制旨在允许在每个平台上创建单独的扩展。

### 避免提供鼓励不良行为的 API

例如，不要提供遍历整颗树的 API，或鼓励 $O(N^2)$ 算法的 API，或鼓励串行的长期存在（long-live）的操作，而这些操作又是可以并发运行的。

特别是：

- 使用字符串操作生成数据或代码，随后这些代码将被解释（指被解释器）或解析。这是一种不好的做法，因为它导致了代码注入漏洞。
- 如果一个操作是昂贵的，这种代价应该在 API 中体现出来（例如，通过返回一个 `Future` 或一个 `Stream`）。避免提供隐藏任务代价的 API。

### 避免暴露 API 断层

将服务的某些方面从一个环境包装起来以在另一个环境中暴露（例如，在 Dart 中暴露 Android API）的便捷 API 应该暴露/包装完整的 API，以便在与该服务交互时不存在认知断崖（你可以在一定程度上使用暴露的 API，但除此之外必须了解所有有关底层服务的信息）。

### 避免暴露过多 API

封装底层服务但阻止底层 API 被直接访问的 API（例如 `dart:ui` 暴露 Skia 的方式）应该谨慎地只暴露底层 API 的最佳部分。这可能需要重构一些特性，使它们更有用处。可能意味着要避免暴露那些抽象了昂贵操作的便利特性，除非这样做有明显的性能提升。API 越小越容易理解。

例如，这就是为什么 `dart:ui` 没有公开 `Path.fromSVG()`：我们检查过了，直接在 Dart 中做这项工作也同样快，所以公开它没有好处。这样一来，我们就避免了成本（更大的 API 的维护、更高的文档和测试成本，并且给底层 API 带来了兼容性负担）。

### 避免摸索和魔法

可预测的、开发者可控的 API 通常比那些做正确的事情但不给开发者任何调整结果的 API 更受欢迎。

可预测性更令人放心。

### 通过字面意思解决真正的问题

在可能的情况下，尤其是对于新特性，你应该与需要该特性并愿意帮助你测试它的真实客户合作。 只有在真实场景中使用了某个特性，我们才能真正确信该特性已经准备好了。

同时要倾听他们的反馈。如果你的第一个客户说你的特性实际上并没有完全解决他们的场景，不要视为吹毛求疵而置之不理。通常情况下，与真正的开发人员所面临的实际问题相比，开始项目碰到的那些只是微不足道的问题。

### 在设计新 API 时获得早期反馈

如果您正在设计一个新的 API 或一个新的特性，请考虑[编写设计文档](https://github.com/flutter/flutter/wiki/Chat#design-documents)。然后，从相关人员那里获得反馈，例如，将其发送到 `flutter-dev` 或在[相关聊天频道](https://github.com/flutter/flutter/wiki/Chat#existing-channels)上发布。

### 站在开发者的角度设计 API

当我们创建一个新特性，而这个特性需要改变整个层次结构时，首先设计最底层的 API 是很诱人的，因为那是最接近「有趣」的代码（特性的 「业务端」，真正工作的地方）。然而，这就迫使高层的 API 必须针对低层的 API 进行设计，这可能合适，也可能不合适，最终开发者主要使用的高层 API 可能被搞得乌烟瘴气（无论是在实现上还是在暴露的 API 方面）。甚至可能最终的 API 并不适合人们思考问题或解决实际问题，而只是几乎逐字逐句地暴露了最低层的特性。

相反，总是先设计顶层的API。考虑在大多数开发者将与之互动的层面上，最符合人体工程学的 API 是什么。然后，一旦该 API 被设计得干净利落并经过可用性测试，就建立较低层次的 API，以便较高层次的 API 可以被分层。

具体来说，这意味着首先设计 `material` 或 `widgets` 层的API，接着是 `rendering`、`scheduler` 或 `services` 层的 API，接着是相关的绑定，接着是 `dart:ui` API 或消息通道协议，接着是内部引擎 API 或插件 API。（细节可能视情况而定）。

## 政策

本节定义了我们遵守的一些政策。在本节中没有非常具体的政策，the general philosophies in the section above are controlling.

### 插件兼容性

保证发布的版本等于或大于 1.0.0 的插件所需的 Flutter 版本不会超过该插件发布时的最新稳定版本。（插件也可能支持更早的版本，但这并不保证）。

### 临时方案

如果能帮助高知名度的开发者或多产的贡献者完成痛苦的过渡，我们愿意实施临时（一周或更短）的临时方案（例如 `// ignore` hacks）。如果需要使用此选项，请联系 @Hixie([ian@hixie.ch](mailto:ian@hixie.ch))。

### 避免废弃代码

不再维护的代码应该被删除或以某种方式归档，以明确表明它不再被维护。

例如，我们删除而不是注释掉代码。注释的代码终将没用，而且会使维护代码的人感到困惑。

同样地，所有仓库都应该有一个所有者，定期对收到的问题和 PR 进行分类，并修复已知的问题。没有每月进行分类（最好是更频繁地进行分类）的仓库应该被删除、隐藏或以其他方式归档。

### Widget 库遵循最新的 OEM 行为（Widget libraries follow the latest OEM behavior）

> 译注：OEM behavior，我的理解是，使用新的 Widget 去组合其他 Widget 以产生一个具有新能力的 Widget，这样的一种代工行为。

对于 `material` 和 `cupertino` 库，我们通常会实现最新的规范，除非这样做会造成严重的破坏性变化。例如，我们为 iOS 开关控件使用了最新样式，但是当 Material Design 引入了一种全新类型的按钮时，我们为此创建了一个新的小部件，而不是更新现有按钮以具有新样式。

## 文档 （dartdocs,  javadocs 等）

我们将 "dartdoc" 用于我们的 Dart 文档，并使用相似的技术来用其他语言（例如 ObjectiveC 和 Java）编写我们的 API 文档。 Flutter 库中的所有公共成员都应该有一个文档。

通常，请遵循 [Dart 文档指南](https://www.dartlang.org/effective-dart/documentation/#doc-comments)，除非与此页面相矛盾。

### 直接回答自己的问题

在使用 Flutter 时，如果您发现自己问了一个关于我们系统的问题，请将您随后发现的任何答案放到文档中，放在您第一次寻找答案的地方。这样一来，文档将由真正的问题的答案组成，人们会在那里找到它们。现在就开始这么做；如果你的其他不相关的 PR 中有一堆文档修复，以回答你在做 PR 时遇到的问题，这也没有问题。

我们试图避免依赖 「口传」。任何人都应该有可能贡献，而不必从现有的团队成员那里了解所有的细节。为此，所有的过程都应该被记录下来（通常是在维基上），代码应该是不言自明的，或者是有注释的，惯例应该被写下来，比如说在我们的风格指南中。

有一个例外：如果草草在 API 文档记录某些内容，那不如不写。这是因为如果你不记录它，它仍然会出现在我们要记录的事项列表中。你可以随意删除违反我们以下规则的文档（尤其是下一个），以使其重新出现在列表中。

### 避免无用的文档

如果文档不包含其他的信息，与标识符（如类名、变量名）看过去一样，那么它是没用的。

避免写入此类文档，因为它并不比没有文档好，但会使我们注意不到标识符实际上没有真正的文档。

示例（来自 CircleAvatar）：

```dart
// BAD:

/// The background color.
final Color backgroundColor;

/// Half the diameter of the circle.
final double radius;


// GOOD:

/// The color with which to fill the circle.
///
/// Changing the background color will cause the avatar to animate to the new color.
final Color backgroundColor;

/// The size of the avatar.
///
/// Changing the radius will cause the avatar to animate to the new size.
final double radius;
```

### 写好文档的提示

如果你在编写有用的文档时遇到困难，这里有一些提示，可以帮助你写出更详细的文章。

- 如果有人在看文档，这意味着他们有个问题，无法通过猜测或查看代码得到答案。这个问题可能是什么？试着回答你能想到的所有问题。
- 如果你要告诉别人这个属性，他们可能想知道什么是他们猜不到的？例如，是否有不直观的边缘情况？
- 考虑一下属性或参数的类型。是否有超出正常范围的情况需要讨论？例如，负数、非整数值、透明色、空数组、无穷大、NaN、null？讨论任何重要但罕见的情况。
- 这个成员（指类成员）是否与其他成员相互作用？例如，只有当另一个成员为空时，它才能成为非空？这个成员只有在另一个成员有特定的数值范围时才会有任何影响吗？这个成员是否会导致另一个成员有任意影响，或者另一个成员有什么影响？
- 这个成员是否与另一个成员有类似的名称或目的，以致于我们应该指向那个成员，并从那个成员指向这个成员？使用 `See also:`  模式。
- 是否有时机上的考虑？有没有潜在的竞争条件？
- 是否有生命周期的考虑？例如，谁拥有这个属性被赋值的对象？如果有关联的话，谁应该  `dispose()` 它？
- 这个属性/方法的契约（contract）是什么？它可以在任何时候被调用吗？对什么值有效有限制吗？如果这是一个从构造函数中设置的 `final` 属性，那么构造函数对该属性可以被设置为什么有限制吗？如果这是一个构造函数，是否有任何参数不能为空？
- 如果涉及到 `Future` 的值，围绕这些的保证是什么？考虑它们是否可以在出错的情况下完成，它们是否根本无法完成，如果底层操作被取消会发生什么，诸如此类。

### 删繁就简

使用超过必要的词汇是很容易的。尽可能避免这样做，即使结果有些简练。

```dart
// BAD:

/// Note: It is important to be aware of the fact that in the
/// absence of an explicit value, this property defaults to 2.

// GOOD:

/// Defaults to 2.
```

特别是，要避免说「注意：」。它毫无用处。

### 在注释中留下导览路径

这对于类级别的文档尤其重要。

如果类是使用某种类型 builder 构造的，或者可以通过某些机制而不是仅仅调用构造器来获得，那么就在类的文档中包含这些信息。

如果一个类通常是通过将其传递给特定的 API 来使用的，那么也要在类文档中包含该信息。

如果一个方法是用来获取特定对象的主要机制，或者是消费特定对象的主要方式，那么在方法的描述中提到它。

类型定义应该至少提到一个使用签名的地方。

这些规则形成了一个导览路径，读者可以按照这个链从任何他们认为与需求相关的类或方法，找到实际需要的类或方法。

例子:

```dart
// GOOD:

/// An object representing a sequence of recorded graphical operations.
///
/// To create a [Picture], use a [PictureRecorder].
///
/// A [Picture] can be placed in a [Scene] using a [SceneBuilder], via
/// the [SceneBuilder.addPicture] method. A [Picture] can also be
/// drawn into a [Canvas], using the [Canvas.drawPicture] method.
abstract class Picture ...
```

也可以使用 "See also" 链接：

```dart
/// See also:
///
/// * [FooBar], which is another way to peel oranges.
/// * [Baz], which quuxes the wibble.
```

每行应以句号结束。倾向于使用 "which..." 句式，而不是在行中使用括号。在 "See also:" 和列表的第一个项目之间应该有一个空行。

### 当文档难以理解时重构代码

如果编写文档被证明是困难的，因为 API 是错综复杂的，那么重写 API 而不是试图编写文档。

### 术语的规范性

文档应该使用一致的术语。

- *方法（method）* ——  一个类的成员，是一个非匿名的闭包
- *函数（function）* ——  一个可调用的非匿名闭包，不是类的成员
- *形参（parameter）*—— 在闭包签名中定义的变量，可能在闭包主体中使用。
- *实参（argument）* —— 调用一个闭包时传递给它的值。

谈到跳转到一个闭包时，更倾向于使用 "call" 一词，而不是 "invoke" 一词。

谈到与特定对象相关的变量时，更倾向于使用术语「成员变量」而不是 「实例变量」。

Typedef dartdocs 通常应该以 "Signature for... " 开头。

### 使用正确的语法

避免以小写字母作为开头。

```dart
// BAD

/// [foo] must not be null.

// GOOD

/// The [foo] argument must not be null.
```

同样地，所有的句子都要用句号来结束。

### 使用被动语态；建议，不要求

不要使用「你」或「我们」。避免使用命令式语气。避免价值判断。

不要告诉别人做什么，而是使用「考虑」，如「考虑使用 [bar] 获取 foo」。

一般来说，你不知道谁在阅读文档，也不知道为什么。有人可能继承了一个糟糕的代码库，并且正在阅读我们的文档以找出如何修复它；通过说 「你不应该做 X」或「避免 Y」或「如果你想要 Z」，你会让读者在发现与文档矛盾的代码时处于防御姿态（毕竟他们继承了这个代码库，我们有什么资格说他们做错了，这不是他们的错）。

### 提供示例代码

示例代码可以帮助开发者快速学习你的API。编写示例代码也有助于你思考 API 将如何被 App 开发者使用。

示例代码应该放在文档注释中，通常以 `/// {@tool dartpad}` 开始，以 `/// {@end-tool}` 结束，示例源码和相应的测试放在 [API 示例目录](https://github.com/flutter/flutter/blob/master/examples/api)下的文件中。然后，这将被自动化工具检查，并被格式化以显示在 API 文档网站 [api.flutter.dev](https://api.flutter.dev/) 上。关于如何编写示例代码的细节，请参见 [API 示例文档](https://github.com/flutter/flutter/blob/master/examples/api/README.md#authoring)。

**提供完整的应用示例。**

我们的 UX 研究表明，开发人员更希望看到有完整上下文的应用程序的例子。因此，只要是有意义的，提供一个完整应用的局部示例，而不仅仅使用 `{@tool snippet}` 或 \`\`\`dart ...\`\`\` 指标的片段。

可以使用 `{@tool dartpad}` ... `{@end-tool}` 或 `{@tool sample}` ... `{@end-tool}` dartdoc 标识符创建一个应用程序示例。关于编写这类例子的更多细节，请看[这里](https://github.com/flutter/flutter/blob/master/examples/api/README.md#authoring)。

Dartpad 例子（那些使用 dartdoc 标识符 `{@tool dartpad}` 的例子）将作为页内可执行和可编辑的例子呈现在 API 文档网站上。这使得开发者可以在页面上与示例进行互动，是首选的示例形式。[这里](https://github.com/flutter/flutter/blob/master/examples/api/README.md#authoring)就是一个这样的例子。

对于在网页中没有意义的例子（例如，与特定平台功能互动的代码），应用程序的例子（使用dartdoc `{@tool sample}` 标识）是首选，并将在 API 文档网站上与如何将该例子实例化为可以运行的应用程序的信息一起呈现。

有些支持的 IDE 使用 Flutter 插件查看 Flutter 源代码时，也可以选择用这两种例子创建一个新项目。

### 提供插图、图表或屏幕截图

对于在屏幕上绘制像素的任何 Widget，在其 API 文档中显示它的外观有助于开发人员确定 Widget 是否有用并学习如何自定义它。 所有插图都应易于重现，例如，通过运行 Flutter 应用程序或脚本。

例子：

- AppBar Widget 的图示

  ![AppBar](https://camo.githubusercontent.com/ee5fec3307eb32af5dfab08ad57620de210256bb344e66a707ad8262d654e600/68747470733a2f2f666c75747465722e6769746875622e696f2f6173736574732d666f722d6170692d646f63732f6173736574732f6d6174657269616c2f6170705f6261722e706e67)

- Card Widget 的截图

  ![Card Widget](https://user-images.githubusercontent.com/348942/28338544-2c3681b8-6bbe-11e7-967d-fcd7c830bf53.png)

  创建图示时，请确保提供 [HTML 规范](https://html.spec.whatwg.org/multipage/images.html#alt)中描述的替代文本。

### 明确标记废弃的 API

我们有关于弃用的惯例。更多细节请参见 [Tree Hygiene](https://github.com/flutter/flutter/wiki/Tree-hygiene#deprecation)  页面。

### 使用 `///` 编写公有质量的私有文档

一般来说，私有代码也可以而且应该有文档。如果这些文档的质量足够好，以至于我们可以在公开类的时候一字不差地包含它（也就是说，它满足上述所有的风格准则），那么你可以为这些文档使用 `///`，尽管它们是私有的。

质量不高的私有 API 的文档应该只使用 `//`。这样，如果我们把相应的类变成公共的，这些文档注释就会被标记为缺失，我们就会知道要更仔细地检查它们。

对于你所认为的「足够的质量」，你可以自由地采取保守态度。即使你有多段落的文档，使用 `//` 也是可以的；这是一个标志，表明我们在公开代码时应该仔细地重新审查文档。

### Dartdoc 模板和宏

Dartdoc 支持创建模板，这些模板可以在代码的其他部分重复使用。它们是这样定义的：

```dart
/// {@template <id>}
/// ...
/// {@endtemplate}
```

并通过以下方式使用：

```dart
/// {@macro <id>}
```

`<id>` 应该是格式为 `flutter.library.Class.member[.optionalDescription]` 的唯一标识符。

例如：

```dart
// GOOD:
/// {@template flutter.rendering.Layer.findAnnotations.aboutAnnotations}
/// Annotations are great!
/// {@endtemplate

// BAD:
/// {@template the_stuff!}
/// This is some great stuff!
/// {@endtemplate}
```

只有在一个 Dartdoc 块中定义了一个以上的模板时，标识符的 `optionalDescription` 部分才是必要的。如果符号不是库的一部分，或者不是类的一部分，那么就从 ID 中省略这些部分。

### Dartdoc 的具体要求

任何 dartdoc 章节的第一段必须是一个简短的自成一体的句子，解释代码的目的和意义。随后的段落必须详细说明。避免让第一段有多个句子。（这是因为第一段会被摘录并用于目录等，所以必须能够独立存在，不占用大量的空间）。

当引用一个参数时，请使用反斜线。然而，当引用一个同时对应于一个属性的参数时，用方括号代替。（这与 Dart 风格指南相矛盾，该指南说两者都要使用方括号。我们这样做是因为 [dartdoc issue 1486](https://github.com/dart-lang/dartdoc/issues/1486)。目前，还没有办法明确地引用一个参数。我们希望避免出现这样的情况：一个参数的名字恰好与一个属性相同，尽管与该属性没有任何关系，却被链接到该属性上。）

```dart
// GOOD

  /// Creates a foobar, which allows a baz to quux the bar.
  ///
  /// The [bar] argument must not be null.
  ///
  /// The `baz` argument must be greater than zero.
  Foo({ this.bar, int baz }) : assert(bar != null), assert(baz > 0);
```

避免使用「上面」或「下面」这样的术语来引用另一个 dartdoc 章节。Dartdoc 章节通常在网页上单独显示，类的完整上下文此时并不存在。

## 编码模式和提前捕获错误

### 尽量使用断言来检测违约和验证不变性

`assert()` 允许我们尽可能保证正确性，而不用在 release 模式中承担性能上的代价，因为Dart 只在调试模式下评估断言。

它应该被用来验证合约和不变量是否如我们所期望的那样被满足。断言并不强制执行合约，因为它们在发布版本中根本就不运行。它们应该被用于验证在代码中不存在错误的情况下，条件不可能为 false。

下面的例子来自 `box.dart`:

```dart
abstract class RenderBox extends RenderObject {
  // ...

  double getDistanceToBaseline(TextBaseline baseline, {bool onlyReal: false}) {
    // simple asserts:
    assert(!needsLayout);
    assert(!_debugDoingBaseline);
    // more complicated asserts:
    assert(() {
      final RenderObject parent = this.parent;
      if (owner.debugDoingLayout)
        return (RenderObject.debugActiveLayout == parent) &&
            parent.debugDoingThisLayout;
      if (owner.debugDoingPaint)
        return ((RenderObject.debugActivePaint == parent) &&
                parent.debugDoingThisPaint) ||
            ((RenderObject.debugActivePaint == this) && debugDoingThisPaint);
      assert(parent == this.parent);
      return false;
    });
    // ...
    return 0.0;
  }

  // ...
}
```

### 优先选择专用的函数、方法和构造函数

在有多种选择的情况下，使用关联性最高的构造函数或方法。

例如：

```dart
// BAD:
const EdgeInsets.TRBL(0.0, 8.0, 0.0, 8.0);

// GOOD:
const EdgeInsets.symmetric(horizontal: 8.0);
```

### 最小化常量的可见范围

与使用全局常量相比，优先在相关的类中使用局部常量或静态常量。

一般来说，当你有很多常量的时候，把它们包在一个类里。关于这方面的例子，参见[lib/src/material/colors.dart](https://github.com/flutter/flutter/blob/master/packages/flutter/lib/src/material/colors.dart)。

### 避免使用 `if` 链或 `?:` 或 `==` 与枚举值一起使用

如果你正在检查一个枚举，请使用没有 `default` case 的 `switch`，因为当你使用 `switch` 时，如果你错过了任何一个值，分析器会警告你。应该避免使用 `default` case，这样分析器就会在漏掉一个值时发出警告。未使用的值可以根据情况用 `break` 或 `return` 来分组。

避免使用 `if` 链、`? ... : ...`，或者一般来说，任何涉及枚举的表达式。

### 避免使用 `var` 和 `dynamic`

所有的变量和参数都是类型化的；在任何情况下都要避免使用 `dynamic` 或 `Object`，因为你可以弄清楚实际的类型。在可能的情况下，总是对通用类型进行专用化处理。明确规定所有 list 和 Map 字面量的类型。为所有的参数提供类型，即使在闭包中，即使你不使用参数。

这样做有两个目的：验证编译器推断出的类型是否与你期望的类型一致；在类型不明显的情况下（例如，调用构造函数以外的任何东西），使代码具有 self-documenting。

总是避免 `var` 和 `dynamic`。如果类型不明，最好使用 `Object`（或 `Object?`）和类型转换，因为使用 `dynamic` 会使所有的静态检查失效。

### 避免使用 `library` 和 `part of`

> 译注，不翻译这段的原因参见「Avoid naming undocumented libraries」一节

Prefer that each library be self-contained. Only name a `library` if you are documenting it (see the documentation section).

We avoid using `part of` because that feature makes it very hard to reason about how private a private really is, and tends to encourage "spaghetti" code (where distant components refer to each other) rather than "lasagna" code (where each section of the code is cleanly layered and separable).

### 避免使用 `extension`

扩展方法很难编写文档以及难以被发现。对于终端开发者来说，他们看起来和类的内置 API 没有什么不同，而且发现文档和实现上，都比类成员更有挑战性。

最好是直接向相关的类添加方法。如果这是不可能的，那就创建一个方法，清楚地标明它与什么对象一起工作，是什么对象的一部分。

（有个少见的例外是，为那些废弃的特性提供临时方案的 extension。然而，在这些情况下，扩展和它们的所有成员必须在添加它们的 PR 中标记为废弃，并且必须根据我们的废弃政策来删除它们）。

### 避免使用 `FutureOr<T>`

`FutureOr` 类型是一个 Dart 内部的类型，用于解释 Future API 的某些方面。在公共 API 中，要避免使用这种类型创建既是同步又是异步的 API，因为这通常只会导致 API 更令人困惑，类型更不安全。

在某些极端的情况下，API 绝对需要是异步的，但为了性能需要一个同步的「应急出口」，可以考虑使用 `SynchronousFuture`（但要注意，这仍然有许多同样的风险，使 API 变得复杂）。例如，在 Flutter 框架中加载图像时，就使用了这个方法。

### 在使用一个端口之前，永远不要检查它是否可用，永远不要添加超时和其他竞争条件

如果你寻找一个可用的端口，然后试图打开它，那么在你的检查和你打开端口期间，极有可能每周都有其他代码打开这个端口，这将导致失败。

> 相反，让打开端口的代码选择一个可用的端口并返回，而不是被赋予一个（假定的）可用端口。

If you have a timeout, then it’s very likely that several times a week some other code will happen to run while your timeout is running, and your "really conservative" timeout will trigger even though it would have worked fine if the timeout was one second longer, and that will cause a failure.

> 相反，让超时的代码显示一条消息，说事情意外地花了很长时间，这样，使用工具的人可以看到有什么不对劲，但自动系统不会受到影响。

像这样的竞赛条件是造成测试不稳定的主要原因，它浪费了所有人的时间。

同样地，要避免延时或休眠，这些延迟或睡眠的目的是为了与某件事情所需的时间相吻合。你可能认为等待两秒就可以了，因为它通常需要 10 ms，但是一周内有几次你的 10 ms 任务实际上需要 2045 ms，你的测试就会失败，因为等待两秒的时间不够长。

> 相反，要等待一个触发事件。

### 避免缺乏明确推导的魔法数字

测试代码和其他地方的数字应该是可以清楚理解的。当一个数字的出处不明显时，可以考虑留下表达式或添加一个清晰的注释。

```dart
// BAD
expect(rect.left, 4.24264068712);

// GOOD
expect(rect.left, 3.0 * math.sqrt(2));
```

### 使用临时目录时要有良好的习惯

给目录一个唯一的名字，以 `flutter_` 开头，以句号结尾（后面是自动生成的随机字符串）。

为了保持一致性，将指向临时目录的 `Directory` 对象命名为 `tempDir`，并使用createTempSync 创建它，除非你需要异步创建（例如，在创建时显示进度）。

当不再需要这个目录时，一定要把它清理掉。在测试中，使用 `tryToDelete` 便利函数来删除目录。（我们使用 `tryToDelete` 是因为在 Windows 上，当删除临时目录时，通常会出现「拒绝访问」的错误。我们不知道为什么；如果你能搞清楚，那么可以简化很多代码！)

### 在 setters 中执行 dirty 检查

脏检查用来确定更改的值是否已同步到应用程序的其余部分。

表示类脏标记的可变属性，在赋值时使用以下模式：

```dart
/// Documentation here (don't wait for a later commit).
TheType get theProperty => _theProperty;
TheType _theProperty;
void set theProperty(TheType value) {
  assert(value != null);
  if (_theProperty == value)
    return;
  _theProperty = value;
  markNeedsWhatever(); // the method to mark the object dirty
}
```

该参数被称为 `value`，以便于复制和粘贴重复使用这种模式。如果由于某种原因你不想使用 `value`，请使用 `newProperty`（其中 `Property` 是属性名称）。

在方法的开头，用任意断言验证该值。

除了将对象标记为 dirty 和更新内部状态之外，不要在 setters 中做任何其他事情。getters 和 settings 不应该有明显的副作用。例如，设置一个其值是回调的属性不应该导致回调被调用。设置一个其值是某种对象的属性不应该导致该对象的任何方法被调用。

### `operator` 和 `hashCode` 的常见模板

我们有很多重写 `operator ==` 和 `hashCode` 的类（"值类"）。为了保持代码的一致性，我们对这些方法使用以下风格。

```dart
@override
bool operator ==(Object other) {
  if (other.runtimeType != runtimeType)
    return false;
  return other is Foo 
      && other.bar == bar
      && other.baz == baz
      && other.quux == quux;
}

@override
int get hashCode => hashValues(bar, baz, quux);
```

对于有很多属性的对象，可以考虑在 `operator ==`: 的顶部添加以下内容：

```dart
  if (identical(other, this))
    return true;
```

（我们还没有到处使用这种确切的风格，所以请随时更新你遇到的还没有使用它的代码）。

一般来说，仔细考虑重写 `operator ==` 是否是一个好主意。它可能很昂贵，特别是如果它比较的属性本身就可以用自定义的 `operator ==` 来比较。如果真的重写了，应该在相关的类层次结构上使用 @immutable。

### 重写 `toString`

除了微不足道的类之外，在所有的类上使用 `Diagnosticable`（而不是直接重写 `toString`）。这使我们能够从 [devtools](https://pub.dartlang.org/packages/devtools) 和 IDE 中检查该对象。

对于那些微不足道的类，重写 `toString` 如下，以帮助调试：

```dart
@override
String toString() => '${objectRuntimeType(this, 'NameOfObject')}($bar, $baz, $quux)';
```

... 但即使如此，也要考虑使用 `Diagnosticable` 来代替。避免使用 `$runtimeType`，因为它在 release 和 profile 模式下也会增加一些的成本。`objectRuntimeType` 方法为你处理这个问题，当断言被禁用时回退到提供常量字符串。

### 明确 `dispose()` 和对象的生命周期

即使 Dart 支持垃圾回收，但定义对象生命周期和明确的所有权模型（例如，在 API 文档中描述允许改变对象的人）对于避免细微的错误和令人困惑的设计很重要。

例如，如果你的类具有明确的「生命终结」，请提供一个 `dispose()` 方法来清理引用（例如监听器），否则这些引用会阻止某些对象被垃圾收集。 例如，考虑一个订阅了全局广播流（可能有其他监听器）的 Widget。 该订阅将阻止 Widget 被收集垃圾，直到流本身消失（对于全局流，这可能永远不会发生）。

一般来说，假装 Dart 没有垃圾收集可以减少困惑和错误代码，因为它迫使你考虑对象所有权和生命周期的含义。

### 测试用 API 属于测试框架

为测试目的而存在的机制不属于核心库，它们属于测试工具。这使主仓库在生产中的成本降低，并避免了人们可能滥用测试 API 的风险。

### 不可变的类不应该有隐藏的状态

不可变的类（那些有 `const` 构造函数的类）不应该有隐藏的状态。例如，它们不应该使用私有状态或 [Expandos](https://developer.mozilla.org/zh-CN/docs/Glossary/Expando)。如果它们是有状态的，那么它们就不应该是 `const` 的。

### 避免使用 `sync*`/`async*`

当每次迭代都很昂贵，希望惰性生成迭代对象，或者是迭代次数非常多时，使用生成器函数（`sync*`/`async*`）可能是一个强大的改进。

它不应该被用来代替构建和返回一个 `List`，特别是对于那些只产生少量成员的方法，或者当调用者无论如何都会生成整个集合的时候。在非常大的函数中也应该避免使用它。

它在维护和使用迭代器方面产生了运行时的开销，而且编译器在将生成器实际解构为使用迭代器类的东西时产生了空间开销。

## 命名

### 全局常量名以 "k" 为前缀

例子：

```dart
const double kParagraphSpacing = 1.5;
const String kSaveButtonTitle = 'Save';
const Color _kBarrierColor = Colors.black54;
```

然而，尽可能避免使用全局常量。与其考虑 `kDefaultButtonColor`，不如考虑 `Button.defaultColor`。如果有必要，可以考虑创建一个带有私有构造函数的类来保存相关常量。没有必要为非全局常量添加 `k` 前缀。

### 避免缩写

除非缩写比扩展更容易辨认（如 XML、HTTP、JSON），否则在为标识符选择名称时要展开缩写。一般来说，避免单字符的名字，除非这一个字符是惯例（例如，使用 `index` 而不是 `i`，但使用 `x` 而不是 `horizontalPosition`）。

### 避免匿名参数名

提供完整的类型信息和名称，即使是那些未使用的参数。这使得阅读代码的人更容易知道实际发生了什么（例如，什么被忽略了）。例如。

```dart
onTapDown: (TapDownDetails details) { print('hello!'); }, // GOOD
onTapUp: (_) { print('good bye'); }, // BAD
```

### 类型定义和函数变量的命名规则

当命名回调时，用 `FooCallback` 表示类型定义，`onFoo` 表示回调参数或属性（译注：例如 `onClose`），`handleFoo` 表示被调用的方法。

如果你有一个带参数的回调，但你想忽略这些参数，无论如何要给出参数的类型和名称。这样，如果有人复制和粘贴你的代码，他们就不必去查找参数是什么。

永远不要把一个方法叫做 `onFoo`。如果一个属性被称为 `onFoo`，它必须是一个函数类型。

### 正确拼写标识符和注释中的单词

对于拼写，我们的主要来源是 [Material Design Specification](https://material.google.com/)，其次是字典。

避免「可爱」的拼写。例如，'colors'，而不是 'colorz'。

倾向于使用美式英语拼写。例如，'colorize'，而不是 'colorise'，'canceled'，而不是 'cancelled'。

优先选择复合词而不是「可爱」的拼法，以避免与保留词冲突。例如，'classIdentifier'，而不是 'klass'。

### 正确地拼写大小写

一般来说，使用 Dart 的建议来命名标识符。请考虑以下的附加准则。

如果一个词的拼写是正确的（根据上一节所述的来源），作为一个单词，那么它不应该有任何内部大写或空格。

例如，倾向于使用 `toolbar`、`scrollbar`，但 `appBar`（文档中使用 'app bar'）、`tabBar`（文档中使用 'tab bar'）。

同样地，使用 `offstage` 而不是 `offStage`。

给类命名时尽可能避免使用 `iOS`。`iOS` 的正确拼写不满足驼峰式命名，更不满足大驼峰式命名；尽可能使用 "Cupertino" 或 "UIKit" 这样的替代品。实在不行必须在标识符中使用 "iOS"，请将写成 `IOS`。[双字母例外](https://dart.dev/guides/language/effective-dart/style#do-capitalize-acronyms-and-abbreviations-longer-than-two-letters-like-words)是否适用于 "iOS" 是有争议的，但 `IOS` 与 Dart APIs 是一致的，替代方案（IOs、Ios）看起来更别扭。（本指南的先前版本错误地指出  `Ios`  在必要时是正确的大写形式；这种形式不应在新代码中使用）。

### 避免 API 中的双重否定句

用肯定句式命名你的布尔变量，例如「启用」或「可见」，即使默认值为 true。

这是因为，当你有一个名为 “disabled” 或 “hidden” 的属性或参数时，尝试启用或显示 Widget 时，它会导致诸如 `input.disabled = false` 或 `widget.hidden = false` 之类的代码，非常地令人困惑。

### 优先将 setter 的参数命名为 `value`

除非这会导致其他问题，否则请使用 `value` 作为 setter 参数的名称。 这使得以后复制/粘贴 setter 变得更容易。

### 限定仅用于调试的变量和方法

如果有仅在调试模式下使用的变量或方法（甚至是类！），请在它们的名称前加上 `debug` 或 `_debug`（或者，对于类使用 `_Debug`）。

不要在生产代码中使用调试变量或方法（或类）。。

### Avoid naming undocumented libraries

> 译注：在 Dart 的文档中没有找到和 `library` 关键字有关的信息，这一特性似乎在最新的 Dart 中并不流行，我也没有用过，因此并不理解，这一节不翻译。

In other words, do not use the `library` keyword, unless it is a documented top-level library intended to be imported by users.

## 注释

### 避免写入提问的注释

找到问题的答案，或者描述困惑点，包括你找到答案的引用。

如果评论的是一个解决 bug 的临时方案，留下一个 issue 链接和一个 TODO，以便在错误被修复后进行清理。

例如：

```dart
// BAD:

// What should this be?

// This is a workaround.


// GOOD:

// According to this specification, this should be 2.0, but according to that
// specification, it should be 3.0. We split the difference and went with
// 2.5, because we didn't know what else to do.

// TODO(username): Converting color to RGB because class Color doesn't support
//                 hex yet. See http://link/to/a/bug/123
```

TODOs 应该包括大写的 TODO 字符串，后面的括号里是对 TODO 所指的问题有最多了解的人的 GitHub 用户名。TODO 并不是承诺被提及的人将会解决这个问题，它的目的是让有足够背景的人去解释这个问题。因此，当你创建一个 TODO 时，总是给出你的用户名。

在 TODO 描述中包含一个 issue 链接是必要的。

### 评论全部 `// ignores`

有时，有必要写一些分析器不满意的代码。

如果你发现自己处于这种情景，请考虑你是如何走到这一步的。分析器实际上是正确的，但你不想承认它？想一想怎样才能重构你的代码，使分析器满意。如果这样的重构会使代码变得更好，那就去做吧。（这可能是一个很大的工作... embrace the yak shave（译注：参见上文）。)

如果你确定别无选择，只能让分析器保持沉默，那就使用 `// ignore: `。ignore 指令应该和分析器的警告在同一行。

如果忽略是临时性的（例如，临时解决编译器或分析器的 bug，或者临时解决 Flutter 中一些你无法修复的已知问题），那么添加一个相关 bug 的链接，如下所示。

```dart
foo(); // ignore: lint_code, https://link.to.bug/goes/here
```

如果 ignore 指令是永久性的，例如因为有个 lint 有出现了不可避免的误报，在这种情况下，违反 lint 肯定比其他选项更好，那么添加一条评论来解释原因：

```dart
foo(); // ignore: lint_code, sadly there is no choice but to do
// this because we need to twiddle the quux and the bar is zorgle.
```

### 评论所有被跳过测试

在极少数情况下，可能需要跳过测试。 为此，请使用 `skip` 参数。 每当你使用 `skip` 参数时，提出一个 issue，描述它被跳过的原因，并在代码中包含指向该 issue 的链接。

### 评论空闭包作为 `setState` 的参数

通常传递给 `setState` 的闭包应该包括所有改变状态的代码。 有时这是不可能的，因为状态在其他地方发生了变化，`setState` 仅做触发。 在这些情况下，请在 `setState` 闭包中包含一个注释，解释它更改了什么状态。

```dart
setState(() { /* The animation ticked. We use the animation's value in the build method. */ });
```

## 格式化

这些指南没有技术影响，但纯粹出于一致性和可读性的原因，它们仍然很重要。

我们还没有使用 `dartfmt`（flutter/plugins 和 flutter/packages 除外）。 Flutter 代码倾向于使用标准 Dart 格式化程序不能很好处理的模式。我们正在[与 Dart 团队合作](https://github.com/flutter/flutter/issues/2025)，让 `dartfmt` 了解这些模式。

### 为手动格式化所需的额外工作辩护

Flutter 代码最终可能每天被数十万人阅读。更容易阅读和理解的代码可以节省这些人的时间。每天为每个人节省一秒钟，就可以转化为每天节省数小时甚至数天的时间。人们为 Flutter 贡献的额外时间直接转化为我们的开发人员的实际节约，随着我们的开发人员更快地学习该框架，这将转化为我们的最终用户的实际利益。

### 构造函数排在类的第一位

默认（未命名）构造函数应该首先出现，然后是命名构造函数。它们应该排在其他任何东西之前（包括，如，常量或静态方法）。

这有助于读者一目了然地确定该类是否具有默认的隐含构造函数。如果构造函数可能存在于类中的任何位置，那么读者将不得不检查类的每一行以确定是否存在隐式构造函数。

### 以有意义的方式对其他类成员进行排序

类的方法、属性和其他成员的顺序应有助于读者理解类的工作方式。

如果有一个明确的生命周期，那么方法调用的顺序将会很有用，例如 `initState` 方法在 `dispose` 之前。这对读者很有帮助，因为代码是按时间顺序排列的，例如，他们可以看到变量在使用之前被初始化。如果字段只用于特定方法组，则字段应位于操作它们的方法之前。

> 例如，RenderObject 将所有布局字段和布局方法组合在一起，然后是所有绘制字段和绘制方法，因为布局发生在绘制之前。

如果没有明显的特定顺序，则建议使用以下顺序，每个之间都有空行：

1. 构造函数，首选默认构造函数。
2. 与类相同类型的常量。
3. 返回与类相同类型的静态方法。
4. 从构造函数设置的 final 字段。
5. 其他静态方法。
6. 静态属性和常量。
7. 可变属性，每个属性都按 getter、私有字段、setter 的顺序排列，没有换行符分隔它们。
8. 只读属性（`hashCode` 除外）。
9. 运算符（`==` 除外）。
10. 方法（`toString` 和 `build` 除外）
11. `build` 方法，用于 `Widget` 和 `State` 类。
12. `operator ==`、`hashCode`、`toString`， 和与诊断相关的方法，按此顺序排列。

成员的顺序也保持一致。如果构造函数列出了多个字段，那么这些字段应该以相同的顺序声明，任何对所有字段进行操作的代码都应该以相同的顺序操作它们（除非顺序很重要）。

### 构造函数语法

如果你在构造函数初始化列表中调用 `super()`，在构造器参数的结束括号和冒号之间加一个空格。如果初始化器列表中还有其他东西，请将 `super()` 调用与其他参数对齐。如果你没有参数可以传递给父类，就不要调用 `super`。

```dart
// one-line constructor example
abstract class Foo extends StatelessWidget {
  Foo(this.bar, { Key key, this.child }) : super(key: key);
  final int bar;
  final Widget child;
  // ...
}

// fully expanded constructor example
abstract class Foo extends StatelessWidget {
  Foo(
    this.bar, {
    Key key,
    Widget childWidget,
  }) : child = childWidget,
       super(
         key: key,
       );
  final int bar;
  final Widget child;
  // ...
}
```

### 最大行宽为 80 个字符

争取最大行宽约为 80个字符，但如果换行会使其可读性降低，或者会使该行与附近的其他行不一致，可以让它超出。最好避免在赋值运算符后断行。

```dart
// BAD (breaks after assignment operator and still goes over 80 chars)
final int a = 1;
final int b = 2;
final int c =
    a.very.very.very.very.very.long.expression.that.returns.three.eventually().but.is.very.long();
final int d = 4;
final int e = 5;

// BETTER (consistent lines, not much longer than the earlier example)
final int a = 1;
final int b = 2;
final int c = a.very.very.very.very.very.long.expression.that.returns.three.eventually().but.is.very.long();
final int d = 4;
final int e = 5;
```

```dart
// BAD (breaks after assignment operator)
final List<FooBarBaz> _members =
  <FooBarBaz>[const Quux(), const Qaax(), const Qeex()];

// BETTER (only slightly goes over 80 chars)
final List<FooBarBaz> _members = <FooBarBaz>[const Quux(), const Qaax(), const Qeex()];

// BETTER STILL (fits in 80 chars)
final List<FooBarBaz> _members = <FooBarBaz>[
  const Quux(),
  const Qaax(),
  const Qeex(),
];
```

### 将多行参数和参数列表缩进 2 个字符

当将参数列表拆分成多行时，将实参缩进两个字符。

例子：

```dart
Foo f = Foo(
  bar: 1.0,
  quux: 2.0,
);
```

形参换行业使用相同的规则。

### 如果在一些开头的标点符号后有一个换行，那么就在结尾的标点符号上匹配它

反之亦然。

例子：

```dart
// BAD:
  foo(
    bar, baz);
  foo(
    bar,
    baz);
  foo(bar,
    baz
  );

// GOOD:
  foo(bar, baz);
  foo(
    bar,
    baz,
  );
  foo(bar,
    baz);
```

### 对实参、形参和列表项使用尾部逗号，但前提是它们占据一整行

例子：

```dart
List<int> myList = [
  1,
  2,
];
myList = <int>[3, 4];

foo1(
  bar,
  baz,
);
foo2(bar, baz);
```

这些 item 全放一行，或是拆分成多行，是一种审美选择。我们倾向于选择可读性最高的方式。

然而，也有例外情况。例如，如果有六个连续定义的 list，除了其中一个，其他的都需要多行，那么我们望让适合一行的那个 list 也使用多行的风格。

```dart
// BAD (because the second list is unnecessarily and confusingly different than the others):
List<FooBarBaz> myLongList1 = <FooBarBaz>[
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
];
List<Quux> myLongList2 = <Quux>[ Quux(1), Quux(2) ];
List<FooBarBaz> myLongList3 = <FooBarBaz>[
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
];

// GOOD (code is easy to scan):
List<FooBarBaz> myLongList1 = <FooBarBaz>[
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
];
List<Quux> myLongList2 = <Quux>[
  Quux(1),
  Quux(2),
];
List<FooBarBaz> myLongList3 = <FooBarBaz>[
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
  FooBarBaz(one: firstArgument, two: secondArgument, three: thirdArgument),
];
```

### 使用单引号的字符串

对于嵌套的字符串，或包含单引号的字符串（可选）使用双引号。对于所有其他字符串，使用单引号。

例子：

```dart
print('Hello ${name.split(" ")[0]}');
```

### 考虑对短的函数和方法使用 `=>`

但只有当所有的东西，包括函数声明，都适合在一行中使用时才使用 `=>`。

例子：

```dart
// BAD:
String capitalize(String s) =>
  '${s[0].toUpperCase()}${s.substring(1)}';

// GOOD:
String capitalize(String s) => '${s[0].toUpperCase()}${s.substring(1)}';

String capitalize(String s) {
  return '${s[0].toUpperCase()}${s.substring(1)}';
}
```

### 对仅返回 list 或 map 字面量的内联回调使用 `=>` 。

如果你的代码传递的内联闭包只是返回一个 list 或 map 字面量，或者只是调用另一个函数，那么如果实参与参数位于一行，可以不使用大括号和返回语句，而是使用 `=>` 形式。这样做的时候，如果是命名参数，收尾的 `]`、`}` 或 `)` 括号将与实参名称对齐，如果是 positional 实参，则与实参列表的 `(` 对齐。

比如：

```dart
  // GOOD, but slightly more verbose than necessary since it doesn't use =>
  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      onSelected: (String value) { print('Selected: $value'); },
      itemBuilder: (BuildContext context) {
        return <PopupMenuItem<String>>[
          PopupMenuItem<String>(
            value: 'Friends',
            child: MenuItemWithIcon(Icons.people, 'Friends', '5 new')
          ),
          PopupMenuItem<String>(
            value: 'Events',
            child: MenuItemWithIcon(Icons.event, 'Events', '12 upcoming')
          ),
        ];
      }
    );
  }

  // GOOD, does use =>, slightly briefer
  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      onSelected: (String value) { print('Selected: $value'); },
      itemBuilder: (BuildContext context) => <PopupMenuItem<String>>[
        PopupMenuItem<String>(
          value: 'Friends',
          child: MenuItemWithIcon(Icons.people, 'Friends', '5 new')
        ),
        PopupMenuItem<String>(
          value: 'Events',
          child: MenuItemWithIcon(Icons.event, 'Events', '12 upcoming')
        ),
      ]
    );
  }
```

重要的是，结尾的标点符号要与有开头标点符号的那一行的开头对齐，这样，你只要扫一下左边缘的缩进，就可以看清代码。

### 简短的 collection-if 和 collection-for 最好是单行的

如果代码适合单行，就不要分割。

比如：

```dart
// BAD
final List<String> args = <String>[
  'test',
  if (useFlutterTestFormatter) '-rjson'
  else '-rcompact',
  '-j1',
  if (!hasColor)
    '--no-color',
  for (final String opt in others)
    opt,
];

// GOOD
final List<String> args = <String>[
  'test',
  if (useFlutterTestFormatter) '-rjson' else '-rcompact',
  '-j1',
  if (!hasColor) '--no-color',
  for (final String opt in others) opt,
];
```

否则缩进 2 个空格

```dart
// GOOD
final List<String> args = <String>[
  'test',
  if (useFlutterTestFormatter)
    '-rjson.very.very.very.very.very.very.very.very.long'
  else
    '-rcompact.very.very.very.very.very.very.very.very.long',
  '-j1',
  if (!hasColor)
    '--no-color.very.very.very.very.very.very.very.very.long',
  for (final String opt in others)
    methodVeryVeryVeryVeryVeryVeryVeryVeryVeryLong(opt),
];
```

### 将 collection-if 或 collection-for 内的展开放在同一行中

在 collection-if 或 collection-for 里面的展开是用来插入一些元素的。将展开放在 `if`、`else` 或 `for` 的那一行，更容易阅读。

```dart
// BAD
final List<String> args = <String>[
  'test',
  if (condA) 
    ...<String>[
      'b',
      'c',
    ]
  else
    '-rcompact',
  for (final String opt in others)
    ...<String>[
      m1(opt),
      m2(opt),
    ],
];

// GOOD
final List<String> args = <String>[
  'test',
  if (condA) ...<String>[
    'b',
    'c',
  ] else
    '-rcompact',
  for (final String opt in others) ...<String>[
    m1(opt),
    m2(opt),
  ],
];
```

### 对长函数和方法使用大括号

当函数体将包含多行时使用块（带大括号）（与使用 ⇒ 相对；可以使用 ⇒ 的情况在前两个指南中进行了讨论）。

### 将 'if' 表达式与其语句分开

不要把 'if' 语句的声明部分和表达式放在同一行，即使它很短。（这样做会使那里有相关代码变得不明显）。这对于提前返回尤其重要）。

例子：

```dart
// BAD:
if (notReady) return;

// GOOD:
if (notReady)
  return;

// ALSO GOOD:
if (notReady) {
  return;
}
```

如果主体多于一行，或者如果有 `else` 子句，则将正文用大括号括起来：

```dart
// BAD:
if (foo)
  bar(
    'baz',
  );

// BAD:
if (foo)
  bar();
else
  baz();

// GOOD:
if (foo) {
  bar(
    'baz',
  );
}

// GOOD:
if (foo) {
  bar();
} else {
  baz();
}
```

我们允许单行 if 主体没有大括号，以避免将简短的条件句变成冗长。

超出一样的需要主体以明确其归属。

对于那些没有大括号但缩进超过一行的代码，你应该立即提出质疑：

```dart
// VERY BAD:
if (foo)
  bar();
  baz();

// GOOD:
if (foo)
  bar();
baz();

// ALSO GOOD:
if (foo) {
  bar();
  baz();
}
```

### 对齐表达式

在可能的情况下，不同行的子表达式应该被对齐，以使表达式的结构更容易理解。当在 `return` 语句中链式执行 `||` 或 `&&` 运算符时，可以考虑将运算符放在左侧而不是右侧。

```dart
// BAD:
if (foo.foo.foo + bar.bar.bar * baz - foo.foo.foo * 2 +
    bar.bar.bar * 2 * baz > foo.foo.foo) {
  // ...
}

// GOOD (notice how it makes it obvious that this code can be simplified):
if (foo.foo.foo     + bar.bar.bar     * baz -
    foo.foo.foo * 2 + bar.bar.bar * 2 * baz   > foo.foo.foo) {
  // ...
}
// After simplification, it fits on one line anyway:
if (bar.bar.bar * 3 * baz > foo.foo.foo * 2) {
  // ...
}
```

```dart
// BAD:
return foo.x == x &&
    foo.y == y &&
    foo.z == z;

// GOOD:
return foo.x == x &&
       foo.y == y &&
       foo.z == z;

// ALSO GOOD:
return foo.x == x
    && foo.y == y
    && foo.z == z;
```

### 优先选择 `+=`，而不是 `++`

一般来说，我们更优先使用 `+=` 而不是 `++`。

在一些语言/编译器中，由于性能的原因，后缀 `++` 是一种反面模式（anti-pattern），所以一般来说，避免它更省事些。

有些人会使用前缀 `++`，但这导致语句开头是标点符号，这在审美上是不可取的。

一般来说，将修改变量作为更大的表达式的一部分会导致操作顺序混淆，并将自增与另一个计算纠缠在一起。

使用 `++` 并不能明显看出底层变量实际上是被修改的，而 `+=` 则更明显（它是一个带有 `=` 符号的赋值）。

最后，当把增量改为 1 以外的数字时，`+=` 更方便。

## 惯例

### 对引擎潜在崩溃的预期

引擎不应该以不可控的方式崩溃。

在 unopt 模式下，引擎 C++ 代码应该具有检查违规的断言。

在 opt debug 模式下，`dart:ui` 代码应该具有检查违规的断言。 如果这些断言做不到不言自明的话，它们应该包含详细且有用的消息。

在 opt release 模式下，具体的行为可以是任意的，只要它是定义好的，并且对每个输入都没有漏洞。例如，可以在 Dart 中检查违规情况，对无效的数据抛出一个异常；但同样有效的是 C++ 代码在面对无效数据时提前返回。这个想法是为了在数据有效的情况下优化速度。

出于实际目的，我们目前不检查 out-of-memory 错误。

### 我们希望每个 Widget 都能实现的特性

既然 Flutter 框架已经成熟，我们希望每个新的 Widget 都能实现以下功能：

- 完全的辅助功能，因此在 Android 和 iOS 上，Widget 都能与本地辅助功能一起工作。
- 完全本地化，对我们所有的默认语言进行默认翻译。

- 完全支持从右到左和从左到右的布局，由 `Directionality` 环境驱动。
- 完全支持文本缩放，至少达到 3.0x。
- 为每个成员编写文档；参见上面的文档写作提示。
- 即使在使用大量的用户数据时也有良好的性能。
- 一个完整的生命周期约定，没有资源泄漏（如果它与通常的  Widget 不同，则在文档中说明）。
- 测试上述所有内容以及 Widget 本身的功能。

开发者在提交 PR 之前需要提供这些能力。

评审员的工作是在评审 PR 时检查这些能力是否满足了。

### 使用 Flutter 框架代码中的流

一般来说，我们避免在 Flutter 框架代码（和 `dart:ui`）中使用 `Stream` 类。一般情况下，流都没问题，我们鼓励使用它。但是，它们有一些缺点，因此我们更愿意将它们排除在框架之外。例如：

- 流有一个沉重的 API。例如，它们可以是同步的或异步的，广播的或单客户的，它们可以暂停和恢复。确定特定流的正确语义是非常重要的，因为它将以所有可能使用框架代码的方式使用它，并且正确地完全实现语义是非常重要的。
- 流没有「当前值」访问器，这使得它们难以在 `build` 方法中使用。
- 用于操作流的 API 并不简单（例如转换器）。

我们通常倾向于使用 `Listenable` 子类（例如 `ValueNotifier` 或 `ChangeNotifier`）。

有个特殊情况，通过回调从 `dart:ui` 暴露一个值，我们希望框架中的绑定注册单个监听器，然后提供一种机制将通知发送到多个监听器。有时这是一个相当复杂的过程（例如，`SchedulerBinding` 的存在几乎完全是为了为 `onBeginFrame`/`onDrawFrame` 执行此操作，而 `GesturesBinding` 的存在专门用于为指针事件执行此操作）。有时它更简单（例如，将更改传播到生命周期事件）。

## Packages

### 结构

按照正常的 Dart 惯例，一个包应有一条导入，重新导出其所有的API。

> 例如，[rendering.dart](https://github.com/flutter/flutter/blob/master/packages/flutter/lib/rendering.dart) 导出 lib/src/rendering/*.dart 的所有内容。

如果包使用从较低级导入的类型作为其公开 API 的一部分，它应该重新导出这些类型。

> 例如，[material.dart](https://github.com/flutter/flutter/blob/master/packages/flutter/lib/material.dart) 重新导出了 [widgets.dart](https://github.com/flutter/flutter/blob/master/packages/flutter/lib/widgets.dart) 的所有内容。同样地，后者也从[rendering.dart](https://github.com/flutter/flutter/blob/master/packages/flutter/lib/rendering.dart) 中[重新导出](https://github.com/flutter/flutter/blob/master/packages/flutter/lib/src/widgets/basic.dart)了许多类型，比如 `BoxConstraints`，它在其 API 中使用了这些类型。另一方面，它并没有重新导出如 `RenderProxyBox`，因为那不是 widgets API 的一部分。

除了那些以下划线为前缀的 API，Flutter 包不应该有「私有」API。Flutter 包中的每个文件都应该被导出。（「私有」文件仍然可以被导入，因此它们实际上仍然是公共 API；通过不明确地导出它们，我们自欺欺人地认为它们是私有 API，这可能会导致糟糕的设计。）

在 Flutter 包中开发新特性时，应该遵循这样的理念：

> 只公开特性必需的 API。

由于 dart 语言中的私有类是有文件约束的，这往往可能会导致文件大小过大。在 Flutter中，比 创建多个小文件但暴露特性不需要的中间类 更可取。

### 导入约定

将 `rendering.dart` 库导入更高级的库时，如果你正在创建新的 `RenderObject` 子类，请导入整个库。如果您只引用特定的 `RenderObject` 子类，则使用 `show` 关键字导入 `rendering.dart` 库，明确列出您要导入的类型。后一种方法通常可以很好地在文档记录你为什么要导入特定的库，并且普遍用在导入大型库以用于狭窄目的。

按照惯例，`dart:ui` 是使用  `import 'dart:ui' show … ;` 导入的。对于通用 API（这通常不是必需的，因为较低级会为你完成），以及 `import 'dart:ui' as ui show ... ;` 对于低级 API，在这两种情况下都会列出所有导入的标识符。有关我们以哪种方式导入哪些标识符的详细信息，请参见 `painting` 包中的 [basic_types.dart](https://github.com/flutter/flutter/blob/master/packages/flutter/lib/src/painting/basic_types.dart)。其他包通常不加修饰地导入，除非它们有自己的约定（例如，`paht` 导入为 `as path`）。

`dart:math` 库始终导入为 `as math`。

### 决定在哪里放置代码

一般来说，如果一个特性是完全独立的（不需要以低级形式集成到 Flutter 框架中）并且不是普遍诉求，我们会鼓励将该特性作为一个包提供。

我们对放入核心框架的内容非常保守，因为在那里任何东西都是高成本的。我们必须承诺在未来几年内支持它，我们必须对其进行文档编写、测试、创建示例，我们必须考虑每个人在使用该特性时可能有的不同期望，我们必须修复错误。如果有设计问题，我们可能很长时间都不会发现，但是一旦发现，我们就必须弄清楚如何在不影响人们的情况下修复它们，或者我们必须将所有现有的 Widget 迁移到新架构等。

基本上，代码是昂贵的。因此，在我们接受它之前，如果可能的话，我们想看看能否证明代码的价值。通过创建一个包，我们可以看看人们是否使用这个特性，喜欢这个特性的程度如何，它对框架是否有用等等，而不必承担代价。

我们有两种由 Flutter 团队维护的包，每种包都有自己的仓库：

1. [插件](https://github.com/flutter/plugins/)，提供对平台功能的访问，因此也包括 Java 或 Objective-C 代码。
2. [常规包](https://github.com/flutter/packages)，纯 Dart 编写。包也可以由 Flutter 团队以外的人编写和维护。这些包被发布到 [pub](https://pub.dartlang.org/)。

你也可以考虑做一个独立的包。

通常，一旦我们制作了一个包，我们就会发现它实际上足以解决问题，并且最终根本不需要将它引入到框架中。
