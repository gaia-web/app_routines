<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { provide, ref } from 'vue';
import { BeforeInstallPromptEvent } from './before-install-prompt-event';

let alreadyInstalled = false;
const beforeinstallpromptEvent = ref<BeforeInstallPromptEvent | null>(null);

provide('beforeinstallpromptEvent', beforeinstallpromptEvent);

self.addEventListener("appinstalled", () => {
  alreadyInstalled = true;
  beforeinstallpromptEvent.value = null;
});

self.addEventListener('beforeinstallprompt', async (event) => {
  if (alreadyInstalled || localStorage.getItem('havePromptedInstallation')) {
    return;
  }
  event.preventDefault();
  beforeinstallpromptEvent.value = event;
});
</script>
