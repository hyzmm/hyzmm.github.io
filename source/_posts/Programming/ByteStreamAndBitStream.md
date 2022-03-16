说起数据交换格式，JSON 是当今最常见的格式，但如果我们追求更高的编解码效率和更快的传输速度，例如低延时游戏场景，又或者是大数据量的 IM 消息，通常会选择使用二进制流。

在计算机科学中，流是一种特殊的数据结构，有序地封装了一组数据元素。对于一个对象：

1. 将对象输出到缓冲区的流称为输出流
2. 将缓冲区的数据输入到对象的流称为输入流
3. 以及同时支持输入和输出的双向流

例如 C++ 的 `iostream` 定义标准输入输出流，`fstream` 定义了文件流，`sstream` 定义字符流。

接下来先是讲解了字节流作为数据交换格式，接着是内存排列比字节流更小的比特流，最后说明 Google 的 [Protocol Buffers](https://developers.google.com/protocol-buffers) 的原理。

## 字节流

一个基于二进制缓冲区的数据交换格式，通常会采用单字节类型的数组保存数据，通过记录头部偏移按序写入缓冲区，实现内存字节流。一个输出字节流的结构体只有两个成员变量：

```rust
struct OutputByteStream {
    buf: Vec<u8>,
    head: usize,
}
```

假设我们要按序写入 8 位布尔值 `true`，32 位整型值 `6忆` ，8 位整型值 `127`。

![image-20220302032004362](%E6%AF%94%E7%89%B9%E6%B5%81.assets/image-20220302032004362.png)

初始头部指针位置为 0，其步骤的文字描述如下：

1. 将布尔值 `true` 转换 1，写入该字节，指针右移 1 个字节
2. 将 6 亿转换为 4 个字节，分别写入缓冲区，指针右移 4 个字节
3. 将 127 写入缓冲区，指针右移 1 个字节

此时，缓冲区内实际用了 6 个字节，指针位置就是缓冲区数据的长度。将对象写入字节缓冲区的方式就是直接把该对象的指针往后 n 个字节复制到缓冲区指针后对应的 n 个字节中。

```rust
fn write<T>(&mut self, data: &T) {
  let buf = &mut self.buf;
  let ptr = data as *const _ as *const u8;
  let num_bytes = mem::size_of::<T>();

  // 如果缓冲区剩余空间不够，则进行扩容
  if self.head + num_bytes > buf.len() {
    buf.resize(max(buf.len() * 2, self.head + num_bytes), 0);
  }

  for i in 0..num_bytes {
    self.buf[self.head + i] = unsafe { *ptr.offset(i as isize) };
  }
  self.head += num_bytes;
}
```

这个方法能够接受任意类型的数据传入，因为我们只需要知道它的内存地址，不关心它的数据类型。而读取内存和写入缓冲区的长度通过 `std::mem::size_of` 获取类型自身的内存大小，最后缓冲区的头部指针也往后移动数据大小的长度。下面是对应的读取数据接口。

```rust
fn read<T>(&mut self, num_bytes: usize) -> T {
  let bytes = &self.buf[self.head..self.head + num_bytes];
  self.head += num_bytes;
  unsafe {
    std::ptr::read(bytes.as_ptr() as *const _)
  }
}
```

`read` 方法能够从缓冲区中读取 `num_bytes` 个字节，并将它转换为泛型中指定的类型。和写入一样，读取后需要移动头部指针。

这两个读写方法是字节流中最重要的接口，因为其他写入或读取任意字节的数据会直接调用这两个接口，这也使得其他 API 非常简单。我并没有开放 `write` 接口，因为它能够写入任意数据，包括一个自定义结构体。如果在相同的外部环境下还好，但是如果是跨语言、跨平台或者是跨编译器，可能会因为它们之间内存布局上的区别，导致读写的字节无法对应。