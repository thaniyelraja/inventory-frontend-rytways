const DateFormatter = ({ date }) => {
  if (!date) return "-";
  const value = new Date(date);
  return (
    value.toLocaleDateString("en-GB") +
    " | " +
    value.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );
};

export default DateFormatter;
