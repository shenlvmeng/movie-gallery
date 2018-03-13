<template>
	<div id="display" @click="quit">
    <aside>×</aside>
    <figure>
      <img 
        :src="path" 
        title="查看原图" 
        @click="checkFullSize"
      >
    </figure>
    <div id="imginfo">
      <p>
        <span class="vertical-center img-intro">{{info}}</span>
      </p>
      <div id="imgtags" @click="chooseTag">
        <span v-for="tag in tags">{{tag}}</span>
      </div>
      <div id="imgrelated" class="clearfix" @click="choosePic">
        <div>相关的图片：</div>
        <img 
          v-for="relate in relates" 
          :src="relate.path" 
          :id="relate.id" 
          :title="relate.title"
        >
      </div>
    </div>
  </div>
</template>
<script>
/*
 * Info组件，展示图片的详细信息，包括介绍和相似图片。
 */
import { prefix, relatedCount } from '../../constants/';
import { shuffle, setUrlHash } from '../../helper/utils';

export default {
  name: 'Info',
  props: ["pid", "res", "tagList"],
  data() {
    return {
      id: this.pid
    }
  },
  methods: {
    chooseTag(e) {
      if (e.target.tagName.toLowerCase() === 'span') {
        this.$emit("revisetag", e.target.innerText);
      }
    },
    choosePic(e) {
      const id = +e.target.id;
      if (id >= 0){
        setUrlHash(`!${id}`);
        this.id = id;
      }
    },
    checkFullSize() {
      window.open(this.path);
    },
    quit(e) {
      if (e.target.id == "display" || e.target.id == "imginfo" || e.target.tagName.toLowerCase() == "aside") {
        this.$emit("revisetag");
      }
    }
  },
  computed: {
    path() {
      return `${prefix}${this.id}.${this.res.content[this.id].type}-compressed`;
    },
    info() {
      return this.res.content[this.id].info;
    },
    tags() {
      return this.res.content[this.id].tags;
    },
    /* 相关图片逻辑
     * 寻找图片最有特征的4个标签（标签对应图片少），寻找相同标签的其他图片
     * 考虑到标签数目不大，可以直接升序排序标签
     * 注意两点：1. 不一定能找到4张；2，找出来的图不能重复
     */
    relates() {
      // 升序排序并过滤掉单独的tag
      const t = this.tags.sort((t, s) => this.tagList[t].length - this.tagList[s].length).filter(t => this.tagList[t].length > 1);
      // 预存id，避免自身被包含进去
      let idSet = new Set([+this.id]);
      // 阈值系数，用来控制弹性范围
      const threshold = 2;

      let result = [];

      // 向result池中加入所有备选，直到到达阈值
      // 使用Set排除重复
      for (let i = 0, len = t.length; i < len; i++) {
        if (idSet.size >= threshold * relatedCount) {
          break;
        }
        this.tagList[t[i]].forEach(id => {
          if (!idSet.has(id)) {
            idSet.add(id);
            result.push({
              id,
              relatedTag: t[i]
            })
          }
        });
      }
      // 打乱后截取固定长度
      result = shuffle(result).slice(0, relatedCount);
      return result.map(val => {
        return {
          path: `${prefix}${val.id}.${this.res.content[val.id].type}-compress`,
          id: val.id,
          title: val.relatedTag
        }
      });
    }
  }
};
</script>