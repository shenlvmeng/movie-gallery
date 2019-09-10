# movie-gallery

> 个人网站[MovieGallery](http://shenlvmeng.github.io/gallery/)源码

## 使用

查看个人的所有影视剧图片收藏

- 图片墙
  - 多标签过滤
  - 在左上下拉菜单中点击标签
  - 右上角输入框输入关键词/点击按钮
    - 大小写不敏感
    - 通过半角逗号隔开
    - 支持部分搜索
  - 点击图片详情页中的标签按钮
- 图片详情页
  - 点击图片墙的图片进入
  - 点击图片可查看大图
  - 右下角根据标签相似度展示相似图片
  - 相似图片鼠标悬停可以看到相似点（即重叠的标签名）
- 支持分享图片详情页和搜索结果页
  - 打开分享链接直接进入对应页面
- 单页面应用，懒加载，滚动加载
- 图片和配置信息放在图床，内容展示分离
- 瀑布流布局，宽度自适应

## meta.json

使用`meta.json`文件存储图片的相关信息，从0开始顺序命名展示的每张图片，通过命名和json文件和`content`数组关联。

在`meta.json`中，主要有下面几个字段：`name`, `author`, `description`保存整个图片展示的描述，`content`包含了所有的数据，其中每一项数据由下面四个字段组成：

- **date**: 图片的创建时间
- **info**: 图片描述
- **tags**: 最重要的部分。图片的标签，用来和其他图片建立关联并方便检索。
- **url**: 图片url
- **type**: 图片后缀（目前没有使用）

## 开发

```bash
npm install
# 开发环境
gulp
# release
gulp release
# 单独release
gulp [css | js | json]
```

~~p.s.: 站内图片和`meta.json`托管在图床[Qiniu](https://qiniu.com)。~~

p.p.s: 七牛测试域名已收回，图床目前选择[sm.ms](https://sm.ms)
