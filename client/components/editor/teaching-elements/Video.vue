<template>
  <div class="te-video">
    <div v-if="showPlaceholder">
      <div class="well video-placeholder">
        <div class="message">
          <span class="heading">Video placeholder</span>
          <span v-if="!isFocused">Select to edit</span>
          <span v-else>Please use toolbar to enter url</span>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="!isFocused" class="overlay">
        <div class="message">Double click to preview</div>
      </div>
      <div v-if="showError" class="error">
        <div class="message">
          <span class="icon mdi mdi-alert"></span>
          <p>Error loading media!</p>
        </div>
      </div>
      <div class="player">
        <video-player
          v-if="!isDragged"
          :options="options"
          @ready="onReady"
          ref="video"
          class="player">
        </video-player>
      </div>
    </div>
  </div>
</template>

<script>
import { extname } from 'path';
import get from 'lodash/get';
import 'videojs-youtube';
import 'videojs-vimeo';
import { videoPlayer as VideoPlayer } from 'vue-video-player';
const MediaError = window.MediaError;

export default {
  name: 'te-video',
  props: ['element', 'isFocused', 'isDragged'],
  data() {
    return { error: null };
  },
  computed: {
    player() {
      return this.$refs.video && this.$refs.video.player;
    },
    source() {
      const src = get(this.element, 'data.url');
      if (!src) return;
      const type = getMimetype(src);
      return { type, src };
    },
    poster() {
      return get(this.element, 'data.poster');
    },
    options() {
      return {
        autoplay: false,
        techOrder: ['html5', 'youtube', 'vimeo'],
        poster: this.poster,
        sources: [this.source]
      };
    },
    showPlaceholder() {
      return !this.source;
    },
    showError() {
      if (!this.error) return false;
      return this.error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;
    }
  },
  methods: {
    onReady(player) {
      this.error = null;
      player.on('error', () => this.onError(player.error()));
      const err = player.error();
      if (err) this.onError(err);
    },
    onError(err) {
      this.error = err;
    }
  },
  watch: {
    isFocused(val, oldVal) {
      if (oldVal && !val && this.player) this.player.pause();
    }
  },
  beforeDestroy() {
    if (this.player) this.player.pause();
  },
  components: { VideoPlayer }
};

function getMimetype(url) {
  if (url.match(/youtu\.?be/)) return 'video/youtube';
  if (url.match(/vimeo/)) return 'video/vimeo';
  const [, ext] = extname(url).split('.');
  return `video/${ext}`;
}
</script>

<style lang="scss" scoped>
.te-video {
  position: relative;
}

.video-placeholder {
  .message {
    padding: 100px 20px;

    .heading {
      font-size: 24px;
    }

    span {
      display: block;
      font-size: 18px;
    }
  }
}

.overlay {
  position: absolute;
  z-index: 99;
  width: 100%;
  height: 100%;
  background-color: #333;
  opacity: 0.9;

  .message {
    position: relative;
    top: 45%;
    color: green;
    font-size: 22px;
  }
}

.error {
  position: absolute;
  z-index: 98;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,.9);
}

.error .message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 18px;
  font-weight: 500;

  .icon { font-size: 42px; }
}

.well {
  margin: 0;
}

.player {
  height: 360px;
  background: #000;
}

.player /deep/ .video-js .vjs-big-play-button {
  display: none !important;
}

// Addresses videojs-vimeo plugin issue:
// https://github.com/videojs/videojs-vimeo/issues/70#issuecomment-196805920
.player /deep/ .video-js .vimeoFrame {
  // NOTE: Do not remove !important, overrides inline style!
  position: absolute !important;
  height: 100% !important;
  padding: 0 !important;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.disabled .overlay {
  display: none;
}
</style>
