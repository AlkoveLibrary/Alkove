import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { BooksCheckedOutBreakdown } from "types/book";
import "components/chart/register";

const STATUS_COLORS: Record<string, string> = {
  "Checked Out": "#0ca30c",
  "Never Checked Out": "#d03b3b",
};

interface BooksCheckedOutChartProps {
  data: BooksCheckedOutBreakdown;
}

const BooksCheckedOutChart: React.FC<BooksCheckedOutChartProps> = ({
  data,
}) => {
  const theme = useTheme();
  const textColor = theme.palette.text.secondary;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography
          variant="subtitle1"
          sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2 }}
        >
          Books Checked Out
        </Typography>
        <Box sx={{ height: 400 }}>
          <Pie
            data={{
              labels: data.map((entry) => entry.status),
              datasets: [
                {
                  data: data.map((entry) => entry.count),
                  backgroundColor: data.map(
                    (entry) => STATUS_COLORS[entry.status],
                  ),
                  borderColor: theme.palette.background.paper,
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "right",
                  labels: {
                    color: textColor,
                    generateLabels: () =>
                      data.map((entry, index) => ({
                        text: `${entry.status} - ${entry.count} (${entry.percentage}%)`,
                        fillStyle: STATUS_COLORS[entry.status],
                        strokeStyle: STATUS_COLORS[entry.status],
                        fontColor: textColor,
                        index,
                      })),
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const entry = data[context.dataIndex];
                      return `${entry.status}: ${entry.count} (${entry.percentage}%)`;
                    },
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

export default BooksCheckedOutChart;
