import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { BooksByGenre } from "types/book";
import "components/chart/register";

interface BooksByGenreChartProps {
  data: BooksByGenre;
  genreColors: Map<string, string>;
}

const BooksByGenreChart: React.FC<BooksByGenreChartProps> = ({
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
          Books By Genre
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

export default BooksByGenreChart;
