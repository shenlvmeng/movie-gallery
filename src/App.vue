<template>
  <div>
  	<transition name="picinfo">
      <picinfo 
        v-if="currView == 'picinfo'"
        :pid="pid"
        :res="res"
        :tagList="tagList"
        @revisetag="reviseTag"
      ></picinfo>
    </transition>
    <section id="navbar">
      <nav>
        <a href="#" id="brand">
          <img src="../favicon.png">
          <span class="slogan">PhotoGallery</span>
        </a>
        <ul class="nav-categories">
          <li
            class="list-item"
            :class="{show: this.index === 0}"
            id="0"
          >按类型 ▾
            <ul>
              <li class="list-unit" data-tag="剧情">剧情片</li>
              <li class="list-unit" data-tag="悬疑">悬疑片</li>
              <li class="list-unit" data-tag="犯罪">犯罪片</li>
              <li class="list-unit" data-tag="科幻">科幻片</li>
              <li class="list-unit" data-tag="爱情">爱情片</li>
              <li class="list-unit" data-tag="恐怖">恐怖片</li>
              <li class="list-unit" data-tag="动作">动作片</li>
              <li class="list-unit" data-tag="喜剧">喜剧片</li>

            </ul>
          </li>
          <li
            class="list-item"
            :class="{show: this.index === 1}"
            id="1"
          >按地区 ▾
            <ul>
              <li class="list-unit" data-tag="欧美">欧美地区</li>
              <li class="list-unit" data-tag="亚洲">亚洲地区</li>
              <li class="list-unit" data-tag="美国">好莱坞</li>
              <li class="list-unit" data-tag="法国">法式浪漫</li>
              <li class="list-unit" data-tag="英国">英式幽默</li>
              <li class="list-unit" data-tag="国产">大陆</li>
              <li class="list-unit" data-tag="港台">港台地区</li>
              <li class="list-unit" data-tag="日本">日本</li>
              <li class="list-unit" data-tag="韩国">韩国</li>
              <li class="list-unit" data-tag="其他">其他</li>
            </ul>
          </li>
          <li
            class="list-item"
            :class="{show: this.index === 2}"
            id="2"
          >按年代 ▾
            <ul>
              <li class="list-unit" data-tag="10s">2010s</li>
              <li class="list-unit" data-tag="00s">2000s</li>
              <li class="list-unit" data-tag="90s">1990s</li>
              <li class="list-unit" data-tag="80s">1980s</li>
              <li class="list-unit" data-tag="~70s">~1970s</li>
            </ul>
          </li>
          <li
            class="list-item"
            :class="{show: this.index === 3}"
            id="3"
          >按评分 ▾
            <ul>
              <li class="list-unit" data-tag="9+">9+</li>
              <li class="list-unit" data-tag="8+">8+</li>
              <li class="list-unit" data-tag="7+">7+</li>
              <li class="list-unit" data-tag="6+">6+</li>
              <li class="list-unit" data-tag="~5">~5</li>
            </ul>
          </li>
          <li
            class="list-item"
            :class="{show: this.index === 4}"
            id="4"
          >按观影时间 ▾
            <ul>
              <li class="list-unit" data-tag="2017">2017</li>
              <li class="list-unit" data-tag="2016">2016</li>
              <li class="list-unit" data-tag="2015">2015</li>
              <li class="list-unit" data-tag="2014">2014</li>
              <li class="list-unit" data-tag="2013">2013</li>
              <li class="list-unit" data-tag="~2012">~2012</li>
            </ul>
          </li>
        </ul>
        <div class="nav-padding"></div>
        <div class="nav-search">
          <input type="text" name="tags" placeholder="按标签搜索，如：screenshot,妹子" v-model="filter">
          <button @click="addPreface">搜海报</button>
          <button @click="addShot">搜片断</button>
        </div>
      </nav>
    </section>
    <section id="body">
      <picwall 
        :factors="factors" 
        :tagKeys="tagKeys"
        :tagList="tagList"
        :res="res"
        @toinfo="toInfo"
      ></picwall>
    </section>
  </div>
</template>
<script>
import Wall from './containers/wall/Wall.vue';
import Info from './containers/info/Info.vue';

export default {
  name: 'App',
  props: ["res", "tagList", "tagKeys"],
  data(){
    return {
      filter: "",
      pid: 0,
      currView: "picwall",
      // 当前活动的tab索引
      index: -1
    }
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
}
</script>