<template>
  <div @selected="$emit('selected')" class="assessment-container">
    <div :class="typeInfo.class" class="assessment">
      <div>
        <div class="label assessment-type pull-left">{{ typeInfo.title }}</div>
        <span @click="close" class="btn btn-link pull-right">Collapse</span>
      </div>
      <question
        :assessment="assessment"
        :errors="errors"
        :isEditing="isEditing"
        @update="update">
      </question>
      <component
        :is="getComponentName(assessment)"
        :assessment="assessment.data"
        :errors="errors"
        :isEditing="isEditing"
        @update="update"
        @alert="setAlert">
      </component>
      <div class="form-group">
        <span class="form-label">Hint</span>
        <input
          v-model="assessment.data.hint"
          :disabled="!isEditing"
          class="form-control"
          type="text"
          placeholder="Optional hint">
      </div>
      <div class="alert-container">
        <div v-show="alert.text" :class="alert.type" class="alert">
          <strong>{{ alert.text }}</strong>
        </div>
      </div>
      <controls
        :isEditing="isEditing"
        @cancel="cancel"
        @save="save"
        @remove="remove"
        @edit="edit">
      </controls>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import Controls from './Controls';
import FillBlank from './FillBlank';
import MultipleChoice from './MultipleChoice';
import NumericalResponse from './NumericalResponse';
import SingleChoice from './SingleChoice';
import TextResponse from './TextResponse';
import TrueFalse from './TrueFalse';
import { typeInfo, schemas } from 'utils/assessment';
import Question from './Question';

const saveAlert = { text: 'Question saved !', type: 'alert-success' };
const validationOptions = { recursive: true, abortEarly: false };

const ASSESSMENT_TYPES = {
  MC: 'multiple-choice',
  SC: 'single-choice',
  TF: 'true-false',
  NR: 'numerical-response',
  TR: 'text-response',
  FB: 'fill-blank'
};

export default {
  name: 'te-assessment',
  props: { element: Object },
  data() {
    const assessment = cloneDeep(this.element);
    return {
      assessment,
      isEditing: !assessment.id,
      alert: {},
      errors: []
    };
  },
  computed: {
    schema() {
      return schemas[this.assessment.data.type] || {};
    },
    typeInfo() {
      return typeInfo[this.assessment.data.type] || {};
    }
  },
  methods: {
    getComponentName(assessment) {
      return ASSESSMENT_TYPES[assessment.data.type];
    },
    setAlert(data = {}) {
      this.alert = data;
    },
    validate(question) {
      return this.schema.validate(question, validationOptions);
    },
    update(data) {
      Object.assign(this.assessment.data, data);
    },
    save() {
      this.errors = [];
      this.validate(this.assessment.data)
        .then(() => {
          this.isEditing = false;
          this.setAlert(saveAlert);
          this.$emit('save', cloneDeep(this.assessment));
        })
        .catch(err => err.inner.forEach(it => this.errors.push(it.path)));
    },
    cancel() {
      Object.assign(this.assessment, cloneDeep(this.initAssessment));
      this.isEditing = false;
      this.setAlert();
      this.errors = [];
    },
    close() {
      this.$emit('selected');
    },
    edit() {
      this.isEditing = true;
    },
    remove() {
      this.$emit('remove');
    }
  },
  components: {
    MultipleChoice,
    SingleChoice,
    TrueFalse,
    NumericalResponse,
    TextResponse,
    FillBlank,
    Question,
    Controls
  }
};
</script>

<style lang="scss" scoped>
.assessment {
  min-height: 400px;
  margin: 10px auto;
  padding: 10px 30px 30px 30px;
  background-color: white;
  overflow: hidden;

  .alert {
    display: inline-block;
    margin: 0 auto;
    padding: 3px 7px;
    text-align: center;
  }

  .assessment-type {
    margin: 10px 0 50px 0;
    padding: 4px 15px;
    font-size: 13px;
    background-color: #707070;
    border-radius: 1px;
  }

  .form-group {
    text-align: left;
    margin: 0 auto;
    padding: 25px 20px 15px 20px;
    width: 100%;
    overflow: hidden;
  }

  .form-label {
    font-size: 20px;
  }

  input.form-control {
    padding-left: 10px;
  }
}
</style>