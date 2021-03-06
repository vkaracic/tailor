<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-4 col-lg-3">
        <ul class="list-group">
          <li
            :class="{ selected: $route.name === 'course-info' }"
            @click="routeTo('course-info')"
            class="list-group-item">
            <span class="mdi mdi-wrench"></span>General
          </li>
          <li
            :class="{ selected: $route.name === 'user-management' }"
            @click="routeTo('user-management')"
            class="list-group-item">
            <span class="mdi mdi-account"></span>User Management
          </li>
          <li
            @click="downloadContentInventory"
            class="list-group-item">
            <span class="mdi mdi-download"></span>Knewton Inventory
          </li>
          <li
            @click="showCloneModal = true"
            class="list-group-item">
            <span class="mdi mdi-content-copy"></span>Clone repository
          </li>
        </ul>
        <div class="actions">
          <button
            @click.stop="showDeleteConfirmation"
            type="button"
            class="btn btn-danger btn-material btn-block btn-delete">
            <span class="mdi mdi-delete"></span>
            Delete repository
          </button>
        </div>
      </div>
      <div class="col-md-8 col-lg-9">
        <router-view></router-view>
      </div>
    </div>
    <clone-modal
      :show="showCloneModal"
      @close="showCloneModal = false">
    </clone-modal>
  </div>
</template>

<script>
import api from '../../../api/course';
import CloneModal from './CloneModal';
import EventBus from 'EventBus';
import General from './General';
import JSZip from 'jszip';
import { mapActions, mapGetters } from 'vuex-module';
import saveAs from 'save-as';
import UserManagement from './UserManagement';

const appChannel = EventBus.channel('app');

export default {
  data() {
    return { showCloneModal: false };
  },
  computed: {
    ...mapGetters(['isAdmin']),
    ...mapGetters(['course'], 'course')
  },
  methods: {
    ...mapActions({ removeCourse: 'remove' }, 'courses'),
    downloadContentInventory() {
      api.getContentInventory(this.$route.params.courseId)
        .then(response => JSZip.loadAsync(response))
        .then(zip => zip.generateAsync({ type: 'blob' }))
        .then(file => saveAs(file, 'Content Inventory.xlsx'));
    },
    showDeleteConfirmation() {
      appChannel.emit('showConfirmationModal', {
        type: 'course',
        item: this.course,
        action: () => this.removeCourse(this.course) && this.$router.push('/')
      });
    },
    routeTo(name) {
      this.$router.push({ name });
    }
  },
  components: {
    CloneModal,
    General,
    UserManagement
  }
};
</script>

<style lang="scss" scoped>
.row {
  margin: 60px 30px 5px;
}

.list-group {
  padding: 10px 10px 300px;
  line-height: 32px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.list-group-item {
  margin-bottom: 2px;
  padding: 10px;
  text-align: left;
  text-transform: uppercase;
  border: 0;
  cursor: pointer;

  &:hover, &.selected {
    background-color: #efefef;
  }
}

.mdi {
  margin-right: 13%;
  margin-left: 5%;
  font-size: 20px;
}

.actions {
  position: absolute;
  right: 15px;
  bottom: 20px;
  left: 15px;

  button {
    width: 80%;
    margin: 30px 10%;

    .mdi {
      margin-right: 5px;
      margin-left: 0;
    }
  }
}
</style>
