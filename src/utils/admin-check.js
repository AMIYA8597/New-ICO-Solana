export const isAdminWallet = (publicKey) => {
  const adminAddress = process.env.REACT_APP_OWNER_ADDRESS;
  return publicKey && publicKey.toBase58() === adminAddress;
};












// export const isAdminWallet = (publicKey) => {
//     const adminAddress = process.env.REACT_APP_OWNER_ADDRESS;
//     return publicKey && publicKey.toBase58() === adminAddress;
//   };
  
  