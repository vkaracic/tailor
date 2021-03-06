<template>
  <div v-if="!hasItems" class="well">
    Use the toolbar to add the first item to the accordion.
  </div>
  <ul v-else class="accordion">
    <accordion-item
      v-for="it in items"
      :key="it.id"
      :item="it"
      :embeds="embeds"
      @save="saveItem"
      @delete="deleteItem">
    </accordion-item>
  </ul>
</template>

<script>
import AccordionItem from './AccordionItem';
import cloneDeep from 'lodash/cloneDeep';
import cuid from 'cuid';
import EventBus from 'EventBus';
import forEach from 'lodash/forEach';
import isEmpty from 'lodash/isEmpty';
import { mapActions } from 'vuex-module';
import omit from 'lodash/omit';

const appChannel = EventBus.channel('app');
const teChannel = EventBus.channel('te');

export default {
  name: 'te-accordion',
  props: ['element'],
  computed: {
    items() {
      return this.element.data.items;
    },
    embeds() {
      return this.element.data.embeds;
    },
    hasItems() {
      return !isEmpty(this.items);
    }
  },
  methods: {
    ...mapActions({ updateElement: 'update' }, 'tes'),
    saveItem({ item, element }) {
      let embeds = this.embeds;
      let items = this.items;

      if (element) {
        embeds = cloneDeep(embeds);
        embeds[element.id] = element;
      }

      if (item) {
        items = cloneDeep(items);
        items[item.id] = item;
      }

      this.$emit('save', { embeds, items });
    },
    deleteItem(itemId) {
      let embeds = cloneDeep(this.embeds);
      let items = cloneDeep(this.items);
      embeds = omit(embeds, Object.keys(items[itemId].body));
      delete items[itemId];
      this.$emit('save', { embeds, items });
    }
  },
  created() {
    teChannel.on(`${this.element._cid}/add`, () => {
      const element = cloneDeep(this.element);
      const id = cuid();
      element.data.items[id] = { id, header: 'Header', body: {} };
      this.updateElement(element);
    });

    appChannel.on('deleteElement', element => {
      if (!element.embedded || !this.embeds[element.id]) return;
      let embeds = cloneDeep(this.embeds);
      let items = cloneDeep(this.items);
      delete embeds[element.id];
      forEach(items, it => delete it.body[element.id]);
      this.$emit('save', { embeds, items });
    });
  },
  components: {
    AccordionItem
  }
};
</script>

<style lang="scss" scoped>
.accordion {
  margin: 0;
  padding-left: 0;
  border: 1px solid #ddd;
  border-bottom: none;
  list-style-type: none;
}
</style>
