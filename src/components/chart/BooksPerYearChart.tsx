import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
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

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography
          variant="subtitle1"
          sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2 }}
        >
          Books Per Year ({booksWithYearCount} books with year)
        </Typography>
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
                  borderColor: theme.palette.secondary.main,
                  backgroundColor: theme.palette.secondary.main,
                  pointBackgroundColor: theme.palette.secondary.main,
                  pointRadius: 4,
                  borderWidth: 2,
                  tension: 0.2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `${context.parsed.y} book${context.parsed.y === 1 ? "" : "s"}`,
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
                  grid: { color: gridColor },
                  ticks: { color: textColor, precision: 0 },
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
