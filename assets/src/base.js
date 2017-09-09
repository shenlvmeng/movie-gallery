let res,
    tag_list = {};

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

const isMobile = () => {
  return navigator.userAgent.match(/Android|iPhone|iPod|Opera Mini|webOS|Windows Phone|IEMobile|BlackBerry/i);
}

document.getElementById("totop").addEventListener("click", () => {
  animate(document.body, "scrollTop", 0, 1000, easeInOutCubic);
});

if (isMobile()) {
  document.getElementById("close").parentNode.className = "";
  document.getElementById("close").addEventListener("click", e => {
    e.target.parentNode.className = "hidden";
  })
}

loadFile("./dist/gallery_info.json", res => {
  // print meta data
  console.log(`${res.name}: ${res.description}`);
  console.log(`Author: ${res.author}`);
  // export tags information
  const length = res.content.length;
  const columnWidth = 250 + 16;
  let tag_keys;
  for (let i = 0; i < length; i++) {
    // read from res.content[i].date
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
    // read from res.content[i].tags
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
          // add partial search
          partialArr = tag_keys.filter(function(tag) {
            return tag.search(val) != -1;
          }).reduce(function (acc, cur) {
            return acc.concat(tag_list[cur])
          }, []);
          myarr = _.intersection(partialArr, myarr);
          if ([] == myarr) {
            return;
          }
          //console.log(myarr);
        });

        // 倒序排列
        for (let i = myarr.length - 1; i >= 0; i--) {
          if (tmp[myarr[i]] == undefined) {
            tmp[myarr[i]] = 1;
            tmparr.push({
              id: myarr[i],
              desc: res.content[myarr[i]].info,
              path: `./assets/img/${myarr[i]}.${res.content[myarr[i]].type}`
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
        this.loadedCount = 0;
      },
      loadedCount() {
        if (this.loadedCount >= Math.min(this.lastFlag + 1, this.items.length)) {
          console.log("全部加载完成");
          this.isHidden = true;
        } else {
          // console.log("Loading...");
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
          <div>相似的图片：</div>\
          <img v-for="relate in relates" :src="relate.path" :id="relate.id">\
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
        const res = parseInt(event.target.id);
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
        return `./assets/img/${this.id}.${res.content[this.id].type}`;
      },
      info() {
        return res.content[this.id].info;
      },
      tags() {
        return res.content[this.id].tags;
      },
      relates() {
        const t = this.tags;
        let result = [parseInt(this.id)];

        for (var i = 0; i < 4; i++) {
          // tag list from a random tag
          let n   = tag_list[t[_.random(t.length - 1)]],
              ran = _.random(n.length - 1),
              count = 0;
					// choose a random appropriate id
          while (result.indexOf(n[ran]) != -1) {
            n   = tag_list[t[_.random(t.length - 1)]];
            ran = _.random(n.length - 1);
            count++;
            // in case of infinite loop
            if (count > 20) {
              result.shift();
              return result.map(val => `./assets/img/${val}.${res.content[val].type}`);
            }
          }
          result.push(n[ran]);
        }
        result.shift();
        return result.map(val => {
          return {
            path: `./assets/img/${val}.${res.content[val].type}`,
            id: val
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
      // current index of tab
      index: -1
    },
    mounted() {
      // to reduce frequent DOM manipulation
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
