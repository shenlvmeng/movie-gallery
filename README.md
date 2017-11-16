# MyPhotoGallery

> A project powered by Vue.js

个人网站[PhotoGallery](http://shenlvmeng.github.io/gallery/)源码。

## 设计

使用`meta.json`文件存储图片的相关信息，从0开始顺序命名展示的每张图片，通过命名和json文件和`content`数组关联。

在`meta.json`中，主要有下面几个字段：`name`, `author`, `description`保存整个图片展示的描述，`content`包含了所有的数据，其中每一项数据由下面四个字段组成：

- **date**: 图片的创建时间
- **info**: 图片描述
- **tags**: 最重要的部分。图片的标签，用来和其他图片建立关联并方便检索。
- **type**: 图片格式

## 环境

```bash
npm install
# 开发环境
gulp dev
# release
gulp
# 单独release
gulp [css | js | json]
```

p.s.: 站内图片和`meta.json`托管在图床[Qiniu](https://qiniu.com).
