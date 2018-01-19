import cuid from 'cuid';
import filter from 'lodash/filter';
import find from 'lodash/find';
import SSEClient from '../../SSEClient';
import Vue from 'vue';
import VuexCollection from '../helpers/collection';

const { action, getter, state, mutation, build } = new VuexCollection('comments');

state({
  courseId: '',
  commentsFetched: {},
  sseClient: undefined
});

getter(function comments() {
  const activityId = this.rootGetters['course/activity'].id;
  return filter(this.state.items, c => c.activityId === activityId);
}, { global: true });

getter(function commentsCount() {
  return Object.keys(this.getters.comments).length;
});

getter(function commentsFetched() {
  const activityId = this.rootGetters['course/activity'].id;
  return !!this.state.commentsFetched[activityId];
});

mutation(function setCourseId(courseId) {
  this.state.courseId = courseId;
});

mutation(function setCommentsFetched(activityId) {
  Vue.set(this.state.commentsFetched, activityId, true);
});

mutation(function setSSEClient(subscription) {
  this.state.subscription = subscription;
});

mutation(function addComment(comment) {
  const userId = this.rootGetters['user'].id;
  const {activityId} = comment;
  if (userId === comment.authorId || !this.state.commentsFetched[activityId]) return;
  comment._cid = cuid();
  Vue.set(this.state.items, comment._cid, comment);
});

mutation(function updateComment(comment) {
  const existing = find(this.state.items, { id: comment.id });
  if (!existing) return;
  const { content, createdAt, updatedAt } = comment;
  const updated = Object.assign({}, existing, { content, createdAt, updatedAt });
  Vue.set(this.state.items, updated._cid, updated);
});

action(function fetch({ activityId }) {
  const { courseId } = this.rootState.route.params;
  let action = 'fetch';
  if (this.state.courseId !== courseId) {
    this.commit('setCourseId', courseId);
    action = 'reset';
  };
  this.api.fetch({ activityId })
    .then(result => this.commit(action, result))
    .then(result => this.commit('setCommentsFetched', activityId));
});

action(function subscribe() {
  const sseClient = new SSEClient(`/api/v1${this.state.$baseUrl}/subscribe`);
  if (this.state.sseClient) {
    this.state.sseClient.disconnect();
  }
  this.commit('setSSEClient', sseClient);
  sseClient.subscribe('comment_create', (comment) => this.commit('addComment', comment));
  sseClient.subscribe('comment_update', (comment) => this.commit('updateComment', comment));
  sseClient.subscribe('comment_delete', (comment) => this.commit('updateComment', comment));
});

action(function unsubscribe() {
  if (!this.state.sseClient) return;
  this.state.sseClient.close();
  this.commit('setSSEClient');
});

export default build();
