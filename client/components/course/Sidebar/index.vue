<template>
  <div class="course-sidebar">
    <div v-if="activitySelected">
      <sidebar-header></sidebar-header>
      <sidebar-body></sidebar-body>
    </div>
    <div v-else class="placeholder">
      <h4>Outline Sidebar</h4>
      <div class="mdi mdi-arrow-left"></div>
      <div class="helper">
        Please create your first Item on the left to view and edit its details
        here.
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex-module';
import SidebarBody from './Body';
import SidebarHeader from './Header';

export default {
  computed: {
    ...mapGetters(['activity'], 'course'),
    activitySelected() {
      return !!this.activity._cid;
    }
  },
  components: {
    SidebarBody,
    SidebarHeader
  }
};
</script>

<style lang="scss" scoped>
.course-sidebar {
  position: absolute;
  right: 0;
  width: 420px;
  height: 100%;
  overflow: auto;
  text-align: left;
  border-top: 1px solid #e8e8e8;
  background-color: #fcfcfc;
}

.placeholder {
  margin-top: 50px;
  padding: 0 15px;
  color: #777;

  h4 {
    padding: 8px 0 18px;
    text-align: center;
    font-size: 19px;
  }

  .mdi {
    float: left;
    padding: 5px 20px 5px 12px;
    font-size: 20px;
  }

  .helper {
    width: 330px;
  }
}
</style>
