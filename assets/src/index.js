let res,
    tag_list = {};

// 图床前缀
const prefix = "http://ow5o14n5d.bkt.clouddn.com/";
// 相关图片展示个数
const relatedCount = 4;
// meta.json地址
const metaUrl = `http://ow5o14n5d.bkt.clouddn.com/meta.json`;

window.requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      let currTime = +new Date(),
          timeToCall = Math.max(0, 16 - (currTime - lastTime)),
          id = window.setTimeout(function () {
              callback(currTime + timeToCall);
          }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
  };

// async load
const loadFile = (url, cb) => {
  if (typeof fetch === "function") {
    fetch(url)
    .then(res => res.json())
    .then(json => cb(json))
    return;
  }

  let req = new XMLHttpRequest();
  req.onreadystatechange = () => {
    if (req.readyState == 4) {
      if (req.status == 200) {
        let res;
        try {
          res = JSON.parse(req.responseText);
        } catch(e) {
          res = {}
          console.warn(e);
        }
        cb(res);
      } else {
        console.warn("Error", req.statusText);
      }
    }
  };
  req.open("GET", url, true);
  req.send();
}

const easeInOutCubic = t => (t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1);

const animate = (obj, prop, end, time, ease) => {
  if (!obj || !obj[prop] || time < 100) {
    return;
  }
  let start = obj[prop],
      k = end - start,
      timer = null,
      tick = timestamp => {
        if (timer === null) {
          timer = timestamp;
        }
        let progress = timestamp - timer;
        obj[prop] = start + ease(progress / time) * k;
        if (progress < time) {
          requestAnimationFrame(tick);
        }
      };

  requestAnimationFrame(tick);
}

const isMobile = () => navigator.userAgent.match(/Android|iPhone|iPod|Opera Mini|webOS|Windows Phone|IEMobile|BlackBerry/i);

const shuffle = nums => {
  let len = nums.length;
  while (len > 0) {
    let index = Math.floor(Math.random() * len);
    len--;
    [nums[index], nums[len]] = [nums[len], nums[index]];
  }
  return nums;
}

const intersection = (a, b) => a.filter(num => !!~b.indexOf(num));

document.getElementById("totop").addEventListener("click", () => {
  animate(document.body, "scrollTop", 0, 1000, easeInOutCubic);
});

if (isMobile()) {
  document.getElementById("close").parentNode.className = "";
  document.getElementById("close").addEventListener("click", e => {
    e.target.parentNode.className = "hidden";
  })
}

loadFile(metaUrl, res => {
  // 打印meta data
  console.log(`${res.name}: ${res.description}`);
  console.log(`Author: ${res.author}`);

  const length = res.content.length;
  const columnWidth = 250 + 16;
  let tag_keys;
  for (let i = 0; i < length; i++) {
    // 从date字段读取
    let year = Math.floor(res.content[i].date / 10000);
    if (year <= 2012) {
      year = "~2012";
    }
    year += "";
    if (!tag_list[year]) {
      tag_list[year] = [i];
    } else {
      tag_list[year].push(i);
    }
    // 从tags字段读取
    res.content[i].tags.forEach(function (val) {
      if (!tag_list[val]) {
        tag_list[val] = [i];
      } else {
        tag_list[val].push(i);
      }
    });
  }

  tag_keys = Object.keys(tag_list);

  /*
   * Column组件，简单地渲染一个列表
   */
  const Column = {
    template: '<div class="wall-column" :id="`wall-${id}`">\
      <figure v-for="item in items" :id="item.id">\
        <img :src="item.path" @load="onload">\
        <aside><span>{{item.desc}}</span></aside>\
      </figure>\
    </div>',
    props: ["items", "id"],
    methods: {
      onload() {
        this.$emit('load');
      }
    }
  }

  /*
   * Wall组件，组织数据，处理scroll和resize事件
   */
  const Wall = {
    template: '<div id="photos" @click="changeView($event)">\
        <aside class="loading" v-if="!isHidden">\
          <div class="spinner">\
            <div class="bounce1"></div>\
            <div class="bounce2"></div>\
            <div class="bounce3"></div>\
            <p>加载中...</p>\
          </div>\
        </aside>\
        <Column v-for="(items, index) in itemsForColumns" :items="items" :id="index" @load="handleLoad">\
      </div>',
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
    props: ["factors"],
    methods: {
      changeView(event) {
        if (!+event.target.parentNode.id) {
          return;
        }
        this.$emit("toinfo", event.target.parentNode.id);
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
            myarr = Array.apply(null, Array(length)).map(function (x, i) { return i; }),
            partialArr,
            artialArr;

        this.factors.forEach(val => {
          // 部分搜索
          partialArr = tag_keys.filter(function(tag) {
            return tag.toLowerCase().includes(val.toLowerCase());
          }).reduce(function (acc, cur) {
            return acc.concat(tag_list[cur])
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
            tmparr.push({
              id: myarr[i],
              desc: res.content[myarr[i]].info,
              path: `${prefix}${myarr[i]}.${res.content[myarr[i]].type}-compress`
            });
          }
        }
        return tmparr;
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
        } else {
          document.body.className = "";
        }
      }
    },
    mounted() {
      window.addEventListener("scroll", e => {
        // 回到开始按键逻辑
        let top = document.body.scrollTop,
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
  }

  /*
   * Info组件，展示图片的详细信息，包括介绍和相似图片。
   */
  const Info = {
    template: '<div id="display">\
      <aside @click="quit">×</aside>\
      <figure><img :src="path"></figure>\
      <div id="imginfo">\
        <p><span class="vertical-center img-intro">{{info}}</span></p>\
        <div id="imgtags" @click="chooseTag($event)">\
          <span v-for="tag in tags">{{tag}}</span>\
        </div>\
        <div id="imgrelated" class="clearfix" @click="choosePic($event)">\
          <div>相关的图片：</div>\
          <img v-for="relate in relates" :src="relate.path" :id="relate.id" :title="relate.title">\
        </div>\
      </div>\
    </div>',
    props: ["pid"],
    data() {
      return {
        id: this.pid
      }
    },
    methods: {
      chooseTag(event) {
        this.$emit("revisetag", event.target.innerText);
      },
      choosePic(event) {
        const res = +event.target.id;
        if (res >= 0){
          this.id = res;
        }
      },
      quit() {
        this.$emit("revisetag");
      }
    },
    computed: {
      path() {
        return `${prefix}${this.id}.${res.content[this.id].type}-compress`;
      },
      info() {
        return res.content[this.id].info;
      },
      tags() {
        return res.content[this.id].tags;
      },
      /* 相关图片逻辑
       * 寻找图片最有特征的4个标签（标签对应图片少），寻找相同标签的其他图片
       * 考虑到标签数目不大，可以直接升序排序标签
       * 注意两点：1. 不一定能找到4张；2，找出来的图不能重复
       */
      relates() {
        // 升序排序并过滤掉单独的tag
        const t = this.tags.sort((t, s) => tag_list[t].length - tag_list[s].length).filter(t => tag_list[t].length > 1);
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
          tag_list[t[i]].forEach(id => {
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
            path: `${prefix}${val.id}.${res.content[val.id].type}-compress`,
            id: val.id,
            title: val.relatedTag
          }
        });
      }
    }
  };


  const	vm = new Vue({
    data: {
      filter: "",
      pid: 0,
      currView: "picwall",
      // 当前活动的tab索引
      index: -1
    },
    mounted() {
      // 减少DOM修改
      document.getElementById("navbar").addEventListener("click", e => {
        let className = e.target.className,
            id = +e.target.id;
        if (className === "list-unit") {
          this.addTag(e);
        } else if (!!~className.indexOf("list-item") && this.index !== id) {
          this.modifyIndex(id);
        } else {
          this.modifyIndex(-1);
        }
        // 防止再次触发
        e.stopPropagation();
      });
      window.addEventListener("click", () => {
        this.modifyIndex(-1);
      });
    },
    methods: {
      addPreface() {
        if (this.filter == "") {
          this.filter = "preface";
        }
        if (this.factors.indexOf("preface") == -1) {
          this.filter += ",preface";
        }
      },
      addShot() {
        if (this.filter == "") {
          this.filter = "screenshot";
        }
        if (this.factors.indexOf("screenshot") == -1) {
          this.filter += ",screenshot";
        }
      },
      addTag(e) {
        const tag = e.target.dataset.tag;
        if (this.filter == "") {
          this.filter = tag;
        }
        if (this.factors.indexOf(tag) == -1) {
          this.filter += ("," + tag);
        }
      },
      toInfo(id) {
        //console.log(id);
        if (id) {
          this.pid = id;
        }
        this.currView = "picinfo";
      },
      reviseTag(tag) {
        if (tag) {
          this.filter = tag;
        } else {
          this.currView = "picwall";
        }
      },
      modifyIndex(newId) {
        this.index = newId;
      }
    },
    computed: {
      factors() {
        return this.filter.split(",", 10).filter(element => element != "");
      }
    },
    watch: {
      filter() {
        this.currView = "picwall";
        this.index = -1;
      },
      currView(val) {
        if (val === 'picinfo') {
          document.body.className = "noscroll";
        } else {
          document.body.className = "";
        }
      }
    },
    components: {
      picwall: Wall,
      picinfo: Info
    }
  }).$mount("#app");

});
