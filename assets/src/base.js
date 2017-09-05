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

document.getElementById("totop").addEventListener("click", () => {
  animate(document.body, "scrollTop", 0, 1000, easeInOutCubic);
})

loadFile("./dist/gallery_info.json", res => {
  // print meta data
  console.log(`${res.name}: ${res.description}`);
  console.log(`Author: ${res.author}`);
  // export tags information
  const length = res.content.length;
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
  const Wall = {
    template: '<div id="photos" @click="changeView($event)">\
        <figure v-for="item in items" :id="item.id">\
          <img :src="(!! lazylist && lazylist[item.id]) ?  stupid : item.path" :class="{blankimg: (!! lazylist && lazylist[item.id])}" :ref="stupidPrefix + item.id">\
          <aside><span>{{item.desc}}</span></aside>\
        </figure>\
      </div>',
    props: ["factors"],
    data() {
      return {
        lazylist: Array.apply(null, new Array(length)).map(function () {return true;}),
        stupid: "./assets/img/blank.jpg",
        stupidPrefix: "i_"
      }
    },
    mounted() {
      // first load
      this.lazyload();
      window.addEventListener("scroll", this.lazyload);
      window.addEventListener("resize", this.lazyload);
    },
    methods: {
      changeView(event) {
        this.$emit("toinfo", event.target.parentElement.id);
      },
			lazyload(arr) {
				// avoid meaningless loop
				if ([] === this.lazylist) {
					return;
				}
				let viewportTop = (window.innerHeight || document.documentElement.clientHeight) + (document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset),
				    self = this;
				// search for lazy images
				// DOM manipulation
				this.items.forEach(function (val) {
					//jump over loaded images
					if (self.lazylist[val.id] == false) {
						return;
					}
					// load lazy images
					var imgNode = self.$refs["i_" + val.id][0];
					// reduce DOM manipulation
					// just modify status data and let Vue do rendering matters
					if (imgNode.parentElement.offsetTop < viewportTop) {
						self.lazylist.splice(val.id, 1, false);
					}
				});
				if (-1 == this.lazylist.indexOf(true)) {
					this.lazylist = [];
				}
			}
		},
    computed: {
      items() {
        let tmparr = [],
            tmp = {},
            myarr = Array.apply(null, Array(length)).map(function (x, i) { return i; }),
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

        for (let i = 0, len = myarr.length; i < len; i++) {
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
      }
		},
    watch: {
      items(newItem) {
        // listen to factor changes
        if ([] === this.lazylist) {
          return;
        }
        // simplify lazy load for better experience
        newItem.forEach(val => {
          this.lazylist.splice(val.id, 1, false);
        });
      }
    }
  };

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
        this.$emit("revisetag", event.target.innerHTML);
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
      // temporarily store body scrollTop fo restoration
      lastScrollTop: null,
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
          this.index = -1;
        }
        // 防止再次触发
        e.stopPropagation();
      });
      window.addEventListener("click", () => {
        this.index = -1;
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
        const tag = e.target.innerText;
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
        if (val === 'picwall') {
          // 因为本身的渐变是0.4s...
          setTimeout(() => {
            requestAnimationFrame(() => {
              window.scrollTo(0, this.lastScrollTop || 0)
            })
          }, 400);
        } else {
          this.lastScrollTop = document.body.scrollTop;
        }
      }
    },
    components: {
      picwall: Wall,
      picinfo: Info
    }
  }).$mount("#app");

});
