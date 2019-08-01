const cache = require("../cache");
const insure = require("./insure");
const request = require("../request");

const search = info => {
  let url =
    "https://c.y.qq.com/soso/fcgi-bin/client_search_cp?" +
    "ct=24&qqmusic_ver=1298&new_json=1&remoteplace=txt.yqq.center" +
    "&searchid=46804741196796149&t=0&aggr=1&cr=1&catZhida=1&lossless=0" +
    "&flag_qc=0&p=1&n=20&w=" +
    encodeURIComponent(info.keyword) +
    "&g_tk=5381&jsonpCallback=MusicJsonCallback10005317669353331&loginUin=0&hostUin=0" +
    "&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0";

  return request("GET", url)
    .then(response => response.jsonp())
    .then(jsonBody => {
      let matched = jsonBody.data.song.list[0];
      if (matched) return matched.file.media_mid;
      else return Promise.reject();
    });
};

const ticket = () => {
  return Promise.resolve("");
};

const track = id => {
  return request("GET", `http://mess.xu1s.com/tencent/song?id=${id}`)
    .then(res => res.json())
    .then(res => res.data[0].file)
    .then(files => {
      if (files.size_flac) {
        return "flac";
      } else if (files.size_320mp3) {
        return "320";
      } else if (files.ize_192aac) {
        return "192";
      } else {
        return "128";
      }
    })
    .then(
      quality => `http://mess.xu1s.com/tencent/url?id=${id}&quality=${quality}`
    );
};

const check = info => cache(search, info).then(track);

module.exports = { check, ticket };
