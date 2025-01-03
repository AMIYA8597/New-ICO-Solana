export const getRoundTypeString = (roundType) => {
  if (roundType.seedRound) return 'Seed Round';
  if (roundType.preIco) return 'Pre-ICO';
  if (roundType.publicIco) return 'Public ICO';
  return 'Unknown';
};

export const getRoundTypeFromString = (roundTypeString) => {
  switch (roundTypeString) {
    case 'SeedRound':
      return { seedRound: {} };
    case 'PreICO':
      return { preIco: {} };
    case 'PublicICO':
      return { publicIco: {} };
    default:
      throw new Error('Invalid round type');
  }
};
























// export const RoundType = {
//   SeedRound: { seedRound: {} },
//   PreICO: { preIco: {} },
//   PublicICO: { publicIco: {} }
// };

// export const getRoundTypeFromString = (roundTypeStr) => {
//   switch (roundTypeStr) {
//     case 'SeedRound':
//       return RoundType.SeedRound;
//     case 'PreICO':
//       return RoundType.PreICO;
//     case 'PublicICO':
//       return RoundType.PublicICO;
//     default:
//       return null;
//   }
// };

// export const getRoundTypeString = (roundType) => {
//   if (roundType.seedRound) return 'SeedRound';
//   if (roundType.preIco) return 'PreICO';
//   if (roundType.publicIco) return 'PublicICO';
//   return 'Unknown';
// };

