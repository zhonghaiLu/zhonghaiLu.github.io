var CONFIG = {"hostname":"example.com","root":"/","statics":"/","favicon":{"normal":"images/favicon.ico","hidden":"images/failure.ico"},"js":{"valine":"js/valine.js","chart":"npm/frappe-charts@1.5.0/dist/frappe-charts.min.iife.min.js","copy_tex":"npm/katex@0/dist/contrib/copy-tex.min.js","mediumzoom":"npm/medium-zoom@1.0.5/dist/medium-zoom.min.js"},"css":{"valine":"css/comment.css","katex":"npm/katex@0/dist/katex.min.css","mermaid":"css/mermaid.css"},"search":null,"valine":{"appId":null,"appKey":null,"placeholder":"ヽ(○´∀`)ﾉ♪","avatar":"mp","pageSize":10,"lang":"en","visitor":true,"recordIP":true,"serverURLs":null,"requiredFields":["nick","mail"],"enableQQ":true,"masters":["hash of master@email.com","hash of master2@email.com"],"masterTag":"主人","tips":"昵称框中填入QQ号，将自动获取QQ昵称&邮箱&头像；其他邮箱由Gavatar提供头像。"},"quicklink":{"timeout":3000,"priority":true},"versoin":"0.1.1","audio":["https://music.163.com/#/my/m/music/playlist?id=2031842656"]};const getRndInteger = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getDocHeight = function () {
  return $('main > .inner').offsetHeight;
}

const getScript = function(url, callback, condition) {
  if (condition) {
    callback();
  } else {
    var script = document.createElement('script');
    script.onload = script.onreadystatechange = function(_, isAbort) {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
        script.onload = script.onreadystatechange = null;
        script = undefined;
        if (!isAbort && callback) setTimeout(callback, 0);
      }
    };
    script.src = url;
    document.head.appendChild(script);
  }
}

const assetUrl = function(asset, type) {
  return (CONFIG[asset][type].indexOf('npm')>-1? "//cdn.jsdelivr.net/":statics)+CONFIG[asset][type];
}

const vendorJs = function(type, callback, condition) {
  if(LOCAL[type]) {
    getScript(assetUrl("js", type), callback || function(){
      window[type] = true;
    }, condition || window[type]);
  }
}

const vendorCss = function(type, condition) {
  if(window['css'+type])
    return;

  if(LOCAL[type]) {
    var linkTag = document.createElement('link');
    linkTag.attr('rel','stylesheet');
    linkTag.href = assetUrl("css", type);

    document.head.appendChild(linkTag);

    window['css'+type] = true;
  }
}


const pjaxScript = function(element) {
  var code = element.text || element.textContent || element.innerHTML || '';
  var parent = element.parentNode;
  parent.removeChild(element);
  var script = document.createElement('script');
  if (element.id) {
    script.id = element.id;
  }
  if (element.className) {
    script.className = element.className;
  }
  if (element.type) {
    script.type = element.type;
  }
  if (element.src) {
    script.src = element.src;
    // Force synchronous loading of peripheral JS.
    script.async = false;
  }
  if (element.dataset.pjax !== undefined) {
    script.dataset.pjax = '';
  }
  if (code !== '') {
    script.appendChild(document.createTextNode(code));
  }
  parent.appendChild(script);
}

const pageScroll = function (target, height, complete) {
  Velocity(target, "scroll", {
    duration: 500,
    easing: "easeOutQuart",
    offset: height || -siteNavHeight,
    complete: complete || function() {}
  });
}
const $ = function(selector, element) {
  element = element || document;
  if(selector.indexOf('#') === 0) {
    return element.getElementById(selector.replace('#', ''))
  }
  return element.querySelector(selector)
};

$.all = function(selector, element) {
  element = element || document;
  return element.querySelectorAll(selector)
};

$.each = function(selector, callback, element) {
  return $.all(selector, element).forEach(callback)
}


Object.assign(HTMLElement.prototype, {
  wrap: function (wrapper) {
    this.parentNode.insertBefore(wrapper, this);
    this.parentNode.removeChild(this);
    wrapper.appendChild(this);
  },
  height: function(h) {
    if(h) {
      this.style.height = typeof h == 'number' ? h + 'rem' : h;
    }
    return this.getBoundingClientRect().height
  },
  width: function(w) {
    if(w) {
      this.style.width = typeof w == 'number' ? w + 'rem' : w;
    }
    return this.getBoundingClientRect().width
  },
  top: function() {
    return this.getBoundingClientRect().top
  },
  left:function() {
    return this.getBoundingClientRect().left
  },
  attr: function(type, value) {
    if(value === null) {
      return this.removeAttribute(type)
    }

    if(value) {
      return this.setAttribute(type, value)
    } else {
      return this.getAttribute(type)
    }
  },
  insertAfter: function(element) {
    var parent = this.parentNode;
    if(parent.lastChild == this){
        parent.appendChild(element);
    }else{
        parent.insertBefore(element, this.nextSibling);
    }
  },
  display: function(d) {
    this.style.display = d;
  },
  child: function(selector) {
    return $(selector, this)
  },
  find: function(selector) {
    return $.all(selector, this)
  },
  _class: function(type, className, display) {
    var classNames = className.indexOf(' ') ?  className.split(' ') : [className];
    var that = this;
    classNames.forEach(function(name) {
      if(type == 'toggle') {
        that.classList.toggle(name, display)
      } else {
        that.classList[type](name)
      }
    })
  },
  addClass: function(className) {
    this._class('add', className);
    return this;
  },
  removeClass: function(className) {
    this._class('remove', className);
    return this;
  },
  toggleClass: function(className, display) {
    this._class('toggle', className, display);
    return this;
  },
  hasClass: function(className) {
    return this.classList.contains(className)
  }
});

const store = {
  get: function(item) {
    return localStorage.getItem(item);
  },
  set: function(item, str) {
    localStorage.setItem(item, str);
    return str;
  },
  del: function(item) {
    localStorage.removeItem(item);
  }
}

const mediaPlayer = function(config) {
  var t = this,
  option = {
    type: 'audio',
    mode: 'random',
    btns: ['play-pause', 'music'],
    events: {
      "play-pause": function(event) {
        if(t.media.source.paused) {
          t.media.play()
        } else {
          t.media.pause()
        }
      },
      "music": function(event) {
        t.media.list.toggleClass('on');
        t.media.scroll();
      }
    }
  };

  var
    utils = {
      random: function(len) {
        return Math.floor((Math.random()*len))
      },
      parse: function(link) {
        var result = [];
        [
          ['music.163.com.*song.*id=(\\d+)', 'netease', 'song'],
          ['music.163.com.*album.*id=(\\d+)', 'netease', 'album'],
          ['music.163.com.*artist.*id=(\\d+)', 'netease', 'artist'],
          ['music.163.com.*playlist.*id=(\\d+)', 'netease', 'playlist'],
          ['music.163.com.*discover/toplist.*id=(\\d+)', 'netease', 'playlist'],
          ['y.qq.com.*song/(\\w+).html', 'tencent', 'song'],
          ['y.qq.com.*album/(\\w+).html', 'tencent', 'album'],
          ['y.qq.com.*singer/(\\w+).html', 'tencent', 'artist'],
          ['y.qq.com.*playsquare/(\\w+).html', 'tencent', 'playlist'],
          ['y.qq.com.*playlist/(\\w+).html', 'tencent', 'playlist'],
          ['xiami.com.*song/(\\w+)', 'xiami', 'song'],
          ['xiami.com.*album/(\\w+)', 'xiami', 'album'],
          ['xiami.com.*artist/(\\w+)', 'xiami', 'artist'],
          ['xiami.com.*collect/(\\w+)', 'xiami', 'playlist'],
        ].forEach(function(rule) {
          var patt = new RegExp(rule[0])
          var res = patt.exec(link)
          if (res !== null) {
            result = [rule[1], rule[2], res[1]]
          }
        })
        return result
      },
      lrc: function(lrc_s) {
        if (lrc_s) {
            lrc_s = lrc_s.replace(/([^\]^\n])\[/g, function(match, p1){return p1 + '\n['});
            const lyric = lrc_s.split('\n');
            var lrc = [];
            const lyricLen = lyric.length;
            for (var i = 0; i < lyricLen; i++) {
                // match lrc time
                const lrcTimes = lyric[i].match(/\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g);
                // match lrc text
                const lrcText = lyric[i]
                    .replace(/.*\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g, '')
                    .replace(/<(\d{2}):(\d{2})(\.(\d{2,3}))?>/g, '')
                    .replace(/^\s+|\s+$/g, '');

                if (lrcTimes) {
                    // handle multiple time tag
                    const timeLen = lrcTimes.length;
                    for (var j = 0; j < timeLen; j++) {
                        const oneTime = /\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/.exec(lrcTimes[j]);
                        const min2sec = oneTime[1] * 60;
                        const sec2sec = parseInt(oneTime[2]);
                        const msec2sec = oneTime[4] ? parseInt(oneTime[4]) / ((oneTime[4] + '').length === 2 ? 100 : 1000) : 0;
                        const lrcTime = min2sec + sec2sec + msec2sec;
                        lrc.push([lrcTime, lrcText]);
                    }
                }
            }
            // sort by time
            lrc = lrc.filter(function(item){return item[1]});
            lrc.sort(function(a, b){return a[0] - b[0]});
            return lrc;
        } else {
            return [];
        }
      }
    }

  t.media = {
    pointer: -1,
    source: null,
    buttons: {},
    playlist: [],
    lrc: {},
    fetch: function(source, callback) {
      var that = this
      var list = []

      return new Promise(function(resolve, reject){
        source.forEach(function(raw) {
          var meta = utils.parse(raw)
          var skey = JSON.stringify(meta)
          var playlist = store.get(skey)
          if(playlist) {
            list.push.apply(list, JSON.parse(playlist));
            resolve(list);
          } else {
            fetch('https://api.i-meto.com/meting/api?server='+meta[0]+'&type='+meta[1]+'&id='+meta[2]+'&r='+ Math.random())
              .then(function(response) {
                return response.json()
              }).then(function(json) {
                store.set(skey, JSON.stringify(json))
                list.push.apply(list, json);
                resolve(list);
              }).catch(function(ex) {})
          }
        })
      })
    },
    load: function(newList) {
      if(newList) {
        if(this.options.rawList !== newList) {
          var that = this
          this.options.rawList = newList;

          this.fetch(newList).then(function(list) {
            that.playlist = list;
            create.list();
            that.setMode(that.options.mode);
          });
        }
      }
    },
    // 根据模式切换当前曲目pointer
    setMode: function(mode) {
      var total = this.playlist.length;

      if(!total)
        return;

      var next = function(pointer) {
        if((pointer + 1) == total) {
          pointer = -1;
        }
        t.media.pointer = ++pointer;
      }

      switch (mode) {
        case 'random':
          var p = utils.random(total)
          if(this.pointer !== p) {
            this.pointer = p
          } else {
            next(this.pointer)
          }
          break;
        case 'next':
          next(this.pointer)
          break;
      }

      this.setSource()
    },
    // 直接设置当前曲目pointer
    setCurrent: function(pointer) {
      if(typeof pointer == 'number' && pointer != this.pointer && this.playlist[pointer] && !this.playlist[pointer]['error']) {
        this.pointer = pointer;
        this.setSource()
      }
    },
    // 更新source为当前曲目pointer
    setSource: function() {
      var item = this.playlist[this.pointer]

      if(item['error']) {
        return;
      }

      var playing = false;
      if(!this.source.paused) {
        playing = true
        this.stop()
      }

      this.source.attr('src', item.url);
      this.source.attr('title', item.title + ' - ' + item.author);

      create.progress()
      create.preview()

      if(playing == true) {
        this.play()
      }
    },
    play: function() {
      if(this.playlist[this.pointer]['error']) {
        return;
      }
      this.source.play()
      document.title = 'Now Playing...' + this.playlist[this.pointer]['title'] + ' - ' + this.playlist[this.pointer]['author'] + ' | ' + originTitle;
    },
    pause: function() {
      this.source.pause()
      document.title = originTitle
    },
    stop: function() {
      this.source.pause();
      this.source.currentTime = 0;
      document.title = originTitle;
    },
    scroll: function() {
      var current = this.list.find('li')[this.pointer];
      Velocity(current, "scroll", {
        container: current.parentNode
      });
    },
    scrollLrc: function(currentTime) {
      var that = this
      if(!this.lrc)
        return

      if (this.lrc.index > this.lrc.data.length - 1 || currentTime < this.lrc.data[this.lrc.index][0] || (!this.lrc.data[this.lrc.index + 1] || currentTime >= this.lrc.data[this.lrc.index + 1][0])) {
          for (var i = 0; i < this.lrc.data.length; i++) {
              if (currentTime >= this.lrc.data[i][0] && (!this.lrc.data[i + 1] || currentTime < this.lrc.data[i + 1][0])) {
                  that.lrc.index = i;
                  var y = -(that.lrc.index-1);
                  that.lrc.el.style.transform = 'translateY('+y+'rem)';
                  that.lrc.el.style.webkitTransform = 'translateY('+y+'rem)';
                  that.lrc.el.getElementsByClassName('current')[0].removeClass('current');
                  that.lrc.el.getElementsByTagName('p')[i].addClass('current');
              }
          }
      }
    }
  };

  var create = {
    button: function(b) {
      if(!t.media.buttons[b]) {
        var el = document.createElement('div');
        el.addClass(b + ' btn');
        el.addEventListener('click', t.media.options.events[b] || function(){});
        t.appendChild(el);
        t.media.buttons[b] = el;
      }
    },
    audio: function() {
      if(!t.media.source) {
        var el = document.createElement('audio');

        el.addEventListener('error', function() {
          t.media.list.find('li')[t.media.pointer].addClass('error')
          t.media.playlist[t.media.pointer]['error'] = true
          t.media.setMode('next');
        });

        el.addEventListener('play', function() {
          t.addClass('playing');
          t.media.list.addClass('playing');
          showtip(el.attr('title'))
        });

        el.addEventListener('pause', function() {
          t.removeClass('playing');
          t.media.list.removeClass('playing');
        });

        el.addEventListener('timeupdate', function() {
          var percent = Math.floor((el.currentTime / el.duration * 100));
          t.media.progress.width(percent + '%');
          if(t.media.lrc) {
            t.media.scrollLrc(el.currentTime)
          }
          if (percent == 100) { // 下一曲
            t.media.setMode('next');
            t.media.play();
          }
        });

        t.appendChild(el);
        t.media.source = el;
      }
    },
    info: function() {
      if(!t.media.list) {
        var el = document.createElement('div');
        el.addClass('play-list');
        el.innerHTML = '<div class="preview"></div><ol></ol>';
        t.media.list = el;
        t.insertAfter(el);

        $('#main').addEventListener('click', function() {
          t.media.list.removeClass('on');
        })
      }
    },
    list: function() {
      var list = t.media.list.child("ol");
      list.innerHTML = "";
      t.media.playlist.forEach(function(item, index) {
        var el = document.createElement('li');
        el.innerHTML = '<span class="info"><span>'+item.title+'</span><span>'+item.author+'</span></span>';
        el.title = item.title + ' - ' + item.author

        el.addEventListener('click', function(event) {
          var current = event.currentTarget;
          if(t.media.pointer === index && t.media.progress) {
            if(t.media.source.paused) {
              t.media.play();
            } else {
              t.media.source.currentTime = t.media.source.duration * Math.floor((event.clientX - current.left()))/current.width();
            }
            return;
          }
          t.media.setCurrent(index);
          t.media.play();
        });

        list.appendChild(el);
      })
    },
    progress: function() {
      if(t.media.progress) {
        t.media.progress.parentNode.removeClass('current');
        t.media.progress.remove();
      }

      var current = t.media.list.find('li')[t.media.pointer];
      if(current) {
        var progress = document.createElement('div');
        progress.addClass('progress')
        current.appendChild(progress);
        t.media.progress = progress;
        current.addClass('current');

        t.media.scroll()
      }
    },
    preview: function() {
      var preview = t.media.list.child('.preview')
      var current = t.media.playlist[t.media.pointer]
      preview.innerHTML = '<div class="cover"><div class="disc"><img src="'+current.pic+'" /></div></div>'
      + '<div class="info"><h4 class="title">'+current.title+'</h4><span>'+current.author+'</span><div class="lrc"></div></div>'

      var lrc = '';
      fetch(current.lrc)
        .then(function(response) {
          return response.text()
        }).then(function(body) {
          if(current !== t.media.playlist[t.media.pointer])
            return;

          t.media.lrc.data = utils.lrc(body)
          var result = ''
          t.media.lrc.data.forEach(function(line, index) {
            lrc += '<p'+(index===0?' class="current"':'')+'>'+line[1]+'</p>';
          })

          var el = document.createElement('div');
          el.addClass('inner');
          el.innerHTML = lrc;
          preview.child('.lrc').innerHTML = '';
          preview.child('.lrc').appendChild(el);
          t.media.lrc.el = el;
          t.media.lrc.index = 0;
        }).catch(function(ex) {})

      preview.child('.cover').addEventListener('click', t.media.options.events['play-pause'])
    }
  },
  init = function(config) {
    if(t.media.created)
      return;

    t.media.options = Object.assign(option, config);
    // 初始化button以及click事件
    t.media.options.btns.forEach(create.button);
    // 初始化audio
    create[t.media.options.type]();
    // 初始化播放列表等
    create.info();

    t.media.created = true;
  }

  init(config);
}


Object.assign(HTMLElement.prototype, {
  player: mediaPlayer
})
var statics = CONFIG.statics.indexOf('//') > 0 ? CONFIG.statics : CONFIG.root
var scrollAction = { x: 'undefined', y: 'undefined' };
var diffY = 0;
var originTitle, titleTime;

const BODY = document.getElementsByTagName('body')[0];
const HTML = document.documentElement;
const Container = $('#container');
const loadCat = $('#loading');
const siteNav = $('#nav');
const siteNavHeight = siteNav.height();
const siteHeader = $('#header');
const menuToggle = siteNav.child('.toggle');
const quickBtn = $('#quick');
const toolBtn = $('#tool');
const toolPlayer = toolBtn.child('.player');
const backToTop = toolBtn.child('.back-to-top');
const goToComment = toolBtn.child('.chat');
const sideBar = $('#sidebar');
const siteBrand = $('#brand');
const siteSearch = $('#search');
const siteContent = $('#content');
const headerHight = $('#waves').top();
const headerHightInner = headerHight - siteNavHeight;

const Loader = {
  timer: null,
  lock: false,
  show: function() {
    clearTimeout(this.timer);
    document.body.removeClass('loaded');
    Velocity(loadCat, "fadeIn", {
      display: "flex",
      complete: function() {
        Loader.lock = false;
      }
    });
  },
  hide: function(sec) {
    this.timer = setTimeout(this.vanish, sec||3000);
  },
  vanish: function() {
    if(Loader.lock)
      return;
    Velocity(loadCat, "fadeOut");
    document.body.addClass('loaded');
    Loader.lock = true;
  }
}

const changeTheme = function(type) {
  if(type) {
    HTML.attr('data-theme', type);
  } else {
    HTML.attr('data-theme', null);
  }
}

const changeMetaTheme = function(color) {
  if(HTML.attr('data-theme') == 'dark')
    color = '#222'

  $('meta[name="theme-color"]').attr('content', color);
}

const themeColorListener = function () {
  window.matchMedia('(prefers-color-scheme: dark)').addListener(function(mediaQueryList) {
    if(mediaQueryList.matches){
      changeTheme('dark');
    } else {
      changeTheme();
    }
  });

  $('.theme').addEventListener('click', function(event) {
    var btn = event.currentTarget.child('.ic')
    if(btn.hasClass('i-sun')) {
      changeTheme('dark');
      btn.removeClass('i-sun')
      btn.addClass('i-moon')
    } else {
      changeTheme();
      btn.removeClass('i-moon')
      btn.addClass('i-sun')
    }
  });
}

const visibilityListener = function () {
  document.addEventListener('visibilitychange', function() {
    switch(document.visibilityState) {
      case 'hidden':
        $('[rel="icon"]').attr('href', statics + CONFIG.favicon.hidden);
        document.title = LOCAL.favicon.hide;
        Loader.show()
        clearTimeout(titleTime);
      break;
      case 'visible':
        $('[rel="icon"]').attr('href', statics + CONFIG.favicon.normal);
        document.title = LOCAL.favicon.show;
        Loader.hide(1000)
        titleTime = setTimeout(function () {
          document.title = originTitle;
        }, 2000);
      break;
    }
  });
}

const showtip = function(msg) {
  if(!msg)
    return

  var new_div = document.createElement('div');
  new_div.innerHTML = msg;
  new_div.addClass('tip');
  BODY.appendChild(new_div);

  window.setTimeout(function() {
      BODY.removeChild(new_div);
  }, 3000);
}

const resizeHandle = function (event) {
  var docHeight = getDocHeight();
  if (docHeight > document.body.offsetHeight) {
    quickBtn.display('flex');
    sideBar.child('.panels').height('100vh');
  } else {
    quickBtn.display('none');
  }
}

const scrollHandle = function (event) {
  var winHeight = window.innerHeight;
  var docHeight = getDocHeight();
  var contentVisibilityHeight = docHeight > winHeight ? docHeight - winHeight : document.body.scrollHeight - winHeight;
  var SHOW = window.pageYOffset > headerHight;
  var startScroll = window.pageYOffset > 0;

  if (SHOW) {
    changeMetaTheme('#FFF');
  } else {
    changeMetaTheme('#222');
  }

  siteNav.toggleClass('show', SHOW);
  toolBtn.toggleClass('affix', startScroll);
  siteBrand.toggleClass('affix', startScroll);
  sideBar.toggleClass('affix', SHOW && document.body.offsetWidth > 991);

  if (typeof scrollAction.y == 'undefined') {
    scrollAction.y = window.pageYOffset;
    //scrollAction.x = Container.scrollLeft;
    //scrollAction.y = Container.scrollTop;
  }
  //var diffX = scrollAction.x - Container.scrollLeft;
  diffY = scrollAction.y - window.pageYOffset;

  //if (diffX < 0) {
  // Scroll right
  //} else if (diffX > 0) {
  // Scroll left
  //} else
  if (diffY < 0) {
    // Scroll down
    siteNav.removeClass('up')
    siteNav.toggleClass('down', SHOW);
  } else if (diffY > 0) {
    // Scroll up
    siteNav.removeClass('down')
    siteNav.toggleClass('up', SHOW);
  } else {
    // First scroll event
  }
  //scrollAction.x = Container.scrollLeft;
  scrollAction.y = window.pageYOffset;

  var scrollPercent = Math.round(Math.min(100 * window.pageYOffset / contentVisibilityHeight, 100)) + '%';
  backToTop.child('span').innerText = scrollPercent;
  $('.percent').width(scrollPercent);
}
const sideBarToggleHandle = function (event) {
  menuToggle.toggleClass('close');
  var animateAction = sideBar.hasClass('on') ? 'transition.slideRightOut' : 'transition.slideRightIn';
  Velocity(sideBar, animateAction, {
    duration: 200,
    complete: function () {
      sideBar.toggleClass('on');
    }
  });
}

const sideBarTab = function () {
  var sideBarInner = sideBar.child('.inner');
  var panels = sideBar.find('.panel');

  if(sideBar.child('.tab')) {
    sideBarInner.removeChild(sideBar.child('.tab'));
  }

  var list = document.createElement('ul'), active = 'active';
  list.className = 'tab';

  ['contents', 'related', 'overview'].forEach(function (item) {
    var element = sideBar.child('.panel.' + item)

    if(element.innerHTML.replace(/(^\s*)|(\s*$)/g, "").length < 1) {
      return;
    }
    var tab = document.createElement('li');
    var span = document.createElement('span')
    var text = document.createTextNode(element.attr('data-title'));
    span.appendChild(text);
    tab.appendChild(span);
    tab.addClass(item + ' item');

    if(active) {
      element.addClass(active);
      tab.addClass(active);
    } else {
      element.removeClass('active');
    }

    tab.addEventListener('click', function (element) {
      var target = event.currentTarget;
      if (target.hasClass('active'))
        return;

      sideBar.find('.tab .item').forEach(function (element) {
        element.removeClass('active')
      });

      sideBar.find('.panel').forEach(function (element) {
        element.removeClass('active')
      });


      sideBar.child('.panel.' + target.className.replace(' item', '')).addClass('active');

      target.addClass('active');
    });

    list.appendChild(tab);
    active = '';
  });

  if (list.childNodes.length > 1) {
    sideBarInner.insertBefore(list, sideBarInner.childNodes[0]);
    sideBar.child('.panels').style.paddingTop = ''
  } else {
    sideBar.child('.panels').style.paddingTop = '10px'
  }
}

const sidebarTOC = function () {
  var navItems = $.all('.contents li');

  if (navItems.length < 1) {
    return;
  }

  var sections = Array.prototype.slice.call(navItems) || [];
  var activeLock = null;

  sections = sections.map(function (element, index) {
    var link = element.child('a.toc-link');
    var anchor = $(decodeURI(link.attr('href')));
    var alink = anchor.child('a.anchor');

    var anchorScroll = function (event) {
      event.preventDefault();
      var target = $(decodeURI(event.currentTarget.attr('href')));

      activeLock = index;
      pageScroll(target, -siteNavHeight, function() {
          activateNavByIndex(index)
          activeLock = null
        })
    };

    // TOC item animation navigate.
    link.addEventListener('click', anchorScroll);
    alink && alink.addEventListener('click', anchorScroll);
    return anchor;
  });

  var tocElement = sideBar.child('.panels .inner');

  var activateNavByIndex = function (index, lock) {
    var target = navItems[index]

    if (!target)
      return;

    if (target.hasClass('current')) {
      return;
    }

    $.each('.toc .active', function (element) {
      element.removeClass('active current');
    });

    sections.forEach(function (element) {
      element.removeClass('active');
    });

    target.addClass('active current');
    sections[index].addClass('active');

    var parent = target.parentNode;

    while (!parent.matches('.contents')) {
      if (parent.matches('li')) {
        parent.addClass('active');
        var t = $(parent.child('a.toc-link').attr('href'))
        if(t) {
          t.addClass('active');
        }
      }
      parent = parent.parentNode;
    }
    // Scrolling to center active TOC element if TOC content is taller then viewport.
    Velocity(target, "scroll", {
      container: tocElement,
      offset: - (tocElement.offsetHeight / 2)
    });
  }

  var findIndex = function(entries) {
    var index = 0;
    var entry = entries[index];

    if (entry.boundingClientRect.top > 0) {
      index = sections.indexOf(entry.target);
      return index === 0 ? 0 : index - 1;
    }
    for (; index < entries.length; index++) {
      if (entries[index].boundingClientRect.top <= 0) {
        entry = entries[index];
      } else {
        return sections.indexOf(entry.target);
      }
    }
    return sections.indexOf(entry.target);
  }

  var createIntersectionObserver = function() {
    var observer = new IntersectionObserver(function (entries, observe) {
      var index = findIndex(entries) + (diffY < 0? 1 : 0);
      if(activeLock === null) {
        activateNavByIndex(index);
      }
    }, {
      rootMargin: '0px 0px -100% 0px',
      threshold: 0
    });

    sections.forEach(function (element) {
      element && observer.observe(element);
    });

  }

  createIntersectionObserver();
}

const backToTopHandle = function () {
  pageScroll(BODY);
}

const goToBottomHandle = function () {
  pageScroll(BODY, Container.height());
}

const goToCommentHandle = function () {
  pageScroll($('#comments'));
}

const menuActive = function () {
  $.each('.menu .item', function (element) {
    var target = element.child('a[href]');
    if (!target) return;
    var isSamePath = target.pathname === location.pathname || target.pathname === location.pathname.replace('index.html', '');
    var isSubPath = !CONFIG.root.startsWith(target.pathname) && location.pathname.startsWith(target.pathname);
    var active = target.hostname === location.hostname && (isSamePath || isSubPath)
    element.toggleClass('active', active);
    element.parentNode.parentNode.toggleClass('expand', element.parentNode.hasClass('submenu') && element.parentNode.child('.active'));
  });
}
const cardActive = function() {
  if($('.index.wrap')) {
    var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(article) {
            if (!window.IntersectionObserver) {
                if( article.target.hasClass("show") === false){
                    article.target.addClass("show");
                }
            } else {
                if (article.target.hasClass("show")) {
                    io.unobserve(article.target)
                } else {
                    if (article.isIntersecting) {
                        article.target.addClass("show");
                        io.unobserve(article.target)
                    }
                }
            }
        })
    }, {
        root: null,
        threshold: [0.44]
    });

    $.each('.index.wrap article.item, .index.wrap section.item', function(article) {
        io.observe(article)
    })
  }

  var tabs;

  $.each('.cards .item', function(element, index) {
    ['mouseenter', 'touchstart'].forEach(function(item){
      element.addEventListener(item, function(event) {
        if($('.cards .item.active')) {
          $('.cards .item.active').removeClass('active')
        }
        element.addClass('active')
      })
    });
    ['mouseleave'].forEach(function(item){
      element.addEventListener(item, function(event) {
        element.removeClass('active')
      })
    });

    // if (index == 0) {
    //   tabs = document.createElement('ul');
    //   tabs.addClass('filter');
    //   element.parentNode.parentNode.insertBefore(tabs, element.parentNode)
    // }
    // var top = $('#'+element.child('.cover').attr('data-top'));
    // if(!top) {
    //   top = document.createElement('li');
    //   top.id = element.child('.cover').attr('data-top');

    //   top.addEventListener('click', function(event) {
    //     var tab = event.currentTarget;
    //     tab.parentNode.find('.show').forEach(function(el) {
    //       el.removeClass('show');
    //     })
    //     $.each('[data-top=' + tab.attr('id') + ']', function(el) {
    //       el.parentNode.parentNode.addClass('hide')
    //       el.parentNode.addClass('show')
    //     })
    //   })

    //   tabs.appendChild(top)
    // }
  });
}


const postBeauty = function () {

  $.each('.md img', function(element) {
    var info;
    if(info = element.attr('title')) {
      var para = document.createElement('span');
      var txt = document.createTextNode(info);
      para.appendChild(txt);
      para.addClass('image-info');
      element.insertAfter(para);
    }
  });
  if($('.md :not(a) > img, .md > img')) {
    LOCAL['mediumzoom'] = true;
    vendorJs('mediumzoom', function() {
        window.mediumZoom('.md :not(a) > img, .md > img', {
          background: 'rgba(0, 0, 0, 0.6)'
        });
      }, window.mediumZoom);
  }

  $.each('li ruby', function(element) {
    var parent = element.parentNode;
    if(element.parentNode.tagName != 'LI') {
      parent = element.parentNode.parentNode;
    }
    parent.addClass('ruby');
  })

  $.each('.md > table', function (element) {
    const box = document.createElement('div');
    box.className = 'table-container';
    element.wrap(box);
  });

  $.each('.highlight > table', function (element) {
    const box = document.createElement('div');
    box.className = 'code-container';
    element.wrap(box);
  });

  $.each('figure.highlight', function (element) {

    var code_container = element.child('.code-container');


    element.insertAdjacentHTML('beforeend', '<div class="operation"><span class="breakline-btn"><i class="ic i-align-left"></i></span><span class="copy-btn"><i class="ic i-clipboard"></i></span><span class="fullscreen-btn"><i class="ic i-expand"></i></span></div>');

    var copyBtn = element.child('.copy-btn');
    copyBtn.addEventListener('click', function (event) {
      var target = event.currentTarget;
      var code = code_container.innerText.replace(/\n\n\t/g, '');
      var ta = document.createElement('textarea');
      ta.style.top = window.scrollY + 'px'; // Prevent page scrolling
      ta.style.position = 'absolute';
      ta.style.opacity = '0';
      ta.readOnly = true;
      ta.value = code;
      document.body.append(ta);
      const selection = document.getSelection();
      const selected = selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
      ta.select();
      ta.setSelectionRange(0, code.length);
      ta.readOnly = false;
      var result = document.execCommand('copy');

      target.child('.ic').className = result ? 'ic i-check' : 'ic i-times';
      ta.blur(); // For iOS
      target.blur();
      if (selected) {
        selection.removeAllRanges();
        selection.addRange(selected);
      }
      document.body.removeChild(ta);
    });
    copyBtn.addEventListener('mouseleave', function (event) {
      setTimeout(function () {
        event.target.child('.ic').className = 'ic i-clipboard';
      }, 300);
    });

    var breakBtn = element.child('.breakline-btn');
    breakBtn.addEventListener('click', function (event) {
      var target = event.currentTarget;
      if (element.hasClass('breakline')) {
        element.removeClass('breakline');
        target.child('.ic').className = 'ic i-align-left';
      } else {
        element.addClass('breakline');
        target.child('.ic').className = 'ic i-align-justify';
      }
    });

    var fullscreenBtn = element.child('.fullscreen-btn');
    var removeFullscreen = function() {
      element.removeClass('fullscreen');
      $('html').removeClass('fullscreen');
      fullscreenBtn.child('.ic').className = 'ic i-expand';
    }
    var fullscreenHandle = function(event) {
      var target = event.currentTarget;
      if (element.hasClass('fullscreen')) {
        removeFullscreen();
        hideCode && hideCode();
        pageScroll(element)
      } else {
        element.addClass('fullscreen');
        $('html').addClass('fullscreen');
        fullscreenBtn.child('.ic').className = 'ic i-compress';
        showCode && showCode();
      }
    }
    fullscreenBtn.addEventListener('click', fullscreenHandle);
    element.child('figcaption').addEventListener('click', fullscreenHandle);


    if(code_container && code_container.height() > 300) {
      code_container.style.maxHeight = "300px";
      code_container.insertAdjacentHTML('beforeend', '<div class="show-btn"><i class="ic i-angle-down"></i></div>');
      var showBtn = code_container.child('.show-btn');
      var showBtnIcon = showBtn.child('i');

      var showCode = function() {
        code_container.style.maxHeight = ""
        showBtn.addClass('open')
      }

      var hideCode = function() {
        code_container.style.maxHeight = "300px"
        showBtn.removeClass('open')
      }

      showBtn.addEventListener('click', function(event) {
        if (showBtn.hasClass('open')) {
          removeFullscreen()
          hideCode()
          pageScroll(code_container.parentNode)
        } else {
          showCode()
        }
      });
    }

  });

  $.each('pre.mermaid > svg', function (element) {
    element.style.maxWidth = ''
  });

  $.each('.reward button', function (element) {
    element.addEventListener('click', function (event) {
      event.preventDefault();
      var qr = $('#qr')
      if(qr.style.display === 'inline-flex') {
        Velocity(qr, "fadeOut");
      } else {
        Velocity(qr, "transition.slideUpBigIn", {display: 'inline-flex'});
      }
    });
  });

  //quiz
  $.each('.quiz > ul.options li', function (element) {
    element.addEventListener('click', function (event) {
      if (element.hasClass('correct')) {
        element.toggleClass('right')
        element.parentNode.parentNode.addClass('show')
      } else {
        element.toggleClass('wrong')
      }
    });
  });

  $.each('.quiz > p', function (element) {
    element.addEventListener('click', function (event) {
      element.parentNode.toggleClass('show')
    });
  });

  // tab
  $.each('div.tab', function(element, index) {
    var id = element.attr('data-id');
    var title = element.attr('data-title');
    var box = $('#' + id);
    if(!box) {
      box = document.createElement('div');
      box.className = 'tabs';
      box.id = id;
      element.parentNode.insertBefore(box, element);
      ul = document.createElement('ul');
      ul.addClass('nav');
      box.appendChild(ul);
    }

    var ul = box.child('.nav');
    if(!ul) {
      ul = document.createElement('ul');
      ul.addClass('nav');
      box.appendChild(ul);
    }

    var li = document.createElement('li');
    li.innerHTML = title;
    if(index == 0) {
      li.addClass('active');
      element.addClass('active');
    }

    li.addEventListener('click', function(event) {
      var target = event.currentTarget;
      box.find('.active').forEach(function(el) {
        el.removeClass('active');
      })
      element.addClass('active');
      target.addClass('active');
    });

    ul.appendChild(li);

    box.appendChild(element);
  });

  loadComments();
}

const registerExtURL = function() {
  $.each('span.exturl', function(element) {
      var link = document.createElement('a');
      // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
      link.href = decodeURIComponent(atob(element.dataset.url).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      link.rel = 'noopener external nofollow noreferrer';
      link.target = '_blank';
      link.className = element.className;
      link.title = element.title || element.innerText;
      link.innerHTML = element.innerHTML;
      if(element.dataset.backgroundImage) {
        link.dataset.backgroundImage = element.dataset.backgroundImage;
      }
      element.parentNode.replaceChild(link, element);
    });
}

const loadComments = function () {
  var element = $('#comments');
  if (!element) {
    goToComment.display("none")
    return;
  } else {
    goToComment.display("")
  }

  var intersectionObserver = new IntersectionObserver(function(entries, observer) {
    vendorJs('valine', function() {
      var entry = entries[0];
      vendorCss('valine');

      if (entry.isIntersecting) {
        var options = CONFIG.valine;
        options.el = '#comments';
        options.path = element.attr('data-id');

        new Valine(options);

        Velocity($('#comments'), 'transition.bounceUpIn');

        observer.disconnect();
      }
    }, window.Valine);
  });

  intersectionObserver.observe(element);
}


const algoliaSearch = function(pjax) {
  if(CONFIG.search === null)
    return

  var search = instantsearch({
    indexName: CONFIG.search.indexName,
    searchClient  : algoliasearch(CONFIG.search.appID, CONFIG.search.apiKey),
    searchFunction: function(helper) {
      var searchInput = $('.search-input');
      if (searchInput.value) {
        helper.search();
      }
    }
  });

  search.on('render', function() {
    pjax.refresh($('#search-hits'));
  });

  // Registering Widgets
  search.addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: CONFIG.search.hits.per_page || 10
    }),

    instantsearch.widgets.searchBox({
      container           : '.search-input-container',
      placeholder         : LOCAL.search.placeholder,
      // Hide default icons of algolia search
      showReset           : false,
      showSubmit          : false,
      showLoadingIndicator: false,
      cssClasses          : {
        input: 'search-input'
      }
    }),

    instantsearch.widgets.stats({
      container: '#search-stats',
      templates: {
        text: function(data) {
          var stats = LOCAL.search.stats
            .replace(/\$\{hits}/, data.nbHits)
            .replace(/\$\{time}/, data.processingTimeMS);
          return stats + '<span class="algolia-powered"></span><hr>';
        }
      }
    }),

    instantsearch.widgets.hits({
      container: '#search-hits',
      templates: {
        item: function(data) {
          var cats = data.categories.join('<i class="ic i-angle-right"></i>')
          return '<a href="' + CONFIG.root + data.path +'"><span>'+cats+'</span>'+data._highlightResult.title.value+'</a>';
        },
        empty: function(data) {
          return '<div id="hits-empty">'+
              LOCAL.search.empty.replace(/\$\{query}/, data.query) +
            '</div>';
        }
      },
      cssClasses: {
        item: 'item'
      }
    }),

    instantsearch.widgets.pagination({
      container: '#search-pagination',
      scrollTo : false,
      showFirst: false,
      showLast : false,
      templates: {
        first   : '<i class="ic i-angle-double-left"></i>',
        last    : '<i class="ic i-angle-double-right"></i>',
        previous: '<i class="ic i-angle-left"></i>',
        next    : '<i class="ic i-angle-right"></i>'
      },
      cssClasses: {
        root        : 'pagination',
        item        : 'pagination-item',
        link        : 'page-number',
        selectedItem: 'current',
        disabledItem: 'disabled-item'
      }
    })
  ]);

  search.start();

  // Handle and trigger popup window
  $.each('.search', function(element) {
    element.addEventListener('click', function() {
      document.body.style.overflow = 'hidden';
      Velocity(siteSearch, "transition.shrinkIn", {
        duration: 200,
        complete: function() {
          $('.search-input').focus();
        }
      });
    });
  });

  // Monitor main search box
  const onPopupClose = function() {
    document.body.style.overflow = '';
    Velocity(siteSearch, "transition.shrinkOut");
  };

  siteSearch.addEventListener('click', function(event) {
    if (event.target === siteSearch) {
      onPopupClose();
    }
  });
  $('.close-btn').addEventListener('click', onPopupClose);
  window.addEventListener('pjax:success', onPopupClose);
  window.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });
}
const pagePostion = function(url) {
  store.set(url, scrollAction.y)
}

const pjaxReload = function () {
  pagePostion(window.location.href);

  if(sideBar.hasClass('on')) {
    Velocity(sideBar, 'transition.slideRightOut', {
      duration: 200,
      complete: function () {
        sideBar.removeClass('on');
        menuToggle.removeClass('close');
      }
    });
  }

  siteContent.innerHTML = loadCat.innerHTML;
}

const siteRefresh = function (reload) {
  vendorCss('katex');
  vendorJs('copy_tex');
  vendorCss('mermaid');
  vendorJs('chart');

  if(!reload) {
    $.each('script[data-pjax]', pjaxScript);
  }

  originTitle = document.title

  resizeHandle()

  menuActive()

  sideBarTab()
  sidebarTOC()

  postBeauty()
  registerExtURL()

  toolPlayer.media.load(LOCAL.audio || CONFIG.audio || {});

  lozad($.all('img, [data-background-image]'), {
      loaded: function(el) {
          el.addClass('lozaded');
      }
  }).observe()

  Loader.hide()

  var position = store.get(window.location.href)
  if(position) {
    pageScroll(BODY, position);
    store.del(window.location.href);
  }

  cardActive()
}

const siteInit = function () {
  document.body.oncopy = function() {
    showtip(LOCAL.copyright)
  };

  var pjax = new Pjax({
    selectors: [
      'head title',
      '.languages',
      '.pjax',
      'script[data-config]'
    ],
    analytics: false,
    cacheBust: false
  });

  CONFIG.quicklink.ignores = LOCAL.ignores;
  quicklink.listen(CONFIG.quicklink);

  visibilityListener();
  themeColorListener();

  menuToggle.addEventListener('click', sideBarToggleHandle);
  $('.dimmer').addEventListener('click', sideBarToggleHandle);
  quickBtn.child('.down').addEventListener('click', goToBottomHandle);
  quickBtn.child('.up').addEventListener('click', backToTopHandle);
  backToTop.addEventListener('click', backToTopHandle);

  loadCat.addEventListener('click', Loader.vanish);

  window.addEventListener('scroll', scrollHandle);

  goToComment.addEventListener('click', goToCommentHandle);

  toolPlayer.player();

  window.addEventListener('resize', resizeHandle);

  window.addEventListener('pjax:send', pjaxReload);

  window.addEventListener('pjax:success', siteRefresh);

  window.addEventListener("beforeunload", function() {
    pagePostion(window.location.href)
  });

  algoliaSearch(pjax)

  siteRefresh(1)
}

window.addEventListener('DOMContentLoaded', siteInit);

console.log('%c Theme.Shoka %c v' + CONFIG.versoin + ' ', 'color: white; background: #e9546b; padding:5px 0;', 'padding:4px;border:1px solid #e9546b;')
