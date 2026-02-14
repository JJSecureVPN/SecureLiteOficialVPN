import { useCallback, useState } from 'react';
import { callOne } from '../../api/vpnBridge';
import { isTermsAccepted, acceptTerms as acceptTermsStorage } from '@/core/utils';

export function useTermsState() {
  const [termsAccepted, setTermsAccepted] = useState(isTermsAccepted());

  const acceptTerms = useCallback(() => {
    acceptTermsStorage();
    setTermsAccepted(true);
    callOne(['DtAcceptTerms']);
  }, []);

  return { termsAccepted, acceptTerms };
}
