const TIME_ZONE = "Asia/Kolkata";

export const formatCreatedAt = (date) => {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  const day = parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    timeZone: TIME_ZONE,
  });

  const month = parsedDate.toLocaleDateString("en-IN", {
    month: "long",
    timeZone: TIME_ZONE,
  });

  const year = parsedDate.toLocaleDateString("en-IN", {
    year: "numeric",
    timeZone: TIME_ZONE,
  });

  const weekday = parsedDate.toLocaleDateString("en-IN", {
    weekday: "long",
    timeZone: TIME_ZONE,
  });

  const time = parsedDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
  });

  return `${day} ${month} ${year}, ${weekday}, ${time}`;
};
