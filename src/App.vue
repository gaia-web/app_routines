<template>
  <ion-app>
    <ion-router-outlet />
    <ion-toast :is-open="isInstallationPromptOpen"
      message="This app can be installed on your device for a better user experience." :duration="5000"
      :buttons="installationPromptButtons"></ion-toast>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonToast } from '@ionic/vue';
import { ref } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

let alreadyInstalled = false;
let installPrompt: BeforeInstallPromptEvent | null = null;

const isInstallationPromptOpen = ref(true);
const installationPromptButtons = [
  {
    text: 'Install',
    role: 'info',
    handler: async () => {
      await installPrompt?.prompt();
    },
  },
  {
    text: 'Dismiss',
    role: 'cancel'
  },
];

self.addEventListener("appinstalled", () => {
  alreadyInstalled = true;
});

self.addEventListener('beforeinstallprompt', async (event) => {
  if (alreadyInstalled) {
    return;
  }
  event.preventDefault();
  installPrompt = event;
});
</script>
