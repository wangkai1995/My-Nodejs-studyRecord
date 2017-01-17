##近期关于SPA单页面应用的一些体会


###框架问题
目前只采用过angular和ionic,2种框架开发.由于ionic基于angular所以只叙述angular的一些问题


###angular 1.X版本的一些自身问题

1. ####angularJS的体积特别的大

&nbsp;&nbsp;在即使压缩过后的版本也有200KB大小,加上一般SPA应用中HTML通常打包成template.js作为JS加载引入,加上业务代码,一个小型项目全部JS文件压缩过后也达到惊人的600KB左右。
这个在首屏加载中如果还要加载CSS文件和字体文件,首屏BannerIMG，这一切差不多达到1.5M左右的大小.
*所以即使刨除Ajax请求,首屏的加载时间也差不多4S左右*.

2. ####在验证方面以及表单元素方面的一些问题

&nbsp;&nbsp;即便HTML5的一些form元素的加载,以及angular自身的`varificationForm.$invalid`已经足够一般使用.
但是在一些地方常常不使用form,而是使用大量使用Input和checkBox,radio等,
通常这些元素的一些NG方法比如ng-change ng-check ng-foucs ng-blur等类似方法,会导致angular1的脏检查机制(dirty-checking)触发.
angularg官方建议一个页面只有2000个双向绑定,但是这个在一个存在list ng-repeat,中特别容易超出限制,*特别是其中的item中存在Input和checkBox,radios等,由此频繁引发的脏检查机制导致在一些比较便宜的千元安卓机下面导致无比的顿卡现象*。


###曾经做过的一些优化和遇到的问题
在精品活动这个项目中,由于是从ionic混合APP项目。移植过来曾经进行过一次代码优化.

在优化前首屏分别加载ionic.min.js  lib.min.js  app.min.js  jweixin-1.0.0.js app.wap.css ionic.ttf 图片以及icon图标等文件 以及20+个AJAX请求,全部文件大小总共1.6MB 全部加载时间为7S左右,其中JS文件的加载大概在4-5S左右

随后采用优化合并了JS文件打包 Ajax请求 icon的雪碧图处理,减少了大概1S以上的加载时间.
但是首屏的加载时间还是很慢,在服务器带宽不够的情况下,首页加载过慢,Ajax请求过多.导致的可交互时间很长等问题,无法得到根本性的解决.


###个人的一些看法
####关于require.js和sea.js的在线模块加载,和点点出行项目使用browserify后端模块管理模式的一些问题.
个人感觉AMD CMD的在线模块加载方式 并不适合SPA应用.
*本质上SPA应用就是解决页面切换过程中的可交互间隙问题来达到模拟APP的WEB应用*
引入在线模块加载的方式,会增大页面切换间隙时间,影响可交互时间.所以可能browserify后端模块管理模式更合适SPA应用的模块化开发
require.JS和sea.js更合适使用在大型PC或者非SPA mobile项目中


###总结
近期在研究react.js +node.js的 首屏后端渲染方式的SPA应用,这个模式应该能解决SPA应用中，最为关键的首屏加载时间的问题！！！


2016.12.12  
