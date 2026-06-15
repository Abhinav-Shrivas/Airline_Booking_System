import { useEffect, useState } from 'react';
import { subscribeFirstRequest } from '../api/axios';

export function useColdStartLoading() {
  const [isColdStart, setIsColdStart] = useState(false);

  useEffect(() => {
    return subscribeFirstRequest(setIsColdStart);
  }, []);

  return isColdStart;
}
