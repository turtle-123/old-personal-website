var beforeInstallPromptEvent:BeforeInstallPromptEvent|undefined = undefined;

const downloadMenuButton = document.getElementById('download-spa') as HTMLButtonElement|null;
const downloadStartButton = document.getElementById('download-application') as HTMLButtonElement|null;

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getInstalledRelatedApps#platform
 */
// if ((navigator as any).getInstalledRelatedApps) {
//   const installedApps:{id: string, platform:string, url: string, version: string }[] = await (navigator as any).getInstalledRelatedApps();
//   console.log(installedApps);
//   const nativeApp = installedApps.find(app => app.id === 'com.example.myapp');
// }


type UserChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<UserChoice>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

/**
 * https://www.youtube.com/watch?v=LWRdBywm4Zo
 */
window.addEventListener("beforeinstallprompt",(e: BeforeInstallPromptEvent)=>{
  e.preventDefault();
  beforeInstallPromptEvent=e;
})

function dispatchInstall() {
  if (beforeInstallPromptEvent) {
    beforeInstallPromptEvent.prompt()
    .then((choiceResult) => {
      if(choiceResult.outcome==="accepted") {
        if(downloadMenuButton) downloadMenuButton.setAttribute('hidden','');
      }
    })
    .catch((error)=>{
      console.error(error);
      if(downloadMenuButton) downloadMenuButton.setAttribute('hidden','');
    })
  }
} 

function getStandalone() {
  const isInWebAppiOS = ((window.navigator as any).standalone === true);
  const isInWebAppChrome = (window.matchMedia('(display-mode: standalone)').matches);
  return Boolean(isInWebAppiOS||isInWebAppChrome);
}

/**
 * - Only runs once. 
 * - Detects whether the single page application is downloaded, and if it is not 
 */
export default function detectSinglePageApplicationDesktop() {
  let displayMode = 'browser tab';
  if (getStandalone()) {
    displayMode = 'standalone';
  }
  if (displayMode!=='standalone' && ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) && beforeInstallPromptEvent) {
    if(downloadMenuButton&&downloadStartButton) {
      downloadMenuButton.removeAttribute('hidden');
      downloadStartButton.addEventListener('click',dispatchInstall)
    }
  } else {
    if(downloadMenuButton&&downloadStartButton) {
      downloadMenuButton.setAttribute('hidden','');
      downloadStartButton.removeEventListener('click',dispatchInstall)
    }
  }
}

export function detectSpaMobile() {
  if (downloadMenuButton&&!!!getStandalone()) {
    downloadMenuButton.removeAttribute('hidden');
  } else if (downloadMenuButton) {
    downloadMenuButton.setAttribute('hidden','');
  }
}