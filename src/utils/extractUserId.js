export const extractTaggedUserIds = (content) => {
  const userIdPattern = /@(\w+)/g;
  const matches = content.match(userIdPattern);
  return matches
    ? matches
        .map((match) => parseInt(match.slice(1), 10))
        .filter((id) => !isNaN(id))
    : [];
};
