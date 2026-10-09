import { useCallback, useState } from 'react';
import { getAssociateId, setAssociateId as persistAssociateId } from '../lib/associateId.js';

export function useAssociateId() {
  const [associateId, setState] = useState(() => getAssociateId());

  const setAssociateId = useCallback((value) => {
    const saved = persistAssociateId(value);
    setState(saved);
    return saved;
  }, []);

  return { associateId, setAssociateId };
}
