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
              label="Color Theme"
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
            <ion-select label="First Day of Week" v-model="firstDayOfWeek">
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
            <ion-label> Import App Data (Local) </ion-label>
          </ion-item>
          <ion-item button @click="exportAppData">
            <ion-icon slot="start" :icon="saveOutline"></ion-icon>
            <ion-label> Export App Data (Local) </ion-label>
          </ion-item>
          <ion-item button @click="backupAppData">
            <ion-icon slot="start" :icon="cloudUploadOutline"></ion-icon>
            <ion-label> Backup App Data (OneDrive) </ion-label>
          </ion-item>
          <ion-item button @click="restoreAppData">
            <ion-icon slot="start" :icon="cloudDownloadOutline"></ion-icon>
            <ion-label> Restore App Data (OneDrive) </ion-label>
          </ion-item>
        </ion-item-group>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>About</ion-label>
          </ion-item-divider>
          <ion-item>
            <ion-icon slot="start" :icon="hammerOutline"></ion-icon>
            <ion-label> Version </ion-label>
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
  cloudDownloadOutline,
  cloudUploadOutline,
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
import { PublicClientApplication } from "@azure/msal-browser";

const APPROOT_API_ENDPOINT =
  "https://graph.microsoft.com/v1.0/me/drive/special/approot";

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

async function backupAppData() {
  if (
    !confirm(
      "This action would override your previous backup (if any) on your OneDrive, still proceed?"
    )
  ) {
    return;
  }
  const accessToken = await obtainAccessToken();
  const appData: AppData = await appStorage.get(STORAGE_KEYS.APP_DATA);
  const blob = new Blob([JSON.stringify(appData)]);
  const result = await fetch(
    `${APPROOT_API_ENDPOINT}:/routines.appdata.json:/content`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: blob,
    }
  ).then((res) => res.ok);
  if (!result) {
    alert("Fail to backup.");
  }
  alert("Backed up.");
}

async function restoreAppData() {
  if (
    !confirm("This action would override your local app data, still proceed?")
  ) {
    return;
  }
  const accessToken = await obtainAccessToken();
  const result = await fetch(
    `${APPROOT_API_ENDPOINT}:/routines.appdata.json:/content`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  ).then((res) => (res.ok ? res.json() : null));
  if (result == null) {
    alert("Fail to restore.");
    return;
  }
  // TODO add validation
  await appStorage.set(STORAGE_KEYS.APP_DATA, result);
  // TODO use ionic alert and show errors if happend
  alert("Restored");
}

async function obtainAccessToken() {
  const CLIENT_ID = "2b6b1fc8-6a79-4335-8771-f7e89d075145";
  const TENANT_ID = "consumers";
  const msalConfig = {
    auth: {
      clientId: CLIENT_ID,
      authority: `https://login.microsoftonline.com/${TENANT_ID}`,
      redirectUri: "http://localhost:5173/auth",
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
  };
  const msalInstance = new PublicClientApplication(msalConfig);
  await msalInstance.initialize();
  const loginRequest = {
    scopes: ["Files.ReadWrite.AppFolder"],
  };
  const loginResponse = await msalInstance.loginPopup(loginRequest);
  msalInstance.setActiveAccount(loginResponse.account);
  const tokenRequest = { ...loginRequest, account: loginResponse.account };
  const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);

  return tokenResponse.accessToken;
}
</script>
