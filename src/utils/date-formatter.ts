export const dateFormatter = (dateTime: Date) => {
  const formatter = new Intl.DateTimeFormat("en-us", {
    timeStyle: "short",
    dateStyle: "medium",
  });
  return formatter.format(new Date(dateTime));
};
