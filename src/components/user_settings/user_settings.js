import unescape from 'lodash/unescape'
import get from 'lodash/get'

import TabSwitcher from '../tab_switcher/tab_switcher.js'
import ImageCropper from '../image_cropper/image_cropper.vue'
import StyleSwitcher from '../style_switcher/style_switcher.vue'
import fileSizeFormatService from '../../services/file_size_format/file_size_format.js'
import BasicUserCard from '../basic_user_card/basic_user_card.vue'
import withLoadMore from '../../hocs/with_load_more/with_load_more'
import withList from '../../hocs/with_list/with_list'

const UserList = withList(BasicUserCard, entry => ({ user: entry }))
const BlockListWithLoadMore = withLoadMore(
  UserList,
  (props, $store) => $store.dispatch('fetchBlocks'),
  (props, $store) => get($store.state.users.currentUser, 'blocks', [])
)

const UserSettings = {
  data () {
    return {
      newName: this.$store.state.users.currentUser.name,
      newBio: unescape(this.$store.state.users.currentUser.description),
      newLocked: this.$store.state.users.currentUser.locked,
      newNoRichText: this.$store.state.users.currentUser.no_rich_text,
      newDefaultScope: this.$store.state.users.currentUser.default_scope,
      hideFollows: this.$store.state.users.currentUser.hide_follows,
      hideFollowers: this.$store.state.users.currentUser.hide_followers,
      showRole: this.$store.state.users.currentUser.show_role,
      role: this.$store.state.users.currentUser.role,
      followList: null,
      followImportError: false,
      followsImported: false,
      enableFollowsExport: true,
      pickAvatarBtnVisible: true,
      bannerUploading: false,
      backgroundUploading: false,
      followListUploading: false,
      bannerPreview: null,
      backgroundPreview: null,
      bannerUploadError: null,
      backgroundUploadError: null,
      deletingAccount: false,
      deleteAccountConfirmPasswordInput: '',
      deleteAccountError: false,
      changePasswordInputs: [ '', '', '' ],
      changedPassword: false,
      changePasswordError: false,
      activeTab: 'profile'
    }
  },
  components: {
    StyleSwitcher,
    TabSwitcher,
    ImageCropper,
    'block-list': BlockListWithLoadMore
  },
  computed: {
    user () {
      return this.$store.state.users.currentUser
    },
    pleromaBackend () {
      return this.$store.state.instance.pleromaBackend
    },
    scopeOptionsEnabled () {
      return this.$store.state.instance.scopeOptionsEnabled
    },
    vis () {
      return {
        public: { selected: this.newDefaultScope === 'public' },
        unlisted: { selected: this.newDefaultScope === 'unlisted' },
        private: { selected: this.newDefaultScope === 'private' },
        direct: { selected: this.newDefaultScope === 'direct' }
      }
    },
    currentSaveStateNotice () {
      return this.$store.state.interface.settings.currentSaveStateNotice
    }
  },
  methods: {
    updateProfile () {
      const name = this.newName
      const description = this.newBio
      const locked = this.newLocked
      // Backend notation.
      /* eslint-disable camelcase */
      const default_scope = this.newDefaultScope
      const no_rich_text = this.newNoRichText
      const hide_follows = this.hideFollows
      const hide_followers = this.hideFollowers
      const show_role = this.showRole

      /* eslint-enable camelcase */
      this.$store.state.api.backendInteractor
        .updateProfile({
          params: {
            name,
            description,
            locked,
            // Backend notation.
            /* eslint-disable camelcase */
            default_scope,
            no_rich_text,
            hide_follows,
            hide_followers,
            show_role
            /* eslint-enable camelcase */
          }}).then((user) => {
            if (!user.error) {
              this.$store.commit('addNewUsers', [user])
              this.$store.commit('setCurrentUser', user)
            }
          })
    },
    changeVis (visibility) {
      this.newDefaultScope = visibility
    },
    uploadFile (slot, e) {
      const file = e.target.files[0]
      if (!file) { return }
      if (file.size > this.$store.state.instance[slot + 'limit']) {
        const filesize = fileSizeFormatService.fileSizeFormat(file.size)
        const allowedsize = fileSizeFormatService.fileSizeFormat(this.$store.state.instance[slot + 'limit'])
        this[slot + 'UploadError'] = this.$t('upload.error.base') + ' ' + this.$t('upload.error.file_too_big', {filesize: filesize.num, filesizeunit: filesize.unit, allowedsize: allowedsize.num, allowedsizeunit: allowedsize.unit})
        return
      }
      // eslint-disable-next-line no-undef
      const reader = new FileReader()
      reader.onload = ({target}) => {
        const img = target.result
        this[slot + 'Preview'] = img
      }
      reader.readAsDataURL(file)
    },
    submitAvatar (cropper) {
      const img = cropper.getCroppedCanvas().toDataURL('image/jpeg')
      return this.$store.state.api.backendInteractor.updateAvatar({ params: { img } }).then((user) => {
        if (!user.error) {
          this.$store.commit('addNewUsers', [user])
          this.$store.commit('setCurrentUser', user)
        } else {
          throw new Error(this.$t('upload.error.base') + user.error)
        }
      })
    },
    clearUploadError (slot) {
      this[slot + 'UploadError'] = null
    },
    submitBanner () {
      if (!this.bannerPreview) { return }

      let banner = this.bannerPreview
      // eslint-disable-next-line no-undef
      let imginfo = new Image()
      /* eslint-disable camelcase */
      let offset_top, offset_left, width, height
      imginfo.src = banner
      width = imginfo.width
      height = imginfo.height
      offset_top = 0
      offset_left = 0
      this.bannerUploading = true
      this.$store.state.api.backendInteractor.updateBanner({params: {banner, offset_top, offset_left, width, height}}).then((data) => {
        if (!data.error) {
          let clone = JSON.parse(JSON.stringify(this.$store.state.users.currentUser))
          clone.cover_photo = data.url
          this.$store.commit('addNewUsers', [clone])
          this.$store.commit('setCurrentUser', clone)
          this.bannerPreview = null
        } else {
          this.bannerUploadError = this.$t('upload.error.base') + data.error
        }
        this.bannerUploading = false
      })
      /* eslint-enable camelcase */
    },
    submitBg () {
      if (!this.backgroundPreview) { return }
      let img = this.backgroundPreview
      // eslint-disable-next-line no-undef
      let imginfo = new Image()
      let cropX, cropY, cropW, cropH
      imginfo.src = img
      cropX = 0
      cropY = 0
      cropW = imginfo.width
      cropH = imginfo.width
      this.backgroundUploading = true
      this.$store.state.api.backendInteractor.updateBg({params: {img, cropX, cropY, cropW, cropH}}).then((data) => {
        if (!data.error) {
          let clone = JSON.parse(JSON.stringify(this.$store.state.users.currentUser))
          clone.background_image = data.url
          this.$store.commit('addNewUsers', [clone])
          this.$store.commit('setCurrentUser', clone)
          this.backgroundPreview = null
        } else {
          this.backgroundUploadError = this.$t('upload.error.base') + data.error
        }
        this.backgroundUploading = false
      })
    },
    importFollows () {
      this.followListUploading = true
      const followList = this.followList
      this.$store.state.api.backendInteractor.followImport({params: followList})
        .then((status) => {
          if (status) {
            this.followsImported = true
          } else {
            this.followImportError = true
          }
          this.followListUploading = false
        })
    },
    /* This function takes an Array of Users
     * and outputs a file with all the addresses for the user to download
     */
    exportPeople (users, filename) {
      // Get all the friends addresses
      var UserAddresses = users.map(function (user) {
        // check is it's a local user
        if (user && user.is_local) {
          // append the instance address
          // eslint-disable-next-line no-undef
          user.screen_name += '@' + location.hostname
        }
        return user.screen_name
      }).join('\n')
      // Make the user download the file
      var fileToDownload = document.createElement('a')
      fileToDownload.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(UserAddresses))
      fileToDownload.setAttribute('download', filename)
      fileToDownload.style.display = 'none'
      document.body.appendChild(fileToDownload)
      fileToDownload.click()
      document.body.removeChild(fileToDownload)
    },
    exportFollows () {
      this.enableFollowsExport = false
      this.$store.state.api.backendInteractor
        .exportFriends({
          id: this.$store.state.users.currentUser.id
        })
        .then((friendList) => {
          this.exportPeople(friendList, 'friends.csv')
          setTimeout(() => { this.enableFollowsExport = true }, 2000)
        })
    },
    followListChange () {
      // eslint-disable-next-line no-undef
      let formData = new FormData()
      formData.append('list', this.$refs.followlist.files[0])
      this.followList = formData
    },
    dismissImported () {
      this.followsImported = false
      this.followImportError = false
    },
    confirmDelete () {
      this.deletingAccount = true
    },
    deleteAccount () {
      this.$store.state.api.backendInteractor.deleteAccount({password: this.deleteAccountConfirmPasswordInput})
        .then((res) => {
          if (res.status === 'success') {
            this.$store.dispatch('logout')
            this.$router.push({name: 'root'})
          } else {
            this.deleteAccountError = res.error
          }
        })
    },
    changePassword () {
      const params = {
        password: this.changePasswordInputs[0],
        newPassword: this.changePasswordInputs[1],
        newPasswordConfirmation: this.changePasswordInputs[2]
      }
      this.$store.state.api.backendInteractor.changePassword(params)
        .then((res) => {
          if (res.status === 'success') {
            this.changedPassword = true
            this.changePasswordError = false
            this.logout()
          } else {
            this.changedPassword = false
            this.changePasswordError = res.error
          }
        })
    },
    activateTab (tabName) {
      this.activeTab = tabName
    },
    logout () {
      this.$store.dispatch('logout')
      this.$router.replace('/')
    }
  }
}

export default UserSettings
