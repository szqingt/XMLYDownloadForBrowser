# XMLYDownloadForBrowser
在浏览器中下载指定专辑下的喜马拉雅音频
## 使用方法
* 进入想要下载的的专辑下面
* https://www.ximalaya.com/lishi/4606246/p2/ 获取其中4606246是albumId专辑的id
* 打开控制台将index中的js执行

/**   
 \* 根据albumId下载所有音频   
 \* @param  {number}} id 专辑id   
 \* @param  {number} concurrentNum 默认3，执行的任务并发数量   
 \* @param  {number} waitTime 默认3000，执行任务完成后等待的时间   
 \* @return {void}}    
 \*\*/   

* 使用xmlyAudioDonwload方法下载即可
## notice
  > 请使用新版本的**chrome**进行使用
## 许可
使用MIT许可协议. 本工具仅限个人学习，不用于商业等用途。所涉及的音视频资源版权归喜马拉雅所有。
