import { ROUND_TYPES, ICO_STATUS } from './constants';

export const getRoundType = (roundTypeObj) => {
  const key = Object.keys(roundTypeObj)[0];
  return ROUND_TYPES[key.toUpperCase()] || 'Unknown';
};

export const getIcoStatus = (isActive) => {
  return isActive ? ICO_STATUS.ACTIVE : ICO_STATUS.INACTIVE;
};

