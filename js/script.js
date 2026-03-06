// Data found in chicago_crimes.csv has columns: Date, Primary Type, Year

const data = [d3.csv("data/chicago_crimes.csv")];
print("First row of data:", data[0][0]);
