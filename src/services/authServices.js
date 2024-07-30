export const verifyEmail = async (email) => {
  await prismaClient.user.update({
    where: {
      email,
    },
    data: {
      verified: true,
    },
  });
};
