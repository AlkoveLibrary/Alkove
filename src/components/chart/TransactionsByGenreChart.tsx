import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { TransactionsByGenre } from "types/book";
import "components/chart/register";

interface TransactionsByGenreChartProps {
  data: TransactionsByGenre;
  genreColors: Map<string, string>;
}

const TransactionsByGenreChart: React.FC<TransactionsByGenreChartProps> = ({
  data,
  genreColors,
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
          Transactions By Genre
        </Typography>
        <Box sx={{ height: 400 }}>
          <Pie
            data={{
              labels: data.map((entry) => entry.genre),
              datasets: [
                {
                  data: data.map((entry) => entry.count),
                  backgroundColor: data.map((entry) =>
                    genreColors.get(entry.genre),
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
                        text: `${entry.genre} - ${entry.count} (${entry.percentage}%)`,
                        fillStyle: genreColors.get(entry.genre),
                        strokeStyle: genreColors.get(entry.genre),
                        fontColor: textColor,
                        index,
                      })),
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const entry = data[context.dataIndex];
                      return `${entry.genre}: ${entry.count} (${entry.percentage}%)`;
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

export default TransactionsByGenreChart;
