<template>
  <div class="RetweetButton">
    <button
      v-if="(visibility !== 'private' || isOwn) && visibility !== 'direct' && loggedIn"
      class="button-unstyled interactive"
      :class="status.repeated && '-repeated'"
      :title="$t('tool_tip.repeat')"
      @click.prevent="retweet()"
    >
      <FAIcon
        class="fa-scale-110 fa-old-padding"
        icon="retweet"
        :spin="animated"
      />
    </button>
    <span v-else-if="loggedIn">
      <FAIcon
        class="fa-scale-110 fa-old-padding"
        icon="lock"
        :title="$t('timeline.no_retweet_hint')"
      />
    </span>
    <a
      v-else
      class="button-unstyled interactive"
      target="_blank"
      role="button"
      :href="remoteInteractionLink"
    >
      <FAIcon
        class="fa-scale-110 fa-old-padding"
        icon="retweet"
        :title="$t('tool_tip.repeat')"
      />
    </a>
    <span
      v-if="!mergedConfig.hidePostStats && status.repeat_num > 0"
      class="no-event"
    >
      {{ status.repeat_num }}
    </span>
    <teleport to="#modal">
      <confirm-modal
        v-if="showingConfirmDialog"
        :title="$t('status.repeat_confirm_title')"
        :confirm-text="$t('status.repeat_confirm_accept_button')"
        :cancel-text="$t('status.repeat_confirm_cancel_button')"
        @accepted="doRetweet"
        @cancelled="hideConfirmDialog"
      >
        {{ $t('status.repeat_confirm') }}
        <scope-selector
          :user-default="userDefaultScope"
          :initial-scope="userDefaultScope"
          :on-scope-change="changeVis"
        />
      </confirm-modal>
    </teleport>
  </div>
</template>

<script src="./retweet_button.js" ></script>

<style lang="scss">
@import '../../_variables.scss';

.RetweetButton {
  display: flex;

  > :first-child {
    padding: 10px;
    margin: -10px -8px -10px -10px;
  }

  .action-counter {
    pointer-events: none;
    user-select: none;
  }

  .interactive {
    .svg-inline--fa {
      @media (prefers-reduced-motion: reduce) {
        animation: unset;
      }
      animation-duration: 0.6s;
    }

    &:hover .svg-inline--fa,
    &.-repeated .svg-inline--fa {
      color: $fallback--cGreen;
      color: var(--cGreen, $fallback--cGreen);
    }
  }
}
</style>
