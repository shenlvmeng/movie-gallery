import Vue from 'vue';
import Multiselect from 'vue-multiselect';

import { loadFile, easeInOutCubic, animate, isMobile } from './helper/utils';
import { metaUrl } from './constants/';
import App from './App.vue';

// register globally
Vue.component('Multiselect', Multiselect);

document.getElementById("totop").addEventListener("click", () => {
  animate(document.documentElement, "scrollTop", 0, 1000, easeInOutCubic);
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
  let tag_keys,
      tag_list = {};

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

  new Vue({
    el: '#app',
    render: h => h(App, {
      props: {
        tagList: tag_list,
        tagKeys: tag_keys,
        res
      }
    })
  });

});
