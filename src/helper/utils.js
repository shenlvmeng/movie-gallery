const requestAnimationFrame = window.requestAnimationFrame ||
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
export function loadFile(url, cb) {
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

export function easeInOutCubic(t) { 
  return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
}

export function animate(obj, prop, end, time, ease) {
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

export function isMobile() {
  return navigator.userAgent.match(/Android|iPhone|iPod|Opera Mini|webOS|Windows Phone|IEMobile|BlackBerry/i);
} 

export function shuffle(nums) {
  let len = nums.length;
  while (len > 0) {
    let index = Math.floor(Math.random() * len);
    len--;
    [nums[index], nums[len]] = [nums[len], nums[index]];
  }
  return nums;
}

export function intersection(a, b) {
  return a.filter(num => !!~b.indexOf(num));
}
