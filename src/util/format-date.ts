export const formatDate = (dateString: string | Date | null, day?: boolean) => {
  if (!dateString) return "-";
  if (typeof dateString === "string") {
    dateString = new Date(dateString);
  }

  if (day) {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
