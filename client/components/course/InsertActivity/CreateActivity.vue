<template>
  <div class="create-activity">
    <span
      :class="{ 'has-error': vErrors.has('name') }"
      class="form-group name-input">
      <input
        v-model="name"
        v-focus.lazy="true"
        v-validate="{ rules: { required: true, min: 2, max: 250 } }"
        class="form-control"
        name="name"
        placeholder="Title">
      <span class="help-block">{{ vErrors.first('name') }}</span>
    </span>
    <multiselect
      v-if="supportedLevels.length > 1"
      v-model="level"
      v-validate="'required'"
      :options="supportedLevels"
      :searchable="false"
      trackBy="type"
      data-vv-value-path="type"
      data-vv-delay="0"
      class="type-select">
    </multiselect>
    <div class="actions">
      <button
        @click.stop="$emit('close')"
        class="btn btn-default btn-sm btn-material pull-right">X
      </button>
      <button
        :disabled="vErrors.any()"
        @click.stop="create"
        class="btn btn-default btn-sm btn-material add pull-right">
        Add
      </button>
    </div>
  </div>
</template>

<script>
import { focus } from 'vue-focus';
import { mapGetters } from 'vuex-module';
import { withValidation } from 'utils/validation';
import ActivityBrowser from 'components/common/ActivityBrowser';
import first from 'lodash/first';
import multiselect from 'components/common/Select';
import SelectAction from './SelectAction';

export default {
  mixins: [withValidation()],
  props: ['parent', 'supportedLevels'],
  data() {
    return { name: '', level: null };
  },
  computed: mapGetters(['structure'], 'course'),
  methods: {
    create() {
      this.$validator.validateAll().then(isValid => {
        if (!isValid) return;
        this.$emit('create', { type: this.level.type, data: { name: this.name } });
      });
    }
  },
  created() {
    this.level = first(this.supportedLevels);
  },
  directives: { focus },
  components: { multiselect, SelectAction, ActivityBrowser }
};
</script>

<style lang="scss" scoped>
.create-activity {
  display: flex;
  align-items: stretch;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 20px 5px;

  input {
    background-color: #e0e0e0;
  }

  .btn-sm.btn-material {
    min-width: 68px;
    padding: 8px 0;
  }

  .type-select {
    min-width: 170px;
    margin-left: 25px;
  }

  .actions {
    width: 150px;
    min-width: 150px;
    margin-left: 10px;
  }

  .name-input {
    width: 100%;
  }
}

.btn.add {
  margin-right: 3px;
}
</style>
