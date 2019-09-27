<template>
<div id="photos" @click="changeView">
  <aside class="loading" v-if="!isHidden">
    <div class="spinner">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
      <p>加载中...</p>
    </div>
  </aside>
  <Column
    v-for="(items, index) in itemsForColumns"
    :key="index"
    :items="items"
    :id="index"
    @load="handleLoad"
  ></Column>
</div>
</template>
<script>
/*
 * Wall组件，组织数据，处理scroll和resize事件
 */
import Column from '../../components/column/Column.vue';
import { intersection } from '../../helper/utils';
import { prefix, columnWidth } from '../../constants/';

export default {
  name: 'Wall',
  template: '',
  data() {
    return {
      columns: Math.floor(document.body.clientWidth / columnWidth),
      lastFlag: Math.floor(document.body.clientWidth / columnWidth) * 5 - 1,
      // 已加载的图片数目
      loadedCount: 0,
      // 控制loading遮罩
      isHidden: false,
    }
  },
  props: ["factors", "res", "tagList", "tagKeys", "currView"],
  methods: {
    changeView(e) {
      if (!+e.target.parentNode.id) {
        return;
      }
      this.$emit("toinfo", e.target.parentNode.id);
    },
    handleScroll(top) {
      if (this.items.length <= this.lastFlag) {
        return;
      }
      let delta = -1;
      for (let i = 0; i < this.columns; i++) {
        let col = document.getElementById(`wall-${i}`);
        // 20是为了留一些提前量
        if (col && col.offsetTop + col.clientHeight - 20 < top + (window.innerHeight || document.documentElement.clientHeight)) {
          delta = i;
        }
      }
      if (!!++delta) {
        this.lastFlag += delta;
        // 直到所有列下沿都不在视口内，
        // 同时，设置时延，保证DOM操作完成后再继续handleScroll
        setTimeout(() => {  this.handleScroll(top); }, 0);
      }
    },
    handleLoad() {
      this.loadedCount++;
    }
  },
  computed: {
    items() {
      let tmparr = [],
          tmp = {},
          myarr = Array.apply(null, Array(this.res.content.length)).map(function (x, i) { return i; }),
          partialArr,
          artialArr;

      this.factors.forEach(val => {
        // 部分搜索
        partialArr = this.tagKeys.filter(tag => {
          return tag.toLowerCase().includes(val.toLowerCase());
        }).reduce((acc, cur) => {
          return acc.concat(this.tagList[cur])
        }, []);
        myarr = intersection(partialArr, myarr);
        if ([] == myarr) {
          return;
        }
        // console.log(myarr);
      });

      // 倒序排列
      for (let i = myarr.length - 1; i >= 0; i--) {
        if (tmp[myarr[i]] == undefined) {
          tmp[myarr[i]] = 1;
          const currImgPath = this.res.content[myarr[i]].path;
          tmparr.push({
            id: myarr[i],
            desc: this.res.content[myarr[i]].info,
            date: this.res.content[myarr[i]].date,
            path: currImgPath.startsWith('https://') ? currImgPath : `${prefix}${currImgPath}`
          });
        }
      }
      return tmparr.sort((item1, item2) => item2.date - item1.date);
    },
    itemsForColumns() {
      let ret = Array.apply(null, Array(this.columns)).map(() => []);
      this.items.slice(0, this.lastFlag + 1).forEach((item, i) => {
        ret[i % this.columns].push(item);
      })
      // 每列先只加载5个
      return ret;
    }
  },
  watch: {
    items(newItems) {
      // 设置了筛选条件后，lastFlag和loadedCount需要重新开始累加
      this.lastFlag = Math.floor(document.body.clientWidth / columnWidth) * 5 - 1;
      this.isHidden = !newItems.length;
      // 防止有图片加载失败，设置遮罩超时时间为3s
      setTimeout(() => { this.isHidden = true }, 3000);
      this.loadedCount = 0;
    },
    loadedCount(newCount) {
      if (newCount >= Math.min(this.lastFlag + 1, this.items.length)) {
        // console.log("全部加载完成");
        this.isHidden = true;
      } else {
        // console.log("Loading...");
      }
    },
    isHidden(newStatus) {
      if (!newStatus) {
        document.body.scrollTop = 0;
        document.body.className = "noscroll";
      } else if (this.currView === 'picwall') {
        document.body.className = "";
      }
    }
  },
  mounted() {
    // 防止有图片加载失败，设置遮罩超时时间为3s
    setTimeout(() => { this.isHidden = true }, 3000);
    window.addEventListener("scroll", e => {
      // 回到开始按键逻辑
      let top = document.body.scrollTop || document.documentElement.scrollTop,
          totop = document.getElementById("totop");
      if (top) {
        totop.className = "";
      } else{
        totop.className = "hidden";
      }
      // 加载新内容逻辑
      this.handleScroll(top);
    });
    window.addEventListener("resize", e => {
      this.columns = Math.floor(document.body.clientWidth / columnWidth);
      // 已经展示过的图片就不要隐藏了
      this.lastFlag = Math.max(this.columns * 5 - 1, this.lastFlag);
    });
  },
  components: {
    Column
  }
};
</script>
