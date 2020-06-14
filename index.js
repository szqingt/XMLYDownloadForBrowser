const baseUrl = 'https://www.ximalaya.com';
const api = {
    getTracksList: '/revision/album/v1/getTracksList?', // albumId=4606246&pageNum=1
    getAudio: '/revision/play/v1/audio?ptype=1&', // ?id=20948135&ptype=1
};


/**
 * 获取 blob
 * @param  {String} url 目标文件地址
 * @return {Promise} 
 */
function getBlob(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            }
        };
        xhr.onerror = (e) => {
            reject(e)
        };

        xhr.send();
    });
}

/**
 * 保存
 * @param  {Blob} blob     
 * @param  {String} filename 想要保存的文件名称
 */
function saveAs(blob, filename) {
    const link = document.createElement('a');
    const body = document.querySelector('body');

    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    // fix Firefox
    link.style.display = 'none';
    body.appendChild(link);

    link.click();
    body.removeChild(link);

    window.URL.revokeObjectURL(link.href);
    return true;
}

/**
 * 下载
 * @param  {String} url 目标文件地址
 * @param  {String} filename 想要保存的文件名称
 */
async function download(url, filename) {
    const blob = await getBlob(url);
    return Promise.resolve(saveAs(blob, filename));
}

// 获取albumId的下载信息
async function getDownloadInfoList(albumId, pageSize = 10) {
    let url = baseUrl + api.getTracksList + `albumId=${albumId}&pageSize=${pageSize}`;
    const { data: { trackTotalCount } } = await fetch(url).then(res => res.json());
    const totalPageNum = Math.ceil(trackTotalCount / pageSize);
    let result = [];

    for (let i = 1; i <= totalPageNum; i++) {
        const pageUrl = url + `&pageNum=${i}`;
        const { data: { tracks } } = await fetch(pageUrl).then(res => res.json());
        result = result.concat(tracks.map(it => ({
            title: it.title,
            trackId: it.trackId
        })))
    }
    console.log('done getDownloadInfoList');
    return Promise.resolve(result);
}


async function getDownloadUrl(id) {
    const url = baseUrl + api.getAudio + `id=${id}`;
    const { data: { src } } = await fetch(url).then(res => res.json());
    return Promise.resolve(src);
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * 队列执行任务
 * @param  {Array} taskList 执行的任务列表
 * @param  {number} concurrentNum 执行的任务并发数量
 * @param  {number} waitTime 执行任务完成后等待的时间
 * @return {void}} 
 */
function queueTask(taskList, concurrentNum = 1, waitTime = 1000, done) {
    let index = 0;
    const runTaskList = taskList.slice(index, index + concurrentNum);
    index += concurrentNum;

    async function goNext() {
        const task = taskList[index];
        index++;
        const flag = index;
        if (taskList.length < index) {
            return;
        };
        await task();
        await sleep(waitTime);
        if (flag === taskList.length) {
            done && done();
        }
        goNext();
    }

    runTaskList.forEach(async task => {
        await task();
        await sleep(waitTime);
        goNext()
    });

};


/**
 * 根据albumId下载所有音频
 * @param  {number}} id 专辑id
 * @param  {number} concurrentNum 执行的任务并发数量
 * @param  {number} waitTime 执行任务完成后等待的时间
 * @return {void}} 
 */
async function xmlyAudioDonwload(id, concurrentNum = 3, waitTime = 4000) {
    const infoList = await getDownloadInfoList(id);
    const errorTask = [];
    const taskList = infoList.map((info) => {
        return async function down() {
            try {
                console.log(`start download fileName:${info.title}`);
                const url = await getDownloadUrl(info.trackId);
                await download(url, info.title);
                console.log(`download fileName:${info.title} success`);
            } catch (e) {
                console.log(`download fileName:${info.title} error`, e)
                errorTask.push(info);
            }

        }
    });

    queueTask(taskList, concurrentNum, waitTime, () => {
        console.log(`download task done, success download ${taskList.length - errorTask.length} file, ${errorTask.length} error!`);
        console.log(`error file detail:`, errorTask);
    });

}
