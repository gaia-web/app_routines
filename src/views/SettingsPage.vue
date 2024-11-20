<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Settings</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Appearance</ion-label>
          </ion-item-divider>
          <ion-item width="full">
            <ion-icon slot="start" :icon="contrastOutline"></ion-icon>
            <ion-select
              :label="$t(message.settingColorTheme)"
              aria-label="theme"
              interface="popover"
              v-model="themeType"
            >
              <ion-select-option value="system">System</ion-select-option>
              <ion-select-option value="dark">Dark</ion-select-option>
              <ion-select-option value="light">Light</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-item-group>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>General</ion-label>
          </ion-item-divider>
          <ion-item>
            <ion-icon slot="start" :icon="settingsOutline"></ion-icon>
            <ion-select :label="$t(message.settingFirstDayofWeek)" v-model="firstDayOfWeek">
              <ion-select-option value="auto"
                >Auto (today as last day)</ion-select-option
              >
              <ion-select-option
                v-for="(day, index) in getWeekDays(
                  getFirstDayOfWeek(Temporal.Now.plainDateISO(), 1)
                ).map((date) => getWeekDayName(date, locale, 'long'))"
                :key="day"
                :value="index + 1"
                >{{ day }}</ion-select-option
              >
            </ion-select>
          </ion-item>
        </ion-item-group>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Data</ion-label>
          </ion-item-divider>
          <ion-item button @click="importAppData">
            <ion-icon slot="start" :icon="openOutline"></ion-icon>
            <ion-label> {{ $t(message.settingImportAppData) }} </ion-label>
          </ion-item>
          <ion-item button @click="exportAppData">
            <ion-icon slot="start" :icon="saveOutline"></ion-icon>
            <ion-label> {{ $t(message.settingExportAppData) }} </ion-label>
          </ion-item>
          <ion-item button>
            <ion-icon slot="start" :icon="syncOutline"></ion-icon>
            <ion-label> {{ $t(message.settingSyncAppData) }} </ion-label>
          </ion-item>
        </ion-item-group>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>About</ion-label>
          </ion-item-divider>
          <ion-item>
            <ion-icon slot="start" :icon="hammerOutline"></ion-icon>
            <ion-label> {{ $t(message.settingVersion) }} </ion-label>
            <ion-note slot="end" color="medium">0.0.0</ion-note>
          </ion-item>
        </ion-item-group>
      </ion-list>
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
  IonSelect,
  IonLabel,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonSelectOption,
  IonIcon,
  IonNote,
  IonList,
} from "@ionic/vue";
import {
  contrastOutline,
  hammerOutline,
  saveOutline,
  openOutline,
  settingsOutline,
  syncOutline,
} from "ionicons/icons";
import { ref, watch } from "vue";
import { STORAGE_KEYS } from "../utils/constant";
import { updateTheme } from "../utils/theme";
import { appStorage } from "@/utils/storage";
import { AppData } from "@/utils/app-data";
import { getWeekDays, getFirstDayOfWeek, getWeekDayName } from "@/utils/day";
import { Temporal } from "@js-temporal/polyfill";
import { message } from '../messages'

const locale = ref(navigator.language ?? "en-US");

const themeType = ref(
  (await appStorage.get(STORAGE_KEYS.THEME_TYPE)) ?? "system"
);
watch(themeType, async () => {
  await appStorage.set(STORAGE_KEYS.THEME_TYPE, themeType.value);
  updateTheme();
});

const firstDayOfWeek = ref(
  (await appStorage.get(STORAGE_KEYS.FIRST_DAY_OF_WEEK)) ?? "auto"
);
watch(firstDayOfWeek, async () => {
  await appStorage.set(STORAGE_KEYS.FIRST_DAY_OF_WEEK, firstDayOfWeek.value);
});

const importAppData = () => {
  const inputElement = document.createElement("input");
  inputElement.type = "file";
  inputElement.addEventListener("input", async () => {
    const file = inputElement.files?.[0];
    if (!file) {
      return;
    }
    // TODO add validation
    await appStorage.set(STORAGE_KEYS.APP_DATA, JSON.parse(await file.text()));
    // TODO use ionic alert and show errors if happend
    alert("Imported");
  });
  inputElement.click();
  inputElement.remove();
};

const exportAppData = async () => {
  const appData: AppData = await appStorage.get(STORAGE_KEYS.APP_DATA);
  const blob = new Blob([JSON.stringify(appData)]);
  const aElement = document.createElement("a");
  aElement.href = URL.createObjectURL(blob);
  aElement.download = "AppData.json";
  aElement.click();
};
</script>
