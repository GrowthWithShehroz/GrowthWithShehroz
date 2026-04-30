import React from 'react';
import { View } from 'react-native';

import { env } from '@/config/env';
import { useAppStore } from '@/store/app';

let banner: any | null = null;
let bannerSize: any | null = null;

function loadBanner(): { Banner: any; Size: any } | null {
  if (banner) return { Banner: banner, Size: bannerSize };
  try {
    const m = require('react-native-google-mobile-ads');
    banner = m.BannerAd;
    bannerSize = m.BannerAdSize;
    return { Banner: banner, Size: bannerSize };
  } catch {
    return null;
  }
}

export function AdBanner() {
  const premium = useAppStore((s) => s.premium);
  if (premium) return null;
  const loaded = loadBanner();
  if (!loaded) return <View style={{ height: 0 }} />;
  const { Banner, Size } = loaded;
  return (
    <View style={{ alignItems: 'center', paddingVertical: 4 }}>
      <Banner
        unitId={env.admobBannerUnit}
        size={Size.ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}
