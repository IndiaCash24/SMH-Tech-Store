import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../components/firebase';

export interface NavLink {
  label: string;
  url: string;
}

export interface SiteConfig {
  chatLink: string;
  telegramLink?: string;
  aboutLink?: string;
  supportLink?: string;
  contactLink?: string;
  communityLink?: string;
  navLinks: NavLink[];
}

const CONFIG_DOC = 'settings/config';

export const settingsService = {
  async getConfig(): Promise<SiteConfig | null> {
    const docRef = doc(db, CONFIG_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteConfig;
    }
    return null;
  },

  async updateConfig(config: SiteConfig) {
    const docRef = doc(db, CONFIG_DOC);
    await setDoc(docRef, config);
  },

  subscribeToConfig(callback: (config: SiteConfig) => void) {
    const docRef = doc(db, CONFIG_DOC);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as SiteConfig);
      }
    });
  }
};
