'use client';
import { useEffect, useState } from 'react';
import {
  activityStorageNotice,
  subscribeActivityStorage,
} from '@/lib/demo/activity';
export function ActivityStorageNotice() {
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const update = () => setNotice(activityStorageNotice());
    update();
    return subscribeActivityStorage(update);
  }, []);
  return notice ? (
    <p role="status" className="notice">
      {notice}
    </p>
  ) : null;
}
