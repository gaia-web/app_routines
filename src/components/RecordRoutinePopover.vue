<template>
  <ion-content class="ion-padding">
    <h1>
      Rocord for
      <b>{{ routine?.value?.name }}</b>
    </h1>
    <ion-text :color="getCurrentValueColor()">{{
      getCurrentValueLabel()
    }}</ion-text>
    <p><i>on</i> {{ day?.toLocaleString(locale) }}</p>
    <ion-note v-if="getCurrentNotes()">
      <q>{{ getCurrentNotes() }}</q>
    </ion-note>
    <ion-button expand="block" fill="clear" @click="recordNotes()">Set Notes</ion-button>
    <ion-button expand="block" color="success" @click="recordValue(1)">Positive</ion-button>
    <ion-button expand="block" color="medium" @click="recordValue(0)">Neutral</ion-button>
    <ion-button expand="block" color="danger" @click="recordValue(-1)">Negative</ion-button>
    <ion-button expand="block" fill="outline" @click="recordValue(void 0)">Skip</ion-button>
    <ion-button expand="block" fill="outline" color="dark" @click="dismiss?.()">Cancel</ion-button>
  </ion-content>
</template>

<script setup lang="ts">
import { Routine } from "@/utils/app-data";
import { IonButton, IonContent, IonText, IonNote } from "@ionic/vue";
import { Temporal } from "@js-temporal/polyfill";
import { Ref, ref } from "vue";

const locale = ref(navigator.language ?? "en-US");

const props = defineProps({
  routine: Object as () => Ref<Routine>,
  day: Temporal.PlainDate,
  dismiss: Function,
});

const recordValue = (value?: number) => {
  const record = getRecord();
  if (!record) {
    return;
  }
  const key = props.day?.toString();
  if (!key) {
    return;
  }
  if (!props.routine?.value.records) {
    return;
  }
  // eslint-disable-next-line vue/no-mutating-props
  props.routine.value.records[key] = {
    ...record,
    value,
  };
  props.dismiss?.();
};

const recordNotes = () => {
  const record = getRecord();
  if (!record) {
    return;
  }
  const key = props.day?.toString();
  if (!key) {
    return;
  }
  if (!props.routine?.value.records) {
    return;
  }
  const notes = prompt("Write the notes here", getCurrentNotes());
  if (notes == null) {
    return;
  }
  props.routine.value.records[key] = {
    ...record,
    notes,
  };
}

const getCurrentValueColor = () => {
  const record = getRecord();
  if (!record) {
    return;
  }
  if (record.value == null) {
    return "medium";
  }
  if (record.value > 0) {
    return "success";
  }
  if (record.value < 0) {
    return "danger";
  }
  return "medium";
};

const getCurrentValueLabel = () => {
  const record = getRecord();
  if (!record) {
    return;
  }
  if (record.value == null) {
    return "Not recorded";
  }
  if (record.value === 0) {
    return "Neutral";
  }
  if (record.value > 0) {
    return "Positive";
  }
  if (record.value < 0) {
    return "Negative";
  }
  return;
};

const getCurrentNotes = () => {
  const record = getRecord();
  return record?.notes;
}

const getRecord = () => {
  const key = props.day?.toString();
  if (!key) {
    return;
  }
  if (!props.routine?.value.records) {
    return;
  }
  return props.routine.value.records[key] ?? {};
};
</script>
