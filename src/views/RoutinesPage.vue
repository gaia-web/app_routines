<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>
          {{
            daysOfCurrentWeek?.at(0)
              ?.add({
                weeks: currentPageIndex + 1 - pageCount,
              })
              .toLocaleString(locale)
          }}
          <br />
          <ion-note>
            to {{
              daysOfCurrentWeek?.at(-1)
                ?.add({
                  weeks: currentPageIndex + 1 - pageCount,
                })
                .toLocaleString(locale)
            }}
          </ion-note>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="!editingViewEnabled" title="Previous Week" @click="swiperRef?.swiper.slidePrev()"
            :disabled="isFirstSlideActive">
            <ion-icon slot="icon-only" :icon="arrowBack"></ion-icon>
          </ion-button>
          <ion-button v-if="!editingViewEnabled" title="Next Week" @click="swiperRef?.swiper.slideNext()"
            :disabled="isLastSlideActive">
            <ion-icon slot="icon-only" :icon="arrowForward"></ion-icon>
          </ion-button>
          <ion-button title="Toggle View">
            <ion-icon slot="icon-only" :icon="calendar"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div style="
          min-height: 100%;
          display: grid;
          grid-template-rows: auto auto 1fr;
          grid-template-columns: 100%;
        ">
        <ion-header collapse="condense" style="grid-row: 1">
          <ion-toolbar>
            <ion-title>
              {{
                daysOfCurrentWeek?.at(0)
                  ?.add({
                    weeks: currentPageIndex + 1 - pageCount,
                  })
                  .toLocaleString(locale)
              }}
              -
              {{
                daysOfCurrentWeek?.at(-1)
                  ?.add({
                    weeks: currentPageIndex + 1 - pageCount,
                  })
                  .toLocaleString(locale)
              }}
            </ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-item style="
            position: sticky;
            z-index: 10;
            top: 0;
            width: 100%;
            grid-row: 2;
          ">
          <WeekHeader :days="getAdjustedDays(currentPageIndex + 1 - pageCount)" />
        </ion-item>
        <swiper-container ref="swiperRef" virtual="true" style="width: 100%; grid-row: 3"
          @swiperslidechangetransitionend="handleSlideChange">
          <swiper-slide v-for="i in pageCount" :key="i" :virtualIndex="i">
            <ion-list>
              <div v-if="appData?.routines?.length <= 0">
                Click bottom right + to add new routine.
              </div>
              <ion-reorder-group :disabled="!editingViewEnabled" @ionItemReorder="handleReorder">
                <ion-item v-for="(routine, index) in appData.routines" :key="routine.name">
                  <ion-checkbox v-if="editingViewEnabled" slot="start"
                    v-model="routineSelections[index]"></ion-checkbox>
                  <WeekItem :days="getAdjustedDays(i - pageCount)" :editingViewEnabled="editingViewEnabled"
                    v-model:routine="(appData as AppData).routines[index]" />
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              </ion-reorder-group>
            </ion-list>
          </swiper-slide>
        </swiper-container>
      </div>
      <ion-fab slot="fixed" horizontal="end" vertical="bottom" @click="toggleEditingView">
        <ion-fab-button title="fab-list-toggle">
          <ion-icon :icon="pencil"></ion-icon>
        </ion-fab-button>
        <ion-fab-list side="top">
          <ion-fab-button title="Add" @click="addRoutine">
            <ion-icon :icon="add"></ion-icon>
          </ion-fab-button>
          <ion-fab-button title="Delete" @click="deleteRoutines">
            <ion-icon :icon="trash"></ion-icon>
          </ion-fab-button>
        </ion-fab-list>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonList,
  IonItem,
  IonReorder,
  IonFabList,
  IonReorderGroup,
  IonCheckbox,
  IonNote,
  ItemReorderEventDetail,
  alertController,
  onIonViewDidEnter,
} from "@ionic/vue";
import {
  pencil,
  calendar,
  trash,
  add,
  arrowBack,
  arrowForward,
} from "ionicons/icons";
import WeekHeader from "@/components/WeekHeader.vue";
import WeekItem from "@/components/WeekItem.vue";
import { appStorage } from "@/utils/storage";
import { AppData, INITIAL_APP_DATA, Routine } from "@/utils/app-data";
import { STORAGE_KEYS } from "@/utils/constant";
import { watch, ref } from "vue";
import { deepUnref } from "vue-deepunref";
import {
  register as registerSwiper,
  type SwiperContainer,
} from "swiper/element/bundle";
import Swiper from "swiper";
import { getWeekDays, getFirstDayOfWeek } from "@/utils/day";
import { Temporal } from "@js-temporal/polyfill";

registerSwiper();

const locale = ref(navigator.language ?? "en-US");

const appData = ref<AppData>(INITIAL_APP_DATA);
const editingViewEnabled = ref(false);
const firstDayOfWeek = ref(Number.NaN);
const routineSelections = ref<boolean[]>([]);

const swiperRef = ref<SwiperContainer>();
const isFirstSlideActive = ref();
const isLastSlideActive = ref();
const pageCount = ref(5);
const daysOfCurrentWeek = ref<Temporal.PlainDate[]>([]);
const currentPageIndex = ref(0);

watch(editingViewEnabled, async (value) => {
  routineSelections.value = new Array(appData.value.routines.length);
  const swiper = swiperRef.value?.swiper;
  if (swiper) {
    swiper.allowTouchMove = !value;
  }
});

watch(
  appData,
  async () => {
    await saveAppData();
  },
  { deep: true }
);

watch(firstDayOfWeek, () => {
  daysOfCurrentWeek.value = getWeekDays(
    firstDayOfWeek.value && firstDayOfWeek.value > 0
      ? getFirstDayOfWeek(Temporal.Now.plainDateISO(), firstDayOfWeek.value)
      : void 0
  );
});

onIonViewDidEnter(async () => {
  appData.value = await appStorage.get(STORAGE_KEYS.APP_DATA);
  firstDayOfWeek.value = +(await appStorage.get(
    STORAGE_KEYS.FIRST_DAY_OF_WEEK
  ));
  const initializeSwiperIndex = () => {
    const swiper = swiperRef.value?.swiper;
    if (swiper?.activeIndex !== 0) {
      return;
    }
    if (!swiper) {
      setTimeout(() => {
        initializeSwiperIndex();
      });
      return;
    }
    swiper.slideTo(pageCount.value - 1, 0);
  };
  initializeSwiperIndex();
});

const toggleEditingView = () => {
  editingViewEnabled.value = !editingViewEnabled.value;
};

const addRoutine = async () => {
  const alert = await alertController.create({
    header: "Adding a new routine",
    message: "Enter the routine name",
    inputs: [{ name: "name", type: "text", placeholder: "Routine Name" }],
    buttons: [
      {
        text: "Cancel",
        role: "cancel",
      },
      {
        text: "Add",
        role: "confirm",
        handler: ({ name }) => {
          const routine = createNewRoutine(name);
          appData.value?.routines.push(routine);
        },
      },
    ],
  });

  await alert.present();
};

const handleSlideChange = ({ detail: [swiper] }: CustomEvent<[Swiper]>) => {
  currentPageIndex.value = swiper.activeIndex ?? 0;
  isFirstSlideActive.value = swiper.isBeginning;
  isLastSlideActive.value = swiper.isEnd;
  if (currentPageIndex.value < 3) {
    pageCount.value += 5;
    setTimeout(() => {
      swiper?.virtual.update(false);
      swiper?.slideTo(swiper.activeIndex + 5, 0);
    });
  }
};

const handleReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
  const { from, to } = event.detail;
  routineSelections.value.splice(
    to,
    0,
    routineSelections.value.splice(from, 1)[0]
  );
  appData.value.routines = event.detail.complete(appData.value?.routines);
};

const deleteRoutines = () => {
  appData.value.routines = appData.value.routines.filter(
    (_, i) => !routineSelections.value[i]
  );
};

const createNewRoutine = (name: string): Routine => {
  return { name, records: {} };
};

const saveAppData = async () => {
  await appStorage.set(STORAGE_KEYS.APP_DATA, deepUnref(appData));
};

const getAdjustedDays = (weekOffset: number) =>
  daysOfCurrentWeek.value.map((day) => day.add({ weeks: weekOffset }));
</script>
