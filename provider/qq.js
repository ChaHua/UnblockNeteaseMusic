const cache = require("../cache");
const insure = require("./insure");
const request = require("../request");

const search = info => {
  let url = `http://mess.xu1s.com/tencent/search?keyword=${encodeURIComponent(
    info.keyword
  )}&type=song`;

  return request("GET", url)
    .then(response => response.json())
    .then(jsonBody => {
      let matched = jsonBody.data.list[0];
      if (matched) return matched.songmid;
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
      console.log(files);
      if (files.size_flac) {
        return "flac";
      } else if (files.size_320mp3) {
        return "320";
      } else {
        return "128";
      }
    })
    .then(
      quality =>
        `http://mess.xu1s.com/tencent/url/${quality}/${id}.${
          quality === "flac" ? "flac" : "mp3"
        }`
    );
};

const check = info => cache(search, info).then(track);

module.exports = { check, ticket };
