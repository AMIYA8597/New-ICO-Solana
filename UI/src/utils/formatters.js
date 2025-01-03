export const formatUnixTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

export const formatSol = (lamports) => {
  return (lamports / 1e9).toFixed(4);
};

