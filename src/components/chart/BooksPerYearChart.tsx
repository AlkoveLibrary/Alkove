import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import { BooksPerInterval } from "types/book";
import "components/chart/register";

const INTERVAL_YEARS = 5;

interface BooksPerYearChartProps {
  data: BooksPerInterval;
  booksWithYearCount: number;
}

const BooksPerYearChart: React.FC<BooksPerYearChartProps> = ({
  data,
  booksWithYearCount,
}) => {
  const theme = useTheme();
  const gridColor = theme.palette.divider;
  const textColor = theme.palette.text.secondary;
  const [showTransactions, setShowTransactions] = useState(true);

  const booksColor = theme.palette.secondary.main;
  const transactionsColor = theme.palette.primary.main;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ color: booksColor, fontWeight: 700 }}
          >
            Books Per Year ({booksWithYearCount} books with year)
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showTransactions}
                onChange={(event) => setShowTransactions(event.target.checked)}
              />
            }
            label="Show Transactions"
          />
        </Box>
        <Box sx={{ height: 400 }}>
          <Line
            data={{
              labels: data.map(
                (entry) =>
                  `${entry.interval}-${entry.interval + INTERVAL_YEARS - 1}`,
              ),
              datasets: [
                {
                  label: "Books",
                  data: data.map((entry) => entry.count),
                  borderColor: booksColor,
                  backgroundColor: booksColor,
                  pointBackgroundColor: booksColor,
                  pointRadius: 4,
                  borderWidth: 2,
                  tension: 0.2,
                  yAxisID: "y",
                },
                ...(showTransactions
                  ? [
                      {
                        label: "Transactions",
                        data: data.map((entry) => entry.transactionCount),
                        borderColor: transactionsColor,
                        backgroundColor: transactionsColor,
                        pointBackgroundColor: transactionsColor,
                        pointRadius: 4,
                        borderWidth: 2,
                        borderDash: [6, 4],
                        tension: 0.2,
                        yAxisID: "y1",
                      },
                    ]
                  : []),
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: "index", intersect: false },
              plugins: {
                legend: {
                  display: showTransactions,
                  labels: { color: textColor },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const value = context.parsed.y;
                      const noun =
                        context.dataset.yAxisID === "y1"
                          ? "transaction"
                          : "book";
                      return `${value} ${noun}${value === 1 ? "" : "s"}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  grid: { color: gridColor },
                  ticks: { color: textColor },
                },
                y: {
                  beginAtZero: true,
                  position: "left",
                  grid: { color: gridColor },
                  ticks: { color: textColor, precision: 0 },
                  title: {
                    display: showTransactions,
                    text: "Books",
                    color: textColor,
                  },
                },
                y1: {
                  display: showTransactions,
                  beginAtZero: true,
                  position: "right",
                  grid: { drawOnChartArea: false },
                  ticks: { color: textColor, precision: 0 },
                  title: {
                    display: true,
                    text: "Transactions",
                    color: textColor,
                  },
                },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BooksPerYearChart;
