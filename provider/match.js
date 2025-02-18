const find = require("./find");
const request = require("../request");

const provider = {
  netease: require("./netease"),
  qq: require("./qq"),
  xiami: require("./xiami"),
  baidu: require("./baidu"),
  kugou: require("./kugou"),
  kuwo: require("./kuwo"),
  migu: require("./migu"),
  joox: require("./joox")
};

const match = (id, source) => {
  let meta = {};
  let candidate = (source || global.source || ["qq", "xiami", "baidu"]).filter(
    name => name in provider
  );
  return find(id)
    .then(info => {
      meta = info;
      return Promise.all(
        candidate.map(name => provider[name].check(info).catch(() => {}))
      );
    })
    .then(urls => {
      urls = urls.filter(url => url);
      return Promise.all(urls.map(url => check(url)));
    })
    .then(songs => {
      songs = songs.filter(song => song.url);
      if (!songs.length) return Promise.reject();
      console.log(`[${meta.id}] ${meta.name}\n${songs[0].url}`);
      return songs[0];
    });
};

const check = url => {
  let song = { size: 0, url: null, md5: null };
  return Promise.race([
    request("HEAD", url),
    new Promise((_, reject) => setTimeout(() => reject(504), 5 * 1000))
  ])
    .then(response => {
      if (response.statusCode != 200) return;
      if (url.includes("qq.com") || url.includes("xu1s")) {
        song.md5 = response.headers["server-md5"];
      } else if (url.includes("xiami.net") || url.includes("qianqian.com")) {
        song.md5 = response.headers["etag"].replace(/"/g, "").toLowerCase();
      }
      song.size = parseInt(response.headers["content-length"]) || 0;
      song.url = response.url.href;
      if (url.includes("flac")) {
        song.type = "flac";
      } else {
        song.type = "mp3";
      }
    })
    .catch(() => {})
    .then(() => song);
};

module.exports = match;
