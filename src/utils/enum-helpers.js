export const RoundType = {
  SeedRound: { seedRound: {} },
  PreICO: { preIco: {} },
  PublicICO: { publicIco: {} }
};

export const getRoundTypeFromString = (roundTypeStr) => {
  switch (roundTypeStr) {
    case 'SeedRound':
      return RoundType.SeedRound;
    case 'PreICO':
      return RoundType.PreICO;
    case 'PublicICO':
      return RoundType.PublicICO;
    default:
      return null;
  }
};

export const getRoundTypeString = (roundType) => {
  if (roundType.seedRound) return 'SeedRound';
  if (roundType.preIco) return 'PreICO';
  if (roundType.publicIco) return 'PublicICO';
  return 'Unknown';
};







































// export const RoundType = {
//     SeedRound: { seedRound: {} },
//     PreICO: { preIco: {} },
//     PublicICO: { publicIco: {} }
//   };
  
//   export const getRoundTypeFromString = (roundTypeStr) => {
//     switch (roundTypeStr) {
//       case 'SeedRound':
//         return RoundType.SeedRound;
//       case 'PreICO':
//         return RoundType.PreICO;
//       case 'PublicICO':
//         return RoundType.PublicICO;
//       default:
//         return null;
//     }
//   };
  
//   export const getRoundTypeString = (roundType) => {
//     if (roundType.seedRound) return 'SeedRound';
//     if (roundType.preIco) return 'PreICO';
//     if (roundType.publicIco) return 'PublicICO';
//     return 'Unknown';
//   };
  
  