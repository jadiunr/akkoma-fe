
const filterByKeyword = (list, keyword = '') => {
  return list.filter(x => x.displayText.includes(keyword))
}

const EmojiPicker = {
  props: {
    stickerPicker: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      labelKey: String(Math.random() * 100000),
      keyword: '',
      activeGroup: 'custom',
      showingStickers: false,
      zoomEmoji: false,
      spamMode: false
    }
  },
  components: {
    StickerPicker: () => import('../sticker_picker/sticker_picker.vue')
  },
  methods: {
    onEmoji (emoji) {
      const value = emoji.imageUrl ? `:${emoji.displayText}:` : emoji.replacement
      this.$emit('emoji', { insertion: ` ${value} `, spamMode: this.spamMode })
    },
    highlight (key) {
      const ref = this.$refs['group-' + key]
      const top = ref[0].offsetTop
      this.setShowStickers(false)
      this.activeGroup = key
      this.$nextTick(() => {
        this.$refs['emoji-groups'].scrollTop = top + 1
      })
    },
    scrolledGroup (e) {
      const target = (e && e.target) || this.$refs['emoji-groups']
      const top = target.scrollTop + 5
      this.$nextTick(() => {
        this.emojisView.forEach(group => {
          const ref = this.$refs['group-' + group.id]
          if (ref[0].offsetTop <= top) {
            this.activeGroup = group.id
          }
        })
      })
    },
    toggleStickers () {
      this.showingStickers = !this.showingStickers
    },
    setShowStickers (value) {
      this.showingStickers = value
    },
    onStickerUploaded (e) {
      this.$emit('sticker-uploaded', e)
    },
    onStickerUploadFailed (e) {
      this.$emit('sticker-upload-failed', e)
    },
    setZoomEmoji (e, emoji) {
      this.zoomEmoji = emoji
      const { x, y } = e.target.getBoundingClientRect()
      console.log(e.target)
      this.$refs['zoom-portal'].style.left = (x - 32) + 'px'
      this.$refs['zoom-portal'].style.top = (y - 32) + 'px'
    }
  },
  watch: {
    keyword () {
      this.scrolledGroup()
    }
  },
  computed: {
    activeGroupView () {
      return this.showingStickers ? '' : this.activeGroup
    },
    stickersAvailable () {
      if (this.$store.state.instance.stickers) {
        return this.$store.state.instance.stickers.length > 0
      }
      return 0
    },
    emojis () {
      const standardEmojis = this.$store.state.instance.emoji || []
      const customEmojis = this.$store.state.instance.customEmoji || []
      return [
        {
          id: 'custom',
          text: this.$t('emoji.custom'),
          icon: 'icon-smile',
          emojis: filterByKeyword(customEmojis, this.keyword)
        },
        {
          id: 'standard',
          text: this.$t('emoji.unicode'),
          icon: 'icon-picture',
          emojis: filterByKeyword(standardEmojis, this.keyword)
        }
      ]
    },
    emojisView () {
      return this.emojis.filter(value => value.emojis.length > 0)
    }
  }
}

export default EmojiPicker
