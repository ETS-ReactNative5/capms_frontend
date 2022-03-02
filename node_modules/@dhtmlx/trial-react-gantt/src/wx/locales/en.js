const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let data = {
  __dates: {
    months,
    days,
  },
};

export default function wrapper() {
  return {
    _(key) {
      return data[key] || key;
    },
    __(group, key) {
      const block = data[group];
      return block ? block[key] || key : key;
    },
    extend(values) {
      data = { ...data, ...values };
      return this;
    },
  };
}
