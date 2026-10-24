import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { getBranding, getMyBranding } from '../api/branding';
import { useAuth } from '../hooks/useAuth';
import { BRAND } from '../config/brand';

const DEFAULT_BRANDING = { ...BRAND, signature: null, hasLogo: false, hasSignature: false };

const BrandingContext = createContext({
  branding: DEFAULT_BRANDING,
  platformBranding: DEFAULT_BRANDING,
  appBranding: DEFAULT_BRANDING,
  loading: true,
  refresh: () => {},
  ownerScope: null,
  setOwnerScope: () => {},
});

function mapBranding(data) {
  if (!data) return DEFAULT_BRANDING;
  return {
    name: data.company_name || BRAND.name,
    tagline: data.company_slogan || BRAND.tagline,
    description: BRAND.description,
    logo: data.logo_url || BRAND.logo,
    mark: data.logo_mark_url || BRAND.mark,
    signature: data.signature_url || null,
    hasLogo: !!data.has_logo,
    hasSignature: !!data.has_signature,
  };
}

export function BrandingProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  // `branding` is the public/view brand (owner-scoped listing or the platform
  // brand), `platformBranding` is always the system owner's identity and
  // `appBranding` is the signed-in user's own (landlord) brand for the shell.
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [platformBranding, setPlatformBranding] = useState(DEFAULT_BRANDING);
  const [appBranding, setAppBranding] = useState(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);
  const [ownerScope, setOwnerScope] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const platformRes = await getBranding();
      const platform = mapBranding(platformRes.data.data || platformRes.data);
      setPlatformBranding(platform);

      if (ownerScope) {
        const scopedRes = await getBranding({ owner_id: ownerScope });
        setBranding(mapBranding(scopedRes.data.data || scopedRes.data));
      } else {
        setBranding(platform);
      }

      if (userId) {
        const appRes = await getMyBranding();
        setAppBranding(mapBranding(appRes.data.data || appRes.data));
      } else {
        setAppBranding(platform);
      }
    } catch {
      setBranding(DEFAULT_BRANDING);
      setPlatformBranding(DEFAULT_BRANDING);
      setAppBranding(DEFAULT_BRANDING);
    } finally {
      setLoading(false);
    }
  }, [ownerScope, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ branding, platformBranding, appBranding, loading, refresh, ownerScope, setOwnerScope }),
    [branding, platformBranding, appBranding, loading, refresh, ownerScope],
  );

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
