import Timeline from '../timeline/timeline.vue'
const ListTimeline = {
  data () {
    return {
      listId: null
    }
  },
  components: {
    Timeline
  },
  computed: {
    timeline () { return this.$store.state.statuses.timelines.list }
  },
  created () {
    this.listId = this.$route.params.id
    this.$store.dispatch('startFetchingTimeline', { timeline: 'list', listId: this.listId })
  },
  unmounted () {
    this.$store.dispatch('stopFetchingTimeline', 'list')
  }
}

export default ListTimeline
