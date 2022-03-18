---
title:  "字节流 & 比特流"
date:  2022-03-16 22:45:19
tag: 
    - 内存流
toc: true
categories:
  - 编程
cover: https://randomwordgenerator.com/img/picture-generator/52e7dd424e57ad14f1dc8460962e33791c3ad6e04e5074417c2f73d49148c4_640.jpg
---
## 介绍

常见的数据交换格式有 XML、JSON、GraphQL 和 Protocol 等，如今在前后端的数据交换中，通常会使用 JSON 格式。大部分情况下 JSON 都是很适用的数据格式，但有些特殊场景，希望追求更高的编解码效率和更快的传输速度，例如低延时游戏场景，又或者是大数据量的 IM 消息，更好的方案是使用内存布局更为紧凑的数据流。

在计算机科学中，流是一种特殊的数据结构，有序地封装了一组数据元素。对于一个 Object：

1. 将 Object 输出到缓冲区的流称为输出流
2. 将缓冲区的数据输入到 Object 的流称为输入流
3. 以及同时支持输入和输出的双向流

许多编程语言对流都有对应的实现，例如 C++ 的 `iostream` 定义标准输入输出流，`fstream` 定义了文件流，`sstream` 定义字符流。由于基础数据类型中最小的整型类型是 8 位整数，也就是一个字节，所以实现能用于网络传输的流，最方便的自然是字节流。

接下来先是讲述字节流的实现，接着是内存排列比字节流更小的比特流，最后说明 Google 的 [Protocol Buffers](https://developers.google.com/protocol-buffers) 的原理。

## 字节流

一个基于二进制缓冲区的数据交换格式，通常会采用单字节类型的数组保存数据，通过记录头部偏移按序写入缓冲区，实现内存字节流。一个输出字节流的结构体只有两个成员变量：

```rust
struct OutputByteStream {
    buf: Vec<u8>,
    head: usize,
}
```

假设我们要按序写入 8 位布尔值 `true`，32 位整型值 `6E8` ，8 位整型值 `127`。

![image-20220302032004362](%E6%AF%94%E7%89%B9%E6%B5%81.assets/image-20220302032004362.png)

初始头部指针位置为 0，其步骤的文字描述如下：

1. 将布尔值 `true` 转换成整型值 1，写入该字节，指针右移 1 个字节
2. 将 `6E8` 转换为 4 个字节，分别写入缓冲区，指针右移 4 个字节
3. 将 127 写入缓冲区，指针右移 1 个字节

此时，缓冲区实际使用 6 个字节，指针位置就是缓冲区数据的长度。将 Object 写入字节缓冲区的方式就是直接把该 Object 的指针指向的内存地址往后 n 个字节复制到缓冲区指针后对应的 n 个字节中。

### 读写任意数据

Rust 代码的实现如下：

```rust
fn write<T>(&mut self, data: &T) {
    let buf = &mut self.buf;
    let num_bytes = mem::size_of::<T>();

    if self.head + num_bytes > buf.len() {
        buf.resize(max(buf.len() * 2, self.head + num_bytes), 0);
    }

    unsafe {
        copy_nonoverlapping(
            data as *const _ as *const u8,
            self.buf[self.head..].as_mut_ptr(),
            num_bytes,
        );
    }
    self.head += num_bytes;
}
```

`write` 方法能够接受任意类型的数据传入，因为只需要知道它的内存地址，不关心它的数据类型。而读取内存长度和写入缓冲区的长度通过 `std::mem::size_of` 获取类型自身的内存大小，最后缓冲区的头部指针也往后移动数据大小的长度。下面是对应的读取数据接口。

```rust
fn read_bytes<T: Sized>(&mut self, num_bytes: usize) -> T {
    let bytes = &self.buf[self.head..self.head + num_bytes];
    self.head += num_bytes;
    unsafe {
        std::ptr::read(bytes.as_ptr() as *const _)
    }
}

```

`read_bytes` 方法能够从缓冲区中读取 `num_bytes` 个字节，并将它转换为泛型中指定的类型。和写入一样，读取后需要移动头部指针。

:::warning
`write` 接口没有设置成 **public**，因为它能够写入任意数据，包括一个自定义结构体。如果在相同的外部环境下，这没有问题，但是如果是跨语言、跨平台或者是跨编译器，可能会因为它们之间内存布局或字节序上的差别，导致读写的字节无法对应。
:::

### 封装数字类型的读写接口

`write` 和 `read_bytes` 是字节流中最重要的接口，因为其他写入或读取任意类型的数据会直接调用这两个接口，这也使得其他 API 非常简单。

**写入 API**

```rust
pub fn write_u8(&mut self, data: u8) { self.write(&data) }
pub fn write_i8(&mut self, data: i8) { self.write(&data) }

pub fn write_bool(&mut self, data: bool) { self.write(&data) }

pub fn write_u16(&mut self, data: u16) { self.write(&data) }
pub fn write_i16(&mut self, data: i16) { self.write(&data) }

// 省略 4 和 8 位整型的 API

pub fn write_f32(&mut self, data: f32) { self.write(&data) }
```

统一调用 `write` 写入内存中的数据到缓冲区。

**读取 API**

```rust
pub fn read_u8(&mut self) -> u8 { self.read_bytes(1) }
pub fn read_i8(&mut self) -> i8 { self.read_bytes(1) }

pub fn read_bool(&mut self) -> bool {
    let byte = self.read_u8();
    if byte == 0 { false } else { true }
}

pub fn read_u16(&mut self) -> u16 { self.read_bytes(2) }

pub fn read_i16(&mut self) -> i16 { self.read_bytes(2) }

// 省略 4 和 8 位整型的 API

pub fn read_f32(&mut self) -> f32 { self.read_bytes(4) }
```

统一调用 `read_bytes` 从缓冲区读取任意字节的数据。这里甚至不用去做类型转换，因为类型推导会把这段内存表示为我们希望的类型，例如同样是读取 2 个字节，`read_u8` 会表示为无符号整型值，`read_i8` 会表示为有符号整型值。

### 封装容器数据的读写接口

读写数组和字符串类型的数据不能够直接写入内存数据，至少不能仅仅写入内存地址，那会导致读取缓冲区时不知道应该读取多少个字节，所以写入容器类型的数据需要先写入长度。

例如，写入字符串的接口定义为：

```rust
pub fn write_string(&mut self, data: &String) {
    self.write_u32(data.len() as u32);
    let bytes = data.as_bytes();
    for byte in bytes {
        self.write_u8(*byte);
    }
}
```

先写入容器长度，再依次写入所有元素。读取的时候先读取容器长度，再依次读取所有元素：

```rust
pub fn read_string(&mut self) -> String {
  let len = self.read_u32() as usize;
  let mut bytes = vec![0; len];
  for i in 0..len {
      bytes[i] = self.read_u8();
  }
  unsafe { String::from_utf8_unchecked(bytes) }
}
```

### 使用示例

下面的例子展示了如何使用 `OutputByteStream` 和 `InputByteStream` 读写各种数据类型。

```rust
#[test]
fn write_read_all() {
    fn t(endianness: Endianness) {
        let mut o = OutputByteStream {
            endianness,
            ..Default::default()
        };
        o.write_bool(true);
        o.write_i8(127);
        o.write_i16(30000);
        o.write_i32(65536);
        o.write_i64(-5611626018427388000);
        o.write_f32(123.456);
        o.write_string(&"hello world!".to_string());

        let mut i = InputByteStream::new(o.buffer(), endianness);
        assert_eq!(true, i.read_bool());
        assert_eq!(127, i.read_i8());
        assert_eq!(30000, i.read_i16());
        assert_eq!(65536, i.read_i32());
        assert_eq!(-5611626018427388000, i.read_i64());
        assert_eq!(123.456, i.read_f32());
        assert_eq!("hello world!", i.read_string().as_str());
    }

    t(Endianness::LittleEndian);
    t(Endianness::BigEndian);
}
```

### 处理字节序

> 本节关于字节序的描述主要来源于[维基百科：字节序](https://zh.wikipedia.org/wiki/字节序)。

**字节顺序**，又称**端序**或**尾序**（**Endianness**），在[计算机科学](https://zh.wikipedia.org/wiki/计算机科学)领域中，指[内存](https://zh.wikipedia.org/wiki/存储器)中或在数字通信链路中，组成[多字节的字](https://zh.wikipedia.org/wiki/字_(计算机))的[字节](https://zh.wikipedia.org/wiki/字节)的排列顺序。

在网络应用中，字节序是一个必须被考虑的因素，因为不同机器类型可能采用不同标准的字节序，所以均按照网络标准转化。大部分[处理器](https://zh.wikipedia.org/wiki/处理器)以相同的顺序处理[位](https://zh.wikipedia.org/wiki/位元)（bit），因此单字节的存放方法和传输方式一般相同。

对于多字节数据，如整数（32 位机器中一般占 4 字节），在不同的处理器的存放方式主要有两种，以内存中 **0x0A0B0C0D** 的存放方式为例，分别有以下几种方式：

#### 大端序（big-endian）

将一个多位数的高位放在较小的地址处，低位放在较大的地址处（高位编址）。

![Big-Endian.svg](https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Big-Endian.svg/560px-Big-Endian.svg.png?bg=white&w=250)

采用大端序的平台有 Motorola 6800、Motorola 68000、PowerPC 970、System/370、SPARC（除V9外）。网络传输一般采用大端序，也被称之为网络字节序，或网络序。IP协议中定义大端序为网络字节序。

#### 小端序（little-endian）

将一个多位数的低位放在较小的地址处，高位放在较大的地址处（低位编址）。

![Little-Endian](https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Little-Endian.svg/560px-Little-Endian.svg.png?bg=white&w=250)

采用小端序的平台有 x86、MOS Technology 6502、Z80、VAX、PDP-11 等。

#### 字节序转换

只有读写多字节的字才需要处理字节序，所以 `u8`、`i8` 和 `bool` 的读写无需处理，其他 `u/i16`、`u/i32`、`u/i64` 和 `f32` 的读写需要处理字节序。UTF8 字符串没有大小端之分，也不需要处理字节序。

对字的每个字节进行翻转的示意图如下：

![Byte-Swap](./images/ByteStreamAndBitStream-ByteSwap.svg)

对连线的字节进行调换。Rust 有对整型值提供了 `swap_bytes`。如果希望自己实现，下面的实现代码高效地地完成这项工作：

```rust
pub fn swap_2_bytes(data: u16) -> u16 {
    data >> 8 | data << 8
}

pub fn swap_4_bytes(data: u32) -> u32 {
    data >> 24 & 0x0000_00FF |
        data >> 8 & 0x0000_FF00 |
        data << 8 & 0x00FF_0000 |
        data << 24 & 0xFF00_0000
}

pub fn swap_8_bytes(data: u64) -> u64 {
    data >> 56 & 0x0000_0000_0000_00FF |
        data >> 40 & 0x0000_0000_0000_FF00 |
        data >> 24 & 0x0000_0000_00FF_0000 |
        data >> 8 & 0x0000_0000_FF00_0000 |
        data << 8 & 0x0000_00FF_0000_0000 |
        data << 24 & 0x0000_FF00_0000_0000 |
        data << 40 & 0x00FF_0000_0000_0000 |
        data << 56 & 0xFF00_0000_0000_0000
}
```

为了在 `InputByteStream` 和 `OutputByteStream` 中简化代码，我们只处理 `u16`、`u32`、`u64` 的字节序，对于有符号整数的读写，直接调用无符号整数的读写函数，因为他们的字节数是一样的。

修改 `OutputByteStream` 中的 `write_u16`、`write_u32`、`write_u64` 和 `write_f32` 函数：

```rust
pub fn write_u16(&mut self, data: u16) {
  let mut data = data;
  if self.endianness != get_platform_endianness() {
      data = swap_2_bytes(data);
  }
  self.write(&data)
}
// `write_u32` 和 `write_u64` 基本和上述代码一致

pub fn write_f32(&mut self, data: f32) {
  unsafe { self.write_u32(transmute(data)) }
}
```

修改 `InputByteStream` 中的 `read_u16`、`read_u32`、`read_u64` 和 `read_f32` 函数：

```rust
pub fn read_u16(&mut self) -> u16 {
  let data = self.read_bytes(2);
  if self.endianness != get_platform_endianness() {
      swap_2_bytes(data)
  } else {
      data
  }
}
// `read_u32` 和 `read_u64` 基本和上述代码一致

pub fn read_f32(&mut self) -> f32 {
  unsafe { transmute(self.read_u32()) }
}
```

在读写整型值时，如果流的字节序与宿主机的字节序不一致，需要先进行字节序转换。但是浮点数有些不一样，由于 `swap_bytes` 使用位运算进行字节翻转，如果对浮点数直接进行位运算会得到错误的结果，所以 `write_f32` 是先把 `f32` 的 4 个字节表示为 `u32`，然后进行写入，`read_f32` 则是相反。

# 比特流
