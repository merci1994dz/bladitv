
import React from 'react';
import SyncErrorNotification from './SyncErrorNotification';

interface SyncErrorDisplayProps {
  syncError: string | null;
}

/**
 * SyncErrorDisplay component to display sync errors
 * This component simply passes the error to SyncErrorNotification
 */
const SyncErrorDisplay: React.FC<SyncErrorDisplayProps> = ({ syncError }) => {
  return <SyncErrorNotification syncError={syncError} />;
};

export default SyncErrorDisplay;
