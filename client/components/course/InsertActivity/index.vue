<template>
  <div>
    <div v-if="!showInput" @click="show" class="divider-wrapper">
      <div class="divider">
        <div class="action">
          <span class="mdi mdi-plus plus"></span>
        </div>
      </div>
    </div>
    <div v-else>
      <select-action
        v-if="!action"
        @selected="action => (this.action = action)"
        @close="hide">
      </select-action>
      <activity-browser
        v-else-if="action !== 'create'"
        :selectableLevels="supportedLevels"
        @selected="executeAction"
        @close="hide">
      </activity-browser>
      <create-activity
        v-else
        :parent="parent"
        :supportedLevels="supportedLevels"
        @create="executeAction"
        @close="hide">
      </create-activity>
    </div>
  </div>
</template>

<script>
import { getLevel } from 'shared/activities';
import { getOutlineChildren } from 'utils/activity';
import { mapActions, mapGetters } from 'vuex-module';

import ActivityBrowser from 'components/common/ActivityBrowser';
import calculatePosition from 'utils/calculatePosition';
import CreateActivity from './CreateActivity';
import filter from 'lodash/filter';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import SelectAction from './SelectAction';

export default {
  props: ['parent'],
  data() {
    return {
      showInput: false,
      action: null
    };
  },
  computed: {
    ...mapGetters(['activities']),
    ...mapGetters(['structure'], 'course'),
    supportedLevels() {
      if (!this.parent) return filter(this.structure, { level: 1 });
      const parentType = find(this.structure, { type: this.parent.type });
      const { level, subLevels = [] } = parentType;
      const cond = it => subLevels.includes(it.type) || (it.level === level);
      return filter(this.structure, cond);
    }
  },
  methods: {
    ...mapActions({ clone: 'clone', create: 'save' }, 'activities'),
    show() {
      this.showInput = true;
    },
    hide() {
      this.showInput = false;
      this.action = null;
    },
    executeAction(activity) {
      if (this.action === 'clone') {
        activity = {
          srcId: activity.id,
          srcCourseId: activity.courseId,
          type: activity.type
        };
      }
      activity.courseId = this.parent.courseId;
      activity.parentId = this.resolveParent(activity);
      activity.position = this.calculatePosition(activity);
      this[this.action](activity);
      if (this.parent.type !== activity.type) this.$emit('expand');
      this.hide();
    },
    isSameLevel(activity) {
      return getLevel(activity.type).level === getLevel(this.parent.type).level;
    },
    resolveParent(activity) {
      return this.isSameLevel(activity) ? this.parent.parentId : this.parent.id;
    },
    calculatePosition(activity) {
      const items = getOutlineChildren(this.activities, activity.parentId);
      const newPosition = findIndex(items, { id: this.parent.id });
      const isFirstChild = !this.isSameLevel(activity) || newPosition === -1;
      const context = { items, newPosition, isFirstChild, insert: true };
      return calculatePosition(context);
    }
  },
  components: { ActivityBrowser, CreateActivity, SelectAction }
};
</script>

<style lang="scss" scoped>
.divider-wrapper {
  width: 100%;
  padding: 7px 0;
  cursor: pointer;
  opacity: 0;

  &:hover {
    opacity: 1;
  }

  .divider {
    position: relative;
    width: 100%;
    height: 2px;
    background-color: #aaa;
    opacity: inherit;

    .action {
      position: absolute;
      top: -8px;
      right: -27px;
      height: 0;
      color: #aaa;
      font-size: 16px;
      text-align: left;
    }
  }

  .plus {
    padding: 0 5px;
    font-size: 20px;
    line-height: 20px;
  }
}
</style>
